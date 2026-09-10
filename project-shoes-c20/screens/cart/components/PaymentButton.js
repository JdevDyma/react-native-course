import { useEffect, useRef, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { useSelector, useStore } from "react-redux";
import { PaymentSheetError, useStripe } from "@stripe/stripe-react-native";
import { useFetchPublishableKeyQuery, useInitPaymentMutation,
  useLazyGetPaymentStatusQuery, useClearPaidCartMutation } from "../../../store/api/stripeApi";
import { getProfileKey, isSameProfileSession } from "../../../lib/profileSession";
import { ensureStripeReady, stripeReturnURL, acquirePayment } from "../../../lib/stripeRuntime";
import { readPendingPayment, rememberPendingPayment, forgetPendingPayment } from "../../../lib/pendingPayment";
import CustomButton from "../../../ui-components/buttons/CustomButton";
import PaymentSuccess from "./PaymentSuccess";
import { colors } from "../../../constants/colors";
import { spaces } from "../../../constants/spaces";

const resumable = (status) => ["requires_payment_method", "requires_confirmation", "requires_action"].includes(status);
const publicOrder = (value) => ({ orderId: value.orderId, status: value.status,
  paid: value.paid, amount: value.amount, currency: value.currency, cleanup: value.cleanup });

export default function PaymentButton({ profile, onBusyChange }) {
  const store = useStore();
  const key = getProfileKey(useSelector((state) => state.auth));
  const keyQuery = useFetchPublishableKeyQuery();
  const [initPayment] = useInitPaymentMutation();
  const [getStatus] = useLazyGetPaymentStatusQuery();
  const [clearPaidCart] = useClearPaidCartMutation();
  const { initPaymentSheet, presentPaymentSheet } = useStripe();
  const [order, setOrder] = useState(null);
  const [restored, setRestored] = useState(false);
  const [busy, setBusy] = useState(true);
  const [message, setMessage] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);
  const epoch = useRef(0);
  const running = useRef(false);
  const requests = useRef(new Set());

  useEffect(() => { onBusyChange(busy); }, [busy, onBusyChange]);

  async function resultOf(request) {
    requests.current.add(request);
    try { return await request.unwrap(); }
    finally {
      requests.current.delete(request);
      request.reset?.();
      request.unsubscribe?.();
    }
  }

  function current(attempt) {
    return epoch.current === attempt && key && isSameProfileSession(store.getState(), key);
  }

  async function acceptStatus(value, attempt) {
    if (!current(attempt)) return;
    if (value.status === "canceled") {
      const forgotten = await forgetPendingPayment(key.userId, value.orderId);
      if (!current(attempt)) return;
      if (!forgotten) throw new Error("La commande locale n'est pas confirmée.");
      setOrder(null);
      setMessage("Ce paiement a été annulé. Recréez les lignes concernées du panier avant une nouvelle commande.");
      return;
    }
    setOrder(publicOrder(value));
    if (value.paid) setShowSuccess(true);
  }

  async function restore(attempt) {
    const orderId = await readPendingPayment(key.userId);
    if (!current(attempt)) return;
    setRestored(true);
    if (orderId) {
      setOrder({ orderId, status: "unknown", paid: false });
      const value = await resultOf(getStatus({ key, orderId }, false));
      await acceptStatus(value, attempt);
    } else setOrder(null);
  }

  useEffect(() => {
    const attempt = ++epoch.current;
    setOrder(null);
    setRestored(false);
    setShowSuccess(false);
    setMessage("");
    setBusy(true);
    running.current = true;
    if (key) {
      void restore(attempt).catch(() => {
        if (current(attempt)) setMessage("La commande en cours n'a pas pu être vérifiée. Réessayez avant de payer.");
      }).finally(() => {
        if (current(attempt)) { running.current = false; setBusy(false); }
      });
    }
    return () => {
      epoch.current += 1;
      for (const request of requests.current) {
        request.abort();
        request.reset?.();
        request.unsubscribe?.();
      }
      requests.current.clear();
      onBusyChange(false);
    };
  }, [key?.userId, key?.generation]);

  async function run(operation) {
    if (!key || running.current || !isSameProfileSession(store.getState(), key)) return;
    const release = acquirePayment();
    if (!release) { setMessage("Une opération de paiement est déjà en cours."); return; }
    const attempt = epoch.current;
    running.current = true;
    setBusy(true);
    setMessage("");
    try { await operation(attempt); }
    catch (error) {
      if (current(attempt)) setMessage(typeof error?.error === "string" ? error.error :
        "L'opération n'est pas confirmée. Vérifiez la commande avant de réessayer.");
    } finally {
      release();
      if (current(attempt)) { running.current = false; setBusy(false); }
    }
  }

  async function pay(attempt) {
    let publishableKey = keyQuery.currentData?.publishableKey;
    if (!publishableKey || keyQuery.isError) {
      publishableKey = (await keyQuery.refetch().unwrap()).publishableKey;
    }
    await ensureStripeReady(publishableKey);
    if (!current(attempt)) return;
    const value = await resultOf(initPayment({ key, cart: profile.user.cart,
      ...(order ? { orderId: order.orderId } : {}) }));
    if (!current(attempt)) return;
    setOrder(publicOrder(value));
    // L'identifiant est conservé avant l'ouverture du formulaire, jamais ses secrets.
    await rememberPendingPayment(key.userId, value.orderId);
    if (!current(attempt)) return;
    if (value.paid || !resumable(value.status)) {
      await acceptStatus(value, attempt);
      return;
    }
    const initialized = await initPaymentSheet({
      merchantDisplayName: "Shoes",
      customerId: value.customerId,
      customerSessionClientSecret: value.customerSessionClientSecret,
      paymentIntentClientSecret: value.paymentIntentClientSecret,
      returnURL: stripeReturnURL(),
      allowsDelayedPaymentMethods: false,
    });
    if (!current(attempt)) return;
    if (initialized.error) throw new Error("Le formulaire n'a pas pu être préparé.");
    const result = await presentPaymentSheet();
    if (!current(attempt)) return;
    if (result.error) {
      setMessage(result.error.code === PaymentSheetError.Canceled
        ? "Le formulaire a été fermé. Vous pouvez reprendre cette commande."
        : "Le formulaire n'a pas confirmé le paiement. Vérifiez la commande.");
    }
    // Même la fermeture réussie du formulaire doit être confrontée au serveur.
    await acceptStatus(await resultOf(getStatus({ key, orderId: value.orderId }, false)), attempt);
  }

  function press() {
    void run(async (attempt) => {
      if (!restored) return restore(attempt);
      if (order?.paid) { setShowSuccess(true); return; }
      if (order && !resumable(order.status)) {
        return acceptStatus(await resultOf(getStatus({ key, orderId: order.orderId }, false)), attempt);
      }
      if (!profile.canWrite || (!order && !profile.user?.cart?.shoes?.length)) return;
      await pay(attempt);
    });
  }

  function closeSuccess() {
    void run(async (attempt) => {
      const value = await resultOf(clearPaidCart({ key, orderId: order.orderId }));
      if (!current(attempt)) return;
      setOrder(publicOrder(value));
      if (!value.paid || value.cleanup?.state !== "updated") {
        setShowSuccess(false);
        setMessage("Le paiement est confirmé, mais l'enregistrement du panier doit être vérifié. Relisez votre profil.");
        return;
      }
      if (!await forgetPendingPayment(key.userId, value.orderId)) throw new Error("Commande locale non confirmée.");
      if (!current(attempt)) return;
      setOrder(null);
      setShowSuccess(false);
      setMessage(value.cleanup.changed ? "Les lignes modifiées pendant le paiement ont été conservées. Vérifiez leurs quantités." : "");
    });
  }

  const amount = Number.isSafeInteger(order?.amount) ? `${(order.amount / 100).toFixed(2)} €` : "";
  const label = !restored ? "Vérifier la commande en cours" : order?.paid ? "Voir la confirmation" :
    order && resumable(order.status) ? `Reprendre le paiement de ${amount}` :
    order ? "Vérifier le paiement" : "Passer la commande";
  const disabled = busy || (!order && restored && (!profile.canWrite || !profile.user?.cart?.shoes?.length));
  return (
    <View>
      {order && !order.paid && <Text style={styles.message}>
        Cette commande utilise le panier enregistré lors de sa préparation{amount ? `, pour ${amount}` : ""}.
      </Text>}
      {!!message && <Text style={styles.message} accessibilityLiveRegion="polite">{message}</Text>}
      <CustomButton text={label} onPress={press} disabled={disabled} isLoading={busy} />
      {showSuccess && order?.paid && <PaymentSuccess onPress={closeSuccess} busy={busy} message={message} />}
    </View>
  );
}

const styles = StyleSheet.create({
  message: { color: colors.DARK, textAlign: "center", marginVertical: spaces.M },
});
