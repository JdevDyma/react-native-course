import { initStripe } from "@stripe/stripe-react-native";
import * as Linking from "expo-linking";
import { isRunningInExpoGo } from "expo";

let initialization = null;
let paymentOwner = null;

export function stripeReturnURL() {
  return Linking.createURL("stripe-redirect");
}

export function ensureStripeReady(publishableKey) {
  if (typeof publishableKey !== "string" || !publishableKey.startsWith("pk_test_")) {
    return Promise.reject(new Error("La clé publique de test est absente."));
  }
  if (initialization?.key === publishableKey) return initialization.promise;
  const previous = initialization?.promise ?? Promise.resolve();
  const entry = { key: publishableKey, promise: null };
  entry.promise = previous.catch(() => {}).then(() => initStripe({
    publishableKey,
    urlScheme: isRunningInExpoGo() ? Linking.createURL("/") : Linking.createURL(""),
  })).catch((error) => {
    if (initialization === entry) initialization = null;
    throw error;
  });
  initialization = entry;
  return entry.promise;
}

export function acquirePayment() {
  if (paymentOwner) return null;
  const owner = {};
  paymentOwner = owner;
  return () => { if (paymentOwner === owner) paymentOwner = null; };
}
