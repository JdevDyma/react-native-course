import { useEffect } from "react";
import { Linking } from "react-native";
import { handleURLCallback } from "@stripe/stripe-react-native";
import { useFetchPublishableKeyQuery } from "../store/api/stripeApi";
import { ensureStripeReady, stripeReturnURL } from "../lib/stripeRuntime";
import { isStripeReturnURL } from "../lib/deepLinkPolicy";

export default function StripeBootstrap() {
  const query = useFetchPublishableKeyQuery(undefined, {
    skip: !process.env.EXPO_PUBLIC_STRIPE_URL?.trim(),
  });
  const publishableKey = query.currentData?.publishableKey;
  useEffect(() => {
    if (!publishableKey) return;
    let active = true;
    const seenURLs = new Set();
    async function receive(url) {
      if (!active || !isStripeReturnURL(url, stripeReturnURL()) || seenURLs.has(url)) return;
      seenURLs.add(url);
      if (seenURLs.size > 32) seenURLs.delete(seenURLs.values().next().value);
      try {
        await ensureStripeReady(publishableKey);
        if (active) await handleURLCallback(url);
      } catch {
        seenURLs.delete(url);
        // L'écran du panier présente l'erreur si l'initialisation reste impossible.
      }
    }
    const subscription = Linking.addEventListener("url", ({ url }) => { void receive(url); });
    void ensureStripeReady(publishableKey).catch(() => {});
    void Linking.getInitialURL().then(receive).catch(() => {});
    return () => { active = false; subscription.remove(); };
  }, [publishableKey]);
  return null;
}
