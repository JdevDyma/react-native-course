import { baseQueryWithReauth } from "./baseQueryWithReauth";
import { isSameProfileSession, profileTag } from "../../lib/profileSession";
import { normalizeCart } from "../../lib/cart";
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { getApiUrl } from "../../lib/config";

const failure = (error) => ({ error: { status: "CUSTOM_ERROR", error } });
const isRecord = (value) => value !== null && typeof value === "object" && !Array.isArray(value);
const isText = (value) => typeof value === "string" && value.trim().length > 0;

function isUserId(value) {
  return typeof value === "string" && value.length > 0 && value === value.trim()
    && !/[.#$\[\]\/\u0000-\u001f\u007f]/.test(value);
}

function idsOrEmpty(value) {
  if (value == null) return [];
  if (!Array.isArray(value) || !value.every(isUserId) || new Set(value).size !== value.length) {
    throw new Error("La liste d’identifiants est invalide.");
  }
  return [...value];
}


function profileText(value, maxLength) {
  if (value == null) return "";
  if (typeof value !== "string" || value.length > maxLength) throw new Error("Champ de profil invalide.");
  return value.trim();
}

function normalizeProfileFields(value) {
  const location = value.location ?? {};
  if (!isRecord(location)) throw new Error("Adresse invalide.");
  return {
    fullName: profileText(value.fullName, 60),
    location: {
      street: profileText(location.street, 120),
      postalCode: profileText(location.postalCode, 5),
      city: profileText(location.city, 90),
    },
  };
}

function validateFullName(value) {
  const fullName = profileText(value, 60);
  if (!fullName) throw new Error("Le nom est obligatoire.");
  return fullName;
}

function validateLocation(value) {
  if (!isRecord(value)) throw new Error("Adresse invalide.");
  const street = profileText(value.street, 120);
  const postalCode = profileText(value.postalCode, 5);
  const city = profileText(value.city, 90);
  if (!street || !city || !/^[0-9]{5}$/.test(postalCode)) throw new Error("Adresse incomplète ou invalide.");
  return { street, postalCode, city };
}

function normalizeProfile(value, id) {
  if (value === null) return null;
  if (!isRecord(value) || !isText(value.email)) throw new Error("Le profil est invalide.");
  return {
    id, email: value.email.trim(),
    ...normalizeProfileFields(value),
    favoritesIds: idsOrEmpty(value.favoritesIds),
    seenNotifsIds: idsOrEmpty(value.seenNotifsIds),
    cart: normalizeCart(value.cart),
  };
}

function validatePatch(argument) {
  if (!isRecord(argument) || !isUserId(argument.id)) throw new Error("Identifiant de profil invalide.");
  const { id, ...patch } = argument;
  const keys = Object.keys(patch);
  if (!keys.length || keys.some((key) => !["email", "favoritesIds", "seenNotifsIds", "cart", "fullName", "location"].includes(key))) {
    throw new Error("Champs de modification invalides.");
  }
  const result = {};
  for (const key of keys) {
    if (key === "email") {
      if (!isText(patch.email) || patch.email.trim().length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(patch.email.trim())) {
        throw new Error("Email invalide.");
      }
      result.email = patch.email.trim();
    } else if (key === "fullName") {
      result.fullName = validateFullName(patch.fullName);
    } else if (key === "location") {
      result.location = validateLocation(patch.location);
    } else if (key === "cart") {
      if (!isRecord(patch.cart)) throw new Error("Le panier est invalide.");
      result.cart = normalizeCart(patch.cart);
    } else {
      if (!Array.isArray(patch[key])) throw new Error("Une liste est attendue.");
      result[key] = idsOrEmpty(patch[key]);
    }
  }
  return { id, patch: result };
}

function validateSessionPatch(key, patch) {
  if (!key || !isUserId(key.userId) || !Number.isSafeInteger(key.generation) ||
      !isRecord(patch) || Object.hasOwn(patch, "id")) throw new Error("Modification invalide.");
  return validatePatch({ ...patch, id: key.userId }).patch;
}

const profileCompletions = new Map();
const pendingProfileStores = new WeakSet();

export function isUserWritePending(store) {
  return pendingProfileStores.has(store);
}

export async function updateUserData(store, key, buildPatch) {
  if (!isSameProfileSession(store.getState(), key) || typeof buildPatch !== "function") throw new Error("Session invalide.");
  if (pendingProfileStores.has(store)) throw new Error("Une modification est déjà en cours.");
  pendingProfileStores.add(store);
  let request;
  try {
    const current = userApi.endpoints.getUserById.select(key)(store.getState());
    if (current.status !== "fulfilled" || !current.data) throw new Error("Attendez la lecture du profil.");
    const patch = validateSessionPatch(key, buildPatch(current.data));
    if (!isSameProfileSession(store.getState(), key)) throw new Error("Session remplacée.");
    request = store.dispatch(userApi.endpoints.updateUser.initiate({ key, patch }));
    const completion = profileCompletions.get(request.requestId);
    const network = await request.unwrap().then(
      (data) => ({ ok: true, data }), () => ({ ok: false }),
    );
    const cache = completion ? await completion : { ok: false };
    if (!isSameProfileSession(store.getState(), key) || !network.ok || !cache.ok) {
      throw new Error("Modification non confirmée. Relisez le profil.");
    }
    return network.data;
  } finally {
    request?.reset();
    pendingProfileStores.delete(store);
  }
}

export const userApi = createApi({
  reducerPath: "userApi",
  baseQuery: baseQueryWithReauth,
  tagTypes: ["User"],
  endpoints: (builder) => ({
    getUserById: builder.query({
      async queryFn(key, api, extraOptions, baseQuery) {
        const result = await baseQuery({ key });
        if (result.error) return result;
        try { return { data: normalizeProfile(result.data, key.userId) }; }
        catch { return failure("Le profil est invalide."); }
      },
      providesTags: (result, error, key) => key && isUserId(key.userId) && Number.isSafeInteger(key.generation) ? [profileTag(key)] : [],
    }),
    updateUser: builder.mutation({
      async queryFn(argument, api, extraOptions, baseQuery) {
        try {
          const key = argument?.key;
          const patch = validateSessionPatch(key, argument?.patch);
          const result = await baseQuery({ key, method: "PATCH", body: patch });
          if (result.error) return result;
          // La réponse de succès confirme le patch déjà validé ; aucune donnée brute n’est conservée.
          return { data: patch };
        } catch { return failure("La modification du profil n’a pas été confirmée."); }
      },
      onQueryStarted(argument, { dispatch, getState, queryFulfilled, requestId }) {
        const key = argument?.key;
        let patchResult;
        let prepared = false;
        try {
          const patch = validateSessionPatch(key, argument?.patch);
          if (!isSameProfileSession(getState(), key)) throw new Error("Session remplacée.");
          patchResult = dispatch(userApi.util.updateQueryData("getUserById", key, (existingUser) => {
            if (existingUser) Object.assign(existingUser, patch);
          }));
          prepared = true;
        } catch {
          // queryFn et le coordinateur présenteront l’échec.
        }
        const completion = (async () => {
          try {
            await queryFulfilled;
            return { ok: prepared && isSameProfileSession(getState(), key) };
          } catch {
            if (isSameProfileSession(getState(), key)) {
              patchResult?.undo();
              dispatch(userApi.util.invalidateTags([profileTag(key)]));
            }
            return { ok: false };
          }
        })();
        profileCompletions.set(requestId, completion);
        void completion.then(() => profileCompletions.delete(requestId));
      },
    }),
    verifyStoredProfile: builder.mutation({
      async queryFn(key, api, extraOptions) {
        const auth = api.getState().auth;
        const current = () => !api.signal.aborted &&
          api.getState().auth.generation === key?.generation &&
          api.getState().auth.userId === key?.userId;
        const reject = () => failure("Le profil enregistré n’a pas été confirmé. Connectez-vous pour reprendre sa confirmation.");
        if (!key || !isUserId(key.userId) || !Number.isSafeInteger(key.generation) ||
            !current() || !isText(auth.idToken) || !Number.isSafeInteger(auth.expiresAt) ||
            Date.now() >= auth.expiresAt) return reject();
        try {
          const request = fetchBaseQuery({ baseUrl: getApiUrl(), timeout: 10000 });
          const result = await request({ url: `users/${encodeURIComponent(key.userId)}.json`,
            params: { auth: auth.idToken } }, api, extraOptions);
          if (!current() || result.error) return reject();
          const user = normalizeProfile(result.data, key.userId);
          if (!user) return reject();
          // Vérification provisoire uniquement : aucune création et aucun cache métier alimenté.
          return { data: { confirmed: true } };
        } catch { return reject(); }
      },
    }),
    createUser: builder.mutation({
      async queryFn(argument, api, extraOptions) {
        const generation = argument?.generation;
        const email = typeof argument?.email === "string" ? argument.email.trim() : "";
        const auth = api.getState().auth;
        const reject = (code = "PROFILE_FAILED") => ({ error: {
          status: "CUSTOM_ERROR", error: "Le profil n’a pas été confirmé.", code,
        } });
        const isCurrent = () => !api.signal.aborted &&
          api.getState().auth.generation === generation && api.getState().auth.userId === auth.userId;
        if (!Number.isSafeInteger(generation) || !isCurrent() || !isUserId(auth.userId) ||
            !isText(auth.idToken) || !email || email.length > 254 ||
            !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return reject();
        if (!Number.isSafeInteger(auth.expiresAt) || Date.now() >= auth.expiresAt) return reject("SESSION_EXPIRED");
        try {
          const request = fetchBaseQuery({ baseUrl: getApiUrl(), timeout: 10000 });
          const result = await request({
            url: `users/${encodeURIComponent(auth.userId)}.json`,
            method: "PUT", headers: { "if-match": "null_etag" },
            params: { auth: auth.idToken }, body: { email },
          }, api, extraOptions);
          if (!isCurrent()) return reject();
          if (result.error && result.error.status !== 412) return reject();
          const value = result.error?.status === 412 ? result.error.data : result.data;
          const user = normalizeProfile(value, auth.userId);
          if (!user) return reject();
          // Le conflit valide un profil existant, sans nouvelle écriture.
          return { data: user };
        } catch {
          return reject();
        }
      },
    }),
  }),
});

export const { useGetUserByIdQuery, useCreateUserMutation, useUpdateUserMutation } = userApi;
