import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { getApiUrl } from "../../lib/config";

async function firebaseBaseQuery(args, api, extraOptions) {
  try {
    const baseQuery = fetchBaseQuery({ baseUrl: getApiUrl(), timeout: 10000 });
    return await baseQuery(args, api, extraOptions);
  } catch {
    return { error: { status: "CUSTOM_ERROR", error: "Configuration réseau invalide." } };
  }
}

function isKey(value) {
  return typeof value === "string" && value.trim().length > 0;
}

function isList(value) {
  return Array.isArray(value) && value.every(isKey) && new Set(value).size === value.length;
}

function normalizeFavorites(response) {
  if (response === null) return { id: null, shoesIds: [] };
  if (typeof response !== "object" || Array.isArray(response)) {
    throw new Error("Le format de la liste est invalide.");
  }
  const entries = Object.entries(response);
  if (entries.length !== 1) throw new Error("Une seule liste de démonstration est attendue.");
  const [id, shoesIds] = entries[0];
  if (!isKey(id) || !isList(shoesIds) || shoesIds.length === 0) {
    throw new Error("Le format de la liste est invalide.");
  }
  return { id, shoesIds: [...shoesIds] };
}

const cacheCompletions = new Map();
const pendingStores = new WeakSet();

function trackCacheCompletion(requestId, operation) {
  // Enregistrée pendant onQueryStarted, avant le retour du déclenchement.
  const completion = Promise.resolve().then(operation).then(
    () => ({ ok: true }),
    (error) => ({ ok: false, error }),
  );
  cacheCompletions.set(requestId, completion);
  // Le gestionnaire appelant conserve sa propre référence à la promesse.
  void completion.then(() => cacheCompletions.delete(requestId));
}

export function isFavoriteWritePending(store) {
  return pendingStores.has(store);
}

export async function toggleFavorite(store, shoesId) {
  if (!isKey(shoesId)) throw new Error("Identifiant de chaussure invalide.");
  if (pendingStores.has(store)) throw new Error("Une écriture est déjà en cours.");
  pendingStores.add(store);
  let request;
  try {
    // Lecture après acquisition : aucune liste capturée par un ancien rendu.
    const current = favoritesApi.endpoints.getAllFavorites.select(undefined)(store.getState());
    if (current.status !== "fulfilled" || !current.data) {
      throw new Error("Attendez une lecture réussie des favoris.");
    }
    const { id, shoesIds } = current.data;
    if (!isList(shoesIds) || !(id === null ? shoesIds.length === 0 : isKey(id))) {
      throw new Error("Le cache des favoris est invalide.");
    }
    const nextIds = shoesIds.includes(shoesId)
      ? shoesIds.filter((value) => value !== shoesId)
      : [...shoesIds, shoesId];
    request = store.dispatch(id === null
      ? favoritesApi.endpoints.addFavorite.initiate({ shoesId })
      : favoritesApi.endpoints.updateFavorites.initiate({ id, shoesIds: nextIds }));
    const completion = cacheCompletions.get(request.requestId);
    // Attendre le réseau ET le travail de cache, même après un rejet réseau.
    const network = await request.unwrap().then(
      (data) => ({ ok: true, data }),
      (error) => ({ ok: false, error }),
    );
    const cache = completion ? await completion : { ok: false };
    if (!network.ok || !cache.ok) throw new Error("L’opération n’a pas été confirmée. Relisez les favoris.");
    return network.data;
  } finally {
    request?.reset();
    pendingStores.delete(store);
  }
}

export const favoritesApi = createApi({
  reducerPath: "favoritesApi",
  baseQuery: firebaseBaseQuery,
  tagTypes: ["Favorites"],
  endpoints: (build) => ({
    getAllFavorites: build.query({
      async queryFn(argument, api, extraOptions, baseQuery) {
        const result = await baseQuery({ url: "favoriteLists.json" });
        if (result.error) return result;
        try {
          return { data: normalizeFavorites(result.data) };
        } catch (error) {
          return { error: { status: "CUSTOM_ERROR", error: error.message } };
        }
      },
      providesTags: ["Favorites"],
    }),
    addFavorite: build.mutation({
      async queryFn(argument, api, extraOptions, baseQuery) {
        const shoesId = argument?.shoesId;
        if (!isKey(shoesId)) return { error: { status: "CUSTOM_ERROR", error: "Identifiant de chaussure invalide." } };
        return baseQuery({
          url: "favoriteLists.json", method: "POST", body: [shoesId],
          validateStatus: (response, body) => response.ok && isKey(body?.name),
        });
      },
      onQueryStarted(argument, { dispatch, queryFulfilled, requestId }) {
        trackCacheCompletion(requestId, async () => {
          try {
            const { data } = await queryFulfilled;
            await dispatch(favoritesApi.util.upsertQueryData("getAllFavorites", undefined, {
              id: data.name, shoesIds: [argument.shoesId],
            })).unwrap();
          } catch (error) {
            dispatch(favoritesApi.util.invalidateTags(["Favorites"]));
            throw error;
          }
        });
      },
    }),
    updateFavorites: build.mutation({
      async queryFn(argument, api, extraOptions, baseQuery) {
        if (!isKey(argument?.id) || !isList(argument?.shoesIds)) {
          return { error: { status: "CUSTOM_ERROR", error: "Liste de favoris invalide." } };
        }
        return baseQuery({
          url: `favoriteLists/${encodeURIComponent(argument.id)}.json`, method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(argument.shoesIds.length ? argument.shoesIds : null),
        });
      },
      onQueryStarted(argument, { dispatch, queryFulfilled, requestId }) {
        const valid = isKey(argument?.id) && isList(argument?.shoesIds);
        const patch = valid ? dispatch(favoritesApi.util.updateQueryData("getAllFavorites", undefined, (draft) => {
          draft.id = argument.shoesIds.length ? argument.id : null;
          draft.shoesIds = [...argument.shoesIds];
        })) : undefined;
        trackCacheCompletion(requestId, async () => {
          try {
            await queryFulfilled;
          } catch (error) {
            patch?.undo();
            dispatch(favoritesApi.util.invalidateTags(["Favorites"]));
            throw error;
          }
        });
      },
    }),
  }),
});

export const { useGetAllFavoritesQuery } = favoritesApi;
