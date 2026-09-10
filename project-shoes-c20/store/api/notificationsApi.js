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

function normalizeSeenNotifications(response) {
  if (response === null) return { id: null, notifIds: [] };
  if (typeof response !== "object" || Array.isArray(response)) {
    throw new Error("Le format de la liste est invalide.");
  }
  const entries = Object.entries(response);
  if (entries.length !== 1) throw new Error("Une seule liste de démonstration est attendue.");
  const [id, notifIds] = entries[0];
  if (!isKey(id) || !isList(notifIds) || notifIds.length === 0) {
    throw new Error("Le format de la liste est invalide.");
  }
  return { id, notifIds: [...notifIds] };
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

export function isNotificationWritePending(store) {
  return pendingStores.has(store);
}

export async function markNotificationSeen(store, notificationId) {
  if (!isKey(notificationId)) throw new Error("Identifiant de notification invalide.");
  if (pendingStores.has(store)) throw new Error("Une écriture est déjà en cours.");
  pendingStores.add(store);
  let request;
  try {
    // Lecture après acquisition : aucune liste capturée par un ancien rendu.
    const current = notificationsApi.endpoints.getAllSeenNotifications.select(undefined)(store.getState());
    if (current.status !== "fulfilled" || !current.data) {
      throw new Error("Attendez une lecture réussie des notifications.");
    }
    const { id, notifIds } = current.data;
    if (!isList(notifIds) || !(id === null ? notifIds.length === 0 : isKey(id))) {
      throw new Error("Le cache des notifications est invalide.");
    }
    if (notifIds.includes(notificationId)) return { alreadySeen: true };
    const nextIds = [...notifIds, notificationId];
    request = store.dispatch(id === null
      ? notificationsApi.endpoints.addSeenNotifications.initiate({ notificationId })
      : notificationsApi.endpoints.updateSeenNotifications.initiate({ id, notifIds: nextIds }));
    const completion = cacheCompletions.get(request.requestId);
    // Attendre le réseau ET le travail de cache, même après un rejet réseau.
    const network = await request.unwrap().then(
      (data) => ({ ok: true, data }),
      (error) => ({ ok: false, error }),
    );
    const cache = completion ? await completion : { ok: false };
    if (!network.ok || !cache.ok) throw new Error("L’opération n’a pas été confirmée. Relisez les notifications.");
    return network.data;
  } finally {
    request?.reset();
    pendingStores.delete(store);
  }
}

export const notificationsApi = createApi({
  reducerPath: "notificationsApi",
  baseQuery: firebaseBaseQuery,
  tagTypes: ["SeenNotifications"],
  endpoints: (build) => ({
    getAllSeenNotifications: build.query({
      async queryFn(argument, api, extraOptions, baseQuery) {
        const result = await baseQuery({ url: "notifications.json" });
        if (result.error) return result;
        try {
          return { data: normalizeSeenNotifications(result.data) };
        } catch (error) {
          return { error: { status: "CUSTOM_ERROR", error: error.message } };
        }
      },
      providesTags: ["SeenNotifications"],
    }),
    addSeenNotifications: build.mutation({
      async queryFn(argument, api, extraOptions, baseQuery) {
        const notificationId = argument?.notificationId;
        if (!isKey(notificationId)) return { error: { status: "CUSTOM_ERROR", error: "Identifiant de notification invalide." } };
        return baseQuery({
          url: "notifications.json", method: "POST", body: [notificationId],
          validateStatus: (response, body) => response.ok && isKey(body?.name),
        });
      },
      onQueryStarted(argument, { dispatch, queryFulfilled, requestId }) {
        trackCacheCompletion(requestId, async () => {
          try {
            const { data } = await queryFulfilled;
            await dispatch(notificationsApi.util.upsertQueryData("getAllSeenNotifications", undefined, {
              id: data.name, notifIds: [argument.notificationId],
            })).unwrap();
          } catch (error) {
            dispatch(notificationsApi.util.invalidateTags(["SeenNotifications"]));
            throw error;
          }
        });
      },
    }),
    updateSeenNotifications: build.mutation({
      async queryFn(argument, api, extraOptions, baseQuery) {
        if (!isKey(argument?.id) || !isList(argument?.notifIds) || argument.notifIds.length === 0) {
          return { error: { status: "CUSTOM_ERROR", error: "Liste de notifications invalide." } };
        }
        return baseQuery({
          url: `notifications/${encodeURIComponent(argument.id)}.json`, method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: argument.notifIds,
        });
      },
      onQueryStarted(argument, { dispatch, queryFulfilled, requestId }) {
        const valid = isKey(argument?.id) && isList(argument?.notifIds) && argument.notifIds.length > 0;
        const patch = valid ? dispatch(notificationsApi.util.updateQueryData("getAllSeenNotifications", undefined, (draft) => {
          draft.notifIds = [...argument.notifIds];
        })) : undefined;
        trackCacheCompletion(requestId, async () => {
          try {
            await queryFulfilled;
          } catch (error) {
            patch?.undo();
            dispatch(notificationsApi.util.invalidateTags(["SeenNotifications"]));
            throw error;
          }
        });
      },
    }),
  }),
});

export const { useGetAllSeenNotificationsQuery } = notificationsApi;
