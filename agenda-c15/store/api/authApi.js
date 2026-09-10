import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { toAuthError } from "../../lib/authErrors";
import { getAuthConfig } from "../../lib/config";

const failure = () => ({ error: { status: "CUSTOM_ERROR", error: "L’authentification n’a pas été confirmée." } });
const isText = (value) => typeof value === "string" && value.trim().length > 0;

export const authApi = createApi({
  reducerPath: "authApi",
  baseQuery: fetchBaseQuery({ baseUrl: "", timeout: 10000 }),
  endpoints: (builder) => ({
    sign: builder.mutation({
      async queryFn(values, api, extraOptions, baseQuery) {
        const endpoint = values?.endpoint;
        if (!["signUp", "signInWithPassword"].includes(endpoint)) return failure();
        const email = typeof values?.email === "string" ? values.email.trim() : "";
        const password = values?.password;
        if (!email || email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ||
            typeof password !== "string" || password.length < 6 || password.length > 128) return failure();
        try {
          const { authUrl, apiKey } = getAuthConfig();
          const requestStartedAt = Date.now();
          const result = await baseQuery({
            url: `${authUrl}:${endpoint}?key=${encodeURIComponent(apiKey)}`,
            method: "POST",
            body: { email, password, returnSecureToken: true },
          });
          if (result.error) return { error: toAuthError(result.error) };
          const data = result.data;
          if (!data || typeof data !== "object" || Array.isArray(data) ||
              ![data.idToken, data.refreshToken, data.localId, data.email, data.expiresIn].every(isText) ||
              !/^[0-9]+$/.test(data.expiresIn) || !Number.isFinite(Number(data.expiresIn)) || Number(data.expiresIn) <= 0) return failure();
          return { data: { idToken: data.idToken, refreshToken: data.refreshToken,
            localId: data.localId, email: data.email, expiresIn: data.expiresIn, requestStartedAt } };
        } catch {
          return failure();
        }
      },
    }),
  }),
});

export const { useSignMutation } = authApi;
