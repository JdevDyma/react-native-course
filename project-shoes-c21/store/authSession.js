import { getFirebaseServices } from "../firebaseConfig";
import { inAuthQueue, readSdkIdentity, clearSdkSession } from "../lib/sdkSession";
import { clearHttpError } from "./slices/errorSlice";
import { userApi } from "./api/userApi";
import { stripeApi } from "./api/stripeApi";
import { installSession, clearSession, confirmProfile } from "./slices/authSlice";

export function endSession(store) {
  const running = [
    ...store.dispatch(userApi.util.getRunningQueriesThunk()),
    ...store.dispatch(userApi.util.getRunningMutationsThunk()),
    ...store.dispatch(stripeApi.util.getRunningQueriesThunk()),
    ...store.dispatch(stripeApi.util.getRunningMutationsThunk()),
  ];
  store.dispatch(clearSession());
  store.dispatch(clearHttpError());
  for (const request of running) request.abort();
  store.dispatch(userApi.util.resetApiState());
  store.dispatch(stripeApi.util.resetApiState());
}

export function startSession(store, data) {
  if (typeof data?.idToken !== "string" || !data.idToken ||
      typeof data?.localId !== "string" || !data.localId ||
      !Number.isSafeInteger(data.expiresAt) || data.expiresAt <= Date.now()) {
    throw new Error("Session invalide.");
  }
  endSession(store);
  store.dispatch(installSession(data));
}

export async function persistSession(store, key, current) {
  await getFirebaseServices().persistence.assertHealthy();
  if (!current() || store.getState().auth.generation !== key.generation ||
      store.getState().auth.userId !== key.userId) return false;
  // L’utilisateur SDK est déjà enregistré par l’adaptateur SecureStore.
  store.dispatch(confirmProfile(key));
  return true;
}

export async function restoreSession(store, attempt, signal, isActive) {
  const current = () => isActive() && !signal.aborted &&
    store.getState().auth.generation === attempt.generation;
  if (!current()) return false;
  if (!attempt.key) {
    const restored = await inAuthQueue(async () => {
      const { auth, persistence } = getFirebaseServices();
      await auth.authStateReady();
      await persistence.assertHealthy();
      if (!current() || !auth.currentUser) return false;
      const data = await readSdkIdentity(auth.currentUser);
      if (!current()) return false;
      startSession(store, data);
      attempt.generation = store.getState().auth.generation;
      attempt.key = { userId: data.localId, generation: attempt.generation };
      return true;
    });
    if (!restored) return false;
  }
  if (!current()) return false;
  const request = store.dispatch(userApi.endpoints.verifyStoredProfile.initiate(attempt.key));
  const abort = () => request.abort();
  signal.addEventListener("abort", abort, { once: true });
  if (signal.aborted) abort();
  try {
    await request.unwrap();
    if (!current()) return false;
    return await persistSession(store, attempt.key, current);
  } finally {
    signal.removeEventListener("abort", abort);
    request.reset();
  }
}

export function endStoredSession(store) {
  endSession(store);
  return clearSdkSession();
}

export function retrySessionDeletion() {
  return clearSdkSession();
}
