import { fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { getApiUrl } from "./config";
import { isSameProfileSession } from "./profileSession";

const request = fetchBaseQuery({ timeout: 10000 });
const failure = (status) => ({ error: { status, data: "Requête du profil non confirmée." } });

// Le service valide et projette le patch avant cet appel.
export async function profileBaseQuery(args, api, extraOptions) {
  const { key, method = "GET", body } = args;
  if (api.signal.aborted || !isSameProfileSession(api.getState(), key)) {
    return failure("SESSION_CHANGED");
  }
  if (method !== "GET" && method !== "PATCH") return failure("INVALID_METHOD");
  const auth = api.getState().auth;
  if (!Number.isSafeInteger(auth.expiresAt)) return failure("INVALID_SESSION");
  // Le serveur évalue la validité du jeton ; son 401 déclenche le traitement commun.
  const token = auth.idToken;
  let result;
  try {
    result = await request({
      url: `${getApiUrl()}/users/${encodeURIComponent(key.userId)}.json`,
      method,
      params: { auth: token },
      ...(method === "PATCH" ? { body } : {}),
    }, api, extraOptions);
  } catch {
    return failure("REQUEST_FAILED");
  }
  if (api.signal.aborted || !isSameProfileSession(api.getState(), key)) {
    return failure("SESSION_CHANGED");
  }
  if (result.error) {
    const status = result.error.status;
    return failure(typeof status === "number" ||
      status === "FETCH_ERROR" || status === "TIMEOUT_ERROR" ? status : "REQUEST_FAILED");
  }
  // Ne pas propager meta, qui peut contenir l’URL de la requête.
  return { data: result.data };
}
