import { createApi, fakeBaseQuery } from "@reduxjs/toolkit/query/react";
import { stripeRequest, StripeRequestError } from "../../lib/stripeRequest";
import { isSameProfileSession, profileTag } from "../../lib/profileSession";
import { userApi } from "./userApi";

const text = (value) => typeof value === "string" && value.length > 0;
const failure = (error) => ({ error: {
  status: error instanceof StripeRequestError ? error.status : "CUSTOM_ERROR",
  error: error instanceof StripeRequestError ? error.message : "La réponse du paiement est invalide.",
} });

function orderPath(id) {
  if (typeof id !== "string" || !/^[a-f0-9]{64}$/.test(id)) throw new Error("Commande invalide.");
  return `orders/${id}`;
}

function paymentResult(value) {
  orderPath(value?.orderId);
  const statuses = ["preparing", "requires_payment_method", "requires_confirmation",
    "requires_action", "processing", "requires_capture", "canceled", "succeeded"];
  if (!statuses.includes(value.status) || typeof value.paid !== "boolean"
    || value.paid !== (value.status === "succeeded")) throw new Error("État invalide.");
  if (value.status !== "preparing" && (!Number.isSafeInteger(value.amount)
    || value.amount <= 0 || value.currency !== "eur")) throw new Error("Montant invalide.");
  let cleanup = null;
  if (value.cleanup != null) {
    if (!["started", "updated", "unconfirmed"].includes(value.cleanup.state)) {
      throw new Error("État du panier invalide.");
    }
    cleanup = { state: value.cleanup.state, changed: value.cleanup.changed === true };
  }
  return { orderId: value.orderId, status: value.status, paid: value.paid,
    ...(value.amount === undefined ? {} : { amount: value.amount, currency: value.currency }), cleanup };
}

export const stripeApi = createApi({
  reducerPath: "stripeApi",
  baseQuery: fakeBaseQuery(),
  keepUnusedDataFor: 0,
  endpoints: (builder) => ({
    fetchPublishableKey: builder.query({
      async queryFn(argument, api) {
        try {
          const value = await stripeRequest("stripe-key", api);
          if (!text(value?.publishableKey) || !value.publishableKey.startsWith("pk_test_")) {
            throw new Error("Clé publique invalide.");
          }
          return { data: { publishableKey: value.publishableKey } };
        } catch (error) { return failure(error); }
      },
    }),
    initPayment: builder.mutation({
      async queryFn({ key, cart, orderId }, api) {
        try {
          if (!key || !isSameProfileSession(api.getState(), key)) throw new Error("Session invalide.");
          if (orderId !== undefined) orderPath(orderId);
          const value = await stripeRequest("payment-sheet", api, { key, method: "POST",
            body: { cart, ...(orderId === undefined ? {} : { orderId }) } });
          const result = paymentResult(value);
          if (!result.paid && !["preparing", "processing", "requires_capture", "canceled"].includes(result.status)) {
            if (![value.customerId, value.customerSessionClientSecret, value.paymentIntentClientSecret].every(text)) {
              throw new Error("Paramètres du formulaire invalides.");
            }
            return { data: { ...result, customerId: value.customerId,
              customerSessionClientSecret: value.customerSessionClientSecret,
              paymentIntentClientSecret: value.paymentIntentClientSecret } };
          }
          return { data: result };
        } catch (error) { return failure(error); }
      },
    }),
    getPaymentStatus: builder.query({
      async queryFn({ key, orderId }, api) {
        try {
          if (!key || !isSameProfileSession(api.getState(), key)) throw new Error("Session invalide.");
          return { data: paymentResult(await stripeRequest(orderPath(orderId), api, { key })) };
        } catch (error) { return failure(error); }
      },
    }),
    clearPaidCart: builder.mutation({
      async queryFn({ key, orderId }, api) {
        try {
          if (!key || !isSameProfileSession(api.getState(), key)) throw new Error("Session invalide.");
          const value = await stripeRequest(`${orderPath(orderId)}/clear-cart`, api, { key, method: "POST" });
          return { data: paymentResult(value) };
        } catch (error) { return failure(error); }
        finally {
          if (key && isSameProfileSession(api.getState(), key)) {
            api.dispatch(userApi.util.invalidateTags([profileTag(key)]));
          }
        }
      },
    }),
  }),
});

export const { useFetchPublishableKeyQuery, useInitPaymentMutation,
  useLazyGetPaymentStatusQuery, useClearPaidCartMutation } = stripeApi;
