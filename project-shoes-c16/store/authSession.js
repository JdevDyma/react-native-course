import { cancelSessionRenewal } from "../lib/sessionRenewal";
import { readSession, writeSession, deleteSession } from "../lib/sessionStorage";
import { exchangeRefreshToken } from "../lib/refreshSession";
import { clearHttpError } from "./slices/errorSlice";
import { authApi } from "./api/authApi";
import { userApi } from "./api/userApi";
import { installSession, clearSession, confirmProfile } from "./slices/authSlice";
import { getSessionTimes } from "../lib/sessionTiming";

export function startSession(store, data) {
  if (typeof data?.idToken !== "string" || !data.idToken.trim() ||
      typeof data?.localId !== "string" || !data.localId.trim()) {
    throw new Error("Session invalide.");
  }
  const timing = getSessionTimes(data.expiresIn, data.requestStartedAt);
  if (Date.now() >= timing.expiresAt) throw new Error("Session expirée.");
  cancelSessionRenewal(store);
  const running = [
    ...store.dispatch(userApi.util.getRunningQueriesThunk()),
    ...store.dispatch(userApi.util.getRunningMutationsThunk()),
  ];
  for (const request of running) request.abort();
  store.dispatch(userApi.util.resetApiState());
  store.dispatch(installSession({ idToken: data.idToken, localId: data.localId, ...timing }));
}

export function endSession(store) {
  cancelSessionRenewal(store);
  const running = [
    ...store.dispatch(userApi.util.getRunningQueriesThunk()),
    ...store.dispatch(userApi.util.getRunningMutationsThunk()),
    ...store.dispatch(authApi.util.getRunningQueriesThunk()),
    ...store.dispatch(authApi.util.getRunningMutationsThunk()),
  ];
  store.dispatch(clearSession());
  store.dispatch(clearHttpError());
  for (const request of running) request.abort();
  store.dispatch(userApi.util.resetApiState());
  store.dispatch(authApi.util.resetApiState());
}

export async function persistSession(store, data, key, isCurrent) {
  const current = () => isCurrent() && store.getState().auth.generation === key.generation &&
    store.getState().auth.userId === key.userId && data.localId === key.userId &&
    Date.now() < store.getState().auth.expiresAt;
  if (!current()) return false;
  return await writeSession(data.refreshToken, current, () => {
    store.dispatch(confirmProfile(key));
  });
}

// attempt reste dans une référence privée du navigateur, jamais dans Redux.
export async function restoreSession(store, attempt, signal, isActive) {
  const current = () => isActive() && !signal.aborted &&
    store.getState().auth.generation === attempt.generation &&
    (!attempt.data || store.getState().auth.userId === attempt.data.localId);
  if (!current()) return false;
  if (!attempt.data) {
    const refreshToken = await readSession();
    if (!current() || !refreshToken) return false;
    const data = await exchangeRefreshToken(refreshToken, signal);
    if (!current()) return false;
    startSession(store, data);
    // Suivre notre propre installation provisoire, pas la génération vide précédente.
    attempt.generation = store.getState().auth.generation;
    attempt.data = data;
  }
  if (!current()) return false;
  if (Date.now() >= store.getState().auth.expiresAt) throw new Error("Reconnectez-vous pour ouvrir une nouvelle session.");
  const key = { userId: attempt.data.localId, generation: attempt.generation };
  if (!attempt.profileConfirmed) {
    const request = store.dispatch(userApi.endpoints.verifyStoredProfile.initiate(key));
    const abort = () => request.abort();
    signal.addEventListener("abort", abort, { once: true });
    if (signal.aborted) abort();
    try {
      await request.unwrap();
      if (!current()) return false;
      attempt.profileConfirmed = true;
    } finally {
      signal.removeEventListener("abort", abort);
      request.reset();
    }
  }
  if (!current()) return false;
  const saved = await persistSession(store, attempt.data, key, current);
  if (!saved && current()) throw new Error("La session n’a pas été enregistrée.");
  return saved;
}

export async function endStoredSession(store) {
  endSession(store);
  // L'effacement entre dans la même file que les lectures et écritures.
  await deleteSession();
}

export async function retrySessionDeletion(store, generation) {
  await deleteSession(() => store.getState().auth.generation === generation);
}
