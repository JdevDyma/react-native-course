import { randomUUID } from "node:crypto";
import { CheckoutError, quoteCart, cartFingerprint, removeUnchangedPaidLines,
  assertMatchingIntent } from "./checkout-domain.mjs";

export function createCheckoutService({ stripe, database, catalog, now = Date.now }) {
  const orderRef = (uid, id) => database.ref(`stripeOrders/${uid}/${id}`);

  async function readOrder(uid, id) {
    if (!/^[a-f0-9]{64}$/.test(id)) throw new CheckoutError("Commande inconnue.", 404);
    const value = (await orderRef(uid, id).get()).val();
    if (!value || value.id !== id) throw new CheckoutError("Commande inconnue.", 404);
    return value;
  }

  async function confirm(uid, id) {
    const order = await readOrder(uid, id);
    if (!order.paymentIntentId) {
      return { orderId: id, status: "preparing", paid: false, cleanup: order.cleanup ?? null };
    }
    const intent = await stripe.paymentIntents.retrieve(order.paymentIntentId);
    assertMatchingIntent(intent, order, uid);
    const paid = intent.status === "succeeded";
    if (paid && !order.paidAt) {
      // Ne pas conserver la réponse Stripe entière ni son client_secret.
      await orderRef(uid, id).child("paidAt").transaction((value) => value ?? now());
    }
    return { orderId: id, status: intent.status, paid, amount: order.quote.amount,
      currency: order.quote.currency, cleanup: order.cleanup ?? null };
  }

  async function prepare(user, expectedCart, resumeId) {
    const uid = user.uid;
    let id;
    let order;
    if (resumeId !== undefined) {
      order = await readOrder(uid, resumeId);
      id = order.id;
    } else {
      const current = (await database.ref(`users/${uid}/cart`).get()).val();
      const quote = quoteCart(current, catalog);
      if (cartFingerprint(expectedCart) !== quote.fingerprint) {
        throw new CheckoutError("Le panier a changé. Actualisez-le avant de payer.", 409);
      }
      id = quote.fingerprint;
      const proposal = { id, nonce: randomUUID(), createdAt: now(), quote,
        email: typeof user.email === "string" ? user.email : "" };
      const reservation = await orderRef(uid, id).transaction((value) => value ?? proposal);
      order = reservation.snapshot.val();
    }
    const ref = orderRef(uid, id);
    if (!order || order.id !== id || !order.nonce) {
      throw new CheckoutError("La préparation de la commande n'est pas confirmée.", 503);
    }
    // Stripe peut oublier une clé d'idempotence après vingt-quatre heures.
    // Une création ancienne dont l'identifiant n'a pas été enregistré exige
    // une vérification dans le Dashboard, jamais une nouvelle création aveugle.
    if (!order.paymentIntentId && now() - order.createdAt >= 23 * 60 * 60 * 1000) {
      throw new CheckoutError("Une préparation ancienne doit être vérifiée sur le serveur.", 409);
    }
    if (!order.customerId) {
      const customer = await stripe.customers.create({
        ...(order.email ? { email: order.email } : {}), metadata: { userId: uid },
      }, { idempotencyKey: `${order.nonce}:customer` });
      await ref.child("customerId").transaction((value) => value ?? customer.id);
      order = await readOrder(uid, id);
      if (order.customerId !== customer.id) {
        throw new CheckoutError("Le client de la commande n'est pas confirmé.", 409);
      }
    }
    let intent;
    if (order.paymentIntentId) {
      intent = await stripe.paymentIntents.retrieve(order.paymentIntentId);
    } else {
      intent = await stripe.paymentIntents.create({
        amount: order.quote.amount, currency: order.quote.currency,
        customer: order.customerId, payment_method_types: ["card"],
        metadata: { userId: uid, orderId: id },
      }, { idempotencyKey: `${order.nonce}:payment` });
      assertMatchingIntent(intent, order, uid);
      await ref.child("paymentIntentId").transaction((value) => value ?? intent.id);
      order = await readOrder(uid, id);
      if (order.paymentIntentId !== intent.id) {
        throw new CheckoutError("Le paiement de la commande n'est pas confirmé.", 409);
      }
    }
    assertMatchingIntent(intent, order, uid);
    if (["succeeded", "processing", "requires_capture"].includes(intent.status)) {
      return confirm(uid, id);
    }
    if (intent.status === "canceled") {
      throw new CheckoutError("Ce paiement a été annulé sur le serveur. Recréez les lignes du panier avant une nouvelle commande.", 409);
    }
    const session = await stripe.customerSessions.create({
      customer: order.customerId,
      components: { mobile_payment_element: { enabled: true } },
    });
    return { orderId: id, status: intent.status, paid: false,
      amount: order.quote.amount, currency: order.quote.currency,
      customerId: order.customerId, customerSessionClientSecret: session.client_secret,
      paymentIntentClientSecret: intent.client_secret };
  }

  async function clearPaidCart(uid, id) {
    const payment = await confirm(uid, id);
    if (!payment.paid) throw new CheckoutError("Le paiement n'est pas encore confirmé.", 409);
    const order = await readOrder(uid, id);
    const ref = orderRef(uid, id).child("cleanup");
    const claim = randomUUID();
    const result = await ref.transaction((value) => value ?? { state: "started", claim });
    if (result.snapshot.val()?.claim !== claim) {
      return { ...payment, cleanup: result.snapshot.val() };
    }
    let changed = false;
    try {
      const update = await database.ref(`users/${uid}/cart`).transaction((current) => {
        // Un cache initialement vide doit pouvoir être confronté au serveur.
        if (current === null) { changed = false; return null; }
        const next = removeUnchangedPaidLines(current, order.quote.cart);
        changed = next.changed;
        return next.cart;
      });
      if (!update.committed) throw new Error("L'enregistrement du panier n'est pas confirmé.");
      const cleanup = { state: "updated", changed, finishedAt: now() };
      await ref.set(cleanup);
      return { ...payment, cleanup };
    } catch {
      // Une réponse perdue peut cacher une écriture réussie. Ne pas soustraire
      // une seconde fois et ne pas prétendre que l'enregistrement a échoué.
      const cleanup = { state: "unconfirmed", finishedAt: now() };
      await ref.set(cleanup).catch(() => {});
      return { ...payment, cleanup };
    }
  }

  async function receiveEvent(event) {
    if (!["payment_intent.succeeded", "payment_intent.processing",
      "payment_intent.payment_failed", "payment_intent.canceled"].includes(event.type)) return;
    const intent = event.data.object;
    const uid = intent.metadata?.userId;
    const id = intent.metadata?.orderId;
    if (typeof uid !== "string" || !uid || /[.#$\[\]\/\u0000-\u001f\u007f]/.test(uid)
      || typeof id !== "string" || !/^[a-f0-9]{64}$/.test(id)) return;
    const order = await readOrder(uid, id);
    if (intent.id !== order.paymentIntentId) {
      throw new CheckoutError("La notification ne correspond pas au paiement enregistré.", 409);
    }
    // Relire Stripe rend les événements répétés ou reçus hors ordre inoffensifs.
    await confirm(uid, id);
  }

  return { prepare, confirm, clearPaidCart, receiveEvent };
}
