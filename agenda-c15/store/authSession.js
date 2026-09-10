import { readSession, writeSession, deleteSession } from "../lib/sessionStorage";
import { exchangeRefreshToken } from "../lib/refreshSession";
import { authApi } from "./api/authApi";
import { agendaApi } from "./api/agendaApi";
import { setToken, installSession, renewSession, setStorageError } from "./slices/authSlice";
import { getSessionTimes } from "../lib/sessionTiming";
import { configureSessionAccess } from "../lib/sessionAccess";

export function startSession(store, data, timing) {
  if (typeof data.idToken !== "string" || !data.idToken.trim()) throw new Error("Jeton absent.");
  // La branche Agenda n’est pas montée pendant l’authentification.
  const running = [
    ...store.dispatch(agendaApi.util.getRunningQueriesThunk()),
    ...store.dispatch(agendaApi.util.getRunningMutationsThunk()),
  ];
  for (const request of running) request.abort();
  store.dispatch(agendaApi.util.resetApiState());
  store.dispatch(installSession({ idToken: data.idToken, localId: data.localId, ...timing }));
}

export function endSession(store) {
  cancelSessionRefresh(store);
  // Capturer les opérations avant de réinitialiser leurs services.
  const running = [
    ...store.dispatch(agendaApi.util.getRunningQueriesThunk()),
    ...store.dispatch(agendaApi.util.getRunningMutationsThunk()),
    ...store.dispatch(authApi.util.getRunningQueriesThunk()),
    ...store.dispatch(authApi.util.getRunningMutationsThunk()),
  ];
  // Invalider la session avant toute réponse asynchrone tardive.
  store.dispatch(setToken(null));
  for (const request of running) request.abort();
  store.dispatch(agendaApi.util.resetApiState());
  store.dispatch(authApi.util.resetApiState());
}

export async function persistSession(store, data, isCurrent) {
  const timing = getSessionTimes(data.expiresIn, data.requestStartedAt);
  const canInstall = () => isCurrent() && Date.now() < timing.expiresAt;
  if (!canInstall()) return false;
  return writeSession(data.refreshToken, canInstall, () => startSession(store, data, timing));
}

export async function restoreSession(store, signal, isCurrent) {
  const refreshToken = await readSession();
  if (!refreshToken || !isCurrent()) return;
  try {
    const data = await exchangeRefreshToken(refreshToken, signal);
    if (!isCurrent()) return;
    const installed = await persistSession(store, data, isCurrent);
    return installed ? data : undefined;
  } catch (error) {
    if (isCurrent() && error?.invalidRefresh === true) await deleteSession(isCurrent);
    throw error;
  }
}

export async function endStoredSession(store) {
  endSession(store);
  // Mise en file immédiate, avant une éventuelle nouvelle connexion.
  await deleteSession();
}

export function retrySessionDeletion(store, generation) {
  return deleteSession(() => store.getState().auth.generation === generation);
}

const refreshes = new WeakMap();
export function ensureFreshSession(store) {
  const auth = store.getState().auth;
  if (!auth.idToken || !Number.isSafeInteger(auth.refreshAt)) {
    return Promise.reject(new Error("Une connexion est requise."));
  }
  const existing = refreshes.get(store.getState);
  if (existing?.generation === auth.generation) return existing.promise;
  if (Date.now() < auth.refreshAt) return Promise.resolve(auth.idToken);
  const generation = auth.generation;
  const controller = new AbortController();
  const isCurrent = () => !controller.signal.aborted &&
    store.getState().auth.generation === generation &&
    store.getState().auth.userId === auth.userId && Boolean(store.getState().auth.idToken);
  const unsubscribe = store.subscribe ? store.subscribe(() => {
    if (!isCurrent()) controller.abort();
  }) : () => {};
  const entry = { generation, controller, promise: null };
  entry.promise = (async () => {
    try {
      const refreshToken = await readSession();
      if (!isCurrent() || !refreshToken) throw new Error("Session indisponible.");
      const data = await exchangeRefreshToken(refreshToken, controller.signal);
      if (!isCurrent() || data.localId !== auth.userId) throw new Error("La session a changé.");
      const timing = getSessionTimes(data.expiresIn, data.requestStartedAt);
      const canInstall = () => isCurrent() && Date.now() < timing.expiresAt;
      const installed = await writeSession(data.refreshToken, canInstall, () => {
        store.dispatch(renewSession({ generation, localId: data.localId, idToken: data.idToken, ...timing }));
      });
      if (!installed || !isCurrent()) throw new Error("Session indisponible.");
      return store.getState().auth.idToken;
    } catch (error) {
      if (isCurrent() && error?.invalidRefresh === true) {
        const cleanupGeneration = generation + 1;
        try { await endStoredSession(store); } catch {
          store.dispatch(setStorageError({ generation: cleanupGeneration, failed: true }));
        }
      }
      throw new Error("La session n’a pas pu être renouvelée.");
    } finally {
      unsubscribe();
      if (refreshes.get(store.getState) === entry) refreshes.delete(store.getState);
    }
  })();
  refreshes.set(store.getState, entry);
  return entry.promise;
}

export function cancelSessionRefresh(store) {
  refreshes.get(store.getState)?.controller.abort();
}

configureSessionAccess(ensureFreshSession);

export async function retryFailedSessionCleanup(store) {
  const generation = store.getState().auth.generation;
  await retrySessionDeletion(store, generation);
  store.dispatch(setStorageError({ generation, failed: false }));
}
