import { createHash } from "node:crypto";

export class CheckoutError extends Error {
  constructor(message, status = 400) {
    super(message);
    this.status = status;
  }
}

const record = (value) => value !== null && typeof value === "object" && !Array.isArray(value);
const identifier = (value) => typeof value === "string" && value.length > 0 && value.length <= 128
  && value === value.trim() && !/[.#$\[\]\/\u0000-\u001f\u007f]/.test(value);

export function toCents(value) {
  const result = Math.round(value * 100);
  if (typeof value !== "number" || !Number.isFinite(value) || value < 0
    || !Number.isSafeInteger(result) || Math.abs(value * 100 - result) > 0.000001) {
    throw new CheckoutError("Le montant du panier est invalide.");
  }
  return result;
}

export function readCart(value) {
  if (value == null) return { shoes: [], totalAmount: 0 };
  if (!record(value)) throw new CheckoutError("Le panier est invalide.");
  const input = value.shoes ?? [];
  if (!Array.isArray(input) || input.length > 100) {
    throw new CheckoutError("Le panier doit contenir au plus cent lignes.");
  }
  const seen = new Set();
  const shoes = input.map((line) => {
    if (!record(line) || !identifier(line.id) || seen.has(line.id) || !identifier(line.shoeId)
      || !Number.isInteger(line.variantIndex) || line.variantIndex < 0
      || !Number.isFinite(line.size) || line.size <= 0
      || !Number.isSafeInteger(line.quantity) || line.quantity < 1 || line.quantity > 99
      || typeof line.name !== "string" || !line.name.trim() || line.name.length > 200) {
      throw new CheckoutError("Une ligne du panier est invalide.");
    }
    seen.add(line.id);
    toCents(line.price);
    return { id: line.id, shoeId: line.shoeId, variantIndex: line.variantIndex,
      size: line.size, price: line.price, quantity: line.quantity, name: line.name.trim() };
  });
  const subtotal = sumLines(shoes);
  if (toCents(value.totalAmount) !== subtotal) {
    throw new CheckoutError("Le total ne correspond pas aux lignes du panier.", 409);
  }
  return { shoes, totalAmount: subtotal / 100 };
}

function sumLines(lines) {
  return lines.reduce((sum, line) => {
    const next = sum + toCents(line.price) * line.quantity;
    if (!Number.isSafeInteger(next)) throw new CheckoutError("Le montant est trop élevé.");
    return next;
  }, 0);
}

export function cartFingerprint(value) {
  const cart = readCart(value);
  const ordered = [...cart.shoes].sort((a, b) => a.id < b.id ? -1 : a.id > b.id ? 1 : 0);
  return createHash("sha256").update(JSON.stringify({ shoes: ordered, totalAmount: cart.totalAmount })).digest("hex");
}

export function quoteCart(value, catalog) {
  const cart = readCart(value);
  if (!cart.shoes.length) throw new CheckoutError("Le panier est vide.", 409);
  let subtotalCents = 0;
  for (const line of cart.shoes) {
    const product = catalog.find((item) => item.id === line.shoeId);
    const sizes = product?.variants?.[line.variantIndex]?.sizes;
    if (!product || !Array.isArray(sizes) || !sizes.includes(line.size)) {
      throw new CheckoutError("Une chaussure ou une taille n'est plus disponible.", 409);
    }
    if (!Number.isSafeInteger(product.priceCents) || product.priceCents <= 0) {
      throw new CheckoutError("Le catalogue du serveur est invalide.", 500);
    }
    if (toCents(line.price) !== product.priceCents) {
      throw new CheckoutError("Le prix a changé. Actualisez le panier avant de payer.", 409);
    }
    // Le prix facturé vient exclusivement du catalogue du serveur.
    subtotalCents += product.priceCents * line.quantity;
    if (!Number.isSafeInteger(subtotalCents)) throw new CheckoutError("Le montant est trop élevé.");
  }
  // Même règle que l'écran du panier : floor(sous-total en euros / 15) euros.
  const shippingCents = Math.floor(subtotalCents / 1500) * 100;
  const amount = subtotalCents + shippingCents;
  if (!Number.isSafeInteger(amount) || amount < 50 || amount > 99999999) {
    throw new CheckoutError("Le montant dépasse les limites du paiement de test.");
  }
  return { cart, fingerprint: cartFingerprint(cart), subtotalCents, shippingCents,
    amount, currency: "eur" };
}

export function removeUnchangedPaidLines(currentValue, purchasedValue) {
  const current = readCart(currentValue);
  const purchased = readCart(purchasedValue);
  const paidById = new Map(purchased.shoes.map((line) => [line.id, line]));
  let changed = false;
  const shoes = current.shoes.filter((line) => {
    const paid = paidById.get(line.id);
    if (!paid) return true;
    // Une ligne modifiée est conservée intégralement pour ne pas perdre un ajout.
    if (JSON.stringify(line) !== JSON.stringify(paid)) {
      changed = true;
      return true;
    }
    return false;
  });
  return { cart: { shoes, totalAmount: sumLines(shoes) / 100 }, changed };
}

export function assertMatchingIntent(intent, order, uid) {
  if (!intent || intent.livemode !== false || intent.amount !== order.quote.amount
    || intent.currency !== order.quote.currency || intent.metadata?.userId !== uid
    || intent.metadata?.orderId !== order.id || intent.customer !== order.customerId) {
    throw new CheckoutError("Le paiement ne correspond pas à cette commande.", 409);
  }
  if (intent.status === "succeeded" && intent.amount_received !== order.quote.amount) {
    throw new CheckoutError("Le montant encaissé ne correspond pas à cette commande.", 409);
  }
}
