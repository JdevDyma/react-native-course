import { getFirebaseServices } from "../firebaseConfig";
import { readSdkIdentity } from "./sdkSession";
import { isSameProfileSession } from "./profileSession";
import { renewSession } from "../store/slices/authSlice";

export class StripeRequestError extends Error {
  constructor(message, status = "CUSTOM_ERROR") {
    super(message);
    this.status = status;
  }
}

export async function stripeRequest(path, api, { key, method = "GET", body } = {}) {
  const controller = new AbortController();
  const abort = () => controller.abort();
  const timeout = setTimeout(abort, 20000);
  api.signal.addEventListener("abort", abort);
  const current = () => !api.signal.aborted && !controller.signal.aborted
    && (!key || isSameProfileSession(api.getState(), key));
  try {
    if (!current()) throw new StripeRequestError("La session de paiement a changé.", "SESSION_CHANGED");
    const base = process.env.EXPO_PUBLIC_STRIPE_URL?.trim();
    if (!base) throw new StripeRequestError("Le service de paiement n'est pas configuré.");
    const url = new URL(base.endsWith("/") ? base : `${base}/`);
    if (url.protocol !== "https:" || url.username || url.password || url.search || url.hash) {
      throw new StripeRequestError("L'adresse du service de paiement est invalide.");
    }
    const headers = { "Accept": "application/json" };
    if (body !== undefined) headers["Content-Type"] = "application/json";
    if (key) {
      const user = getFirebaseServices().auth.currentUser;
      if (!user || user.uid !== key.userId) {
        throw new StripeRequestError("Reconnectez-vous avant de payer.", "SESSION_CHANGED");
      }
      const identity = await readSdkIdentity(user);
      if (!current()) throw new StripeRequestError("La session de paiement a changé.", "SESSION_CHANGED");
      api.dispatch(renewSession({ ...key, ...identity }));
      headers.Authorization = `Bearer ${identity.idToken}`;
    }
    const response = await fetch(new URL(path, url).href, {
      method, headers, signal: controller.signal,
      ...(body === undefined ? {} : { body: JSON.stringify(body) }),
    });
    if (!current()) throw new StripeRequestError("La session de paiement a changé.", "SESSION_CHANGED");
    const value = await response.json();
    if (!current()) throw new StripeRequestError("La session de paiement a changé.", "SESSION_CHANGED");
    if (!response.ok) {
      const messages = {
        401: "La session n'est pas confirmée. Reconnectez-vous avant de payer.",
        409: "Le paiement ou le panier doit être vérifié. Actualisez leur état avant de réessayer.",
        429: "Le service est occupé. Patientez avant de réessayer.",
      };
      throw new StripeRequestError(messages[response.status]
        ?? "L'opération de paiement n'est pas confirmée.", response.status);
    }
    return value;
  } catch (error) {
    if (error instanceof StripeRequestError) throw error;
    throw new StripeRequestError("La réponse du service de paiement n'est pas confirmée. Vérifiez son état avant de réessayer.");
  } finally {
    clearTimeout(timeout);
    api.signal.removeEventListener("abort", abort);
  }
}
