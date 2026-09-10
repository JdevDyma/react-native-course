import { normalizeCart } from "../../lib/cart";
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { getApiUrl } from "../../lib/config";

const failure = (error) => ({ error: { status: "CUSTOM_ERROR", error } });
const isRecord = (value) => value !== null && typeof value === "object" && !Array.isArray(value);
const isText = (value) => typeof value === "string" && value.trim().length > 0;

function userRequest(arg, method = "GET") {
  const email = typeof arg?.email === "string" ? arg.email.trim() : "";
  return {
    url: "users.json", method, lookupEmail: email,
    ...(method === "POST" ? { body: { email } } : {}),
  };
}

async function usersBaseQuery(args, api, extraOptions) {
  const { lookupEmail, ...request } = args;
  if (!isText(lookupEmail) || lookupEmail.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(lookupEmail)) {
    return failure("Un email de démonstration valide est requis.");
  }
  try {
    const baseQuery = fetchBaseQuery({ baseUrl: getApiUrl(), timeout: 10000 });
    const result = await baseQuery(request, api, extraOptions);
    if (result.error) return result;
    if (request.method === "POST") {
      if (!isRecord(result.data) || !isText(result.data.name)) return failure("La création du profil n’a pas été confirmée.");
    } else if (result.data !== null) {
      if (!isRecord(result.data)) return failure("La réponse de l’annuaire est invalide.");
      const entries = Object.entries(result.data);
      if (entries.some(([id, user]) => !isText(id) || !isRecord(user) || !isText(user.email))) {
        return failure("La réponse de l’annuaire est invalide.");
      }
      if (entries.filter(([, user]) => user.email.trim() === lookupEmail).length > 1) {
        return failure("Plusieurs profils correspondent à cet email.");
      }
    }
    return result;
  } catch {
    return failure("La configuration réseau est invalide ou la requête a échoué.");
  }
}

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

async function profileRequest(request, api, extraOptions) {
  try {
    return await fetchBaseQuery({ baseUrl: getApiUrl(), timeout: 10000 })(request, api, extraOptions);
  } catch {
    return failure("La configuration réseau est invalide.");
  }
}

const profileCompletions = new Map();
const pendingProfileStores = new WeakSet();

export function isUserWritePending(store) {
  return pendingProfileStores.has(store);
}

export async function updateUserData(store, id, buildPatch) {
  if (!isUserId(id) || typeof buildPatch !== "function") throw new Error("Modification invalide.");
  if (pendingProfileStores.has(store)) throw new Error("Une modification est déjà en cours.");
  pendingProfileStores.add(store);
  let request;
  try {
    const current = userApi.endpoints.getUserById.select(id)(store.getState());
    if (current.status !== "fulfilled" || !current.data) throw new Error("Attendez la lecture du profil.");
    const { patch } = validatePatch({ ...buildPatch(current.data), id });
    request = store.dispatch(userApi.endpoints.updateUser.initiate({ id, ...patch }));
    const completion = profileCompletions.get(request.requestId);
    const network = await request.unwrap().then(
      (data) => ({ ok: true, data }), () => ({ ok: false }),
    );
    const cache = completion ? await completion : { ok: false };
    if (!network.ok || !cache.ok) throw new Error("Modification non confirmée. Relisez le profil.");
    return network.data;
  } finally {
    request?.reset();
    pendingProfileStores.delete(store);
  }
}

export const userApi = createApi({
  reducerPath: "userApi",
  baseQuery: usersBaseQuery,
  tagTypes: ["Users", "User"],
  endpoints: (builder) => ({
    getUserById: builder.query({
      async queryFn(id, api, extraOptions) {
        if (!isUserId(id)) return failure("Identifiant de profil invalide.");
        const result = await profileRequest({ url: `users/${encodeURIComponent(id)}.json` }, api, extraOptions);
        if (result.error) return result;
        try {
          return { data: normalizeProfile(result.data, id) };
        } catch (error) {
          return failure(error.message);
        }
      },
      providesTags: (result, error, id) => [{ type: "User", id }],
    }),
    updateUser: builder.mutation({
      async queryFn(argument, api, extraOptions) {
        try {
          const { id, patch } = validatePatch(argument);
          return await profileRequest({
            url: `users/${encodeURIComponent(id)}.json`, method: "PATCH", body: patch,
          }, api, extraOptions);
        } catch (error) {
          return failure(error.message);
        }
      },
      onQueryStarted(argument, { dispatch, queryFulfilled, requestId }) {
        let patchResult;
        try {
          const { id, patch } = validatePatch(argument);
          patchResult = dispatch(userApi.util.updateQueryData("getUserById", id, (existingUser) => {
            if (existingUser) Object.assign(existingUser, patch);
          }));
        } catch {
          // La validation de queryFn fournit l’erreur au déclencheur.
        }
        const completion = (async () => {
          try {
            await queryFulfilled;
            dispatch(userApi.util.invalidateTags(["Users"]));
            return { ok: true };
          } catch {
            patchResult?.undo();
            if (isUserId(argument?.id)) dispatch(userApi.util.invalidateTags([{ type: "User", id: argument.id }]));
            return { ok: false };
          }
        })();
        profileCompletions.set(requestId, completion);
        void completion.then(() => profileCompletions.delete(requestId));
      },
    }),

    getUser: builder.query({
      query: (arg) => userRequest(arg),
      transformResponse: (response, meta, { email }) => {
        const match = Object.entries(response ?? {}).find(([, user]) => user.email.trim() === email.trim());
        return match ? { id: match[0], email: match[1].email.trim() } : null;
      },
      providesTags: ["Users"],
    }),
    createUser: builder.mutation({
      query: (arg) => userRequest(arg, "POST"),
      transformResponse: (response) => ({ id: response.name.trim() }),
      invalidatesTags: (result, error) => error ? [] : ["Users"],
    }),
  }),
});

export const { useGetUserQuery, useLazyGetUserQuery, useGetUserByIdQuery, useCreateUserMutation, useUpdateUserMutation } = userApi;
