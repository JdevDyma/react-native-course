import { AppState } from "react-native";
import { ensureFreshSession, cancelSessionRefresh, retryFailedSessionCleanup } from "../store/authSession";

export function startSessionRefresh(store, onUnavailable) {
  let stopped = false;
  let timer;
  let inFlight = false;
  let blockedGeneration = null;
  let blockedDeadline = null;
  async function check() {
    clearTimeout(timer);
    if (stopped || AppState.currentState !== "active" || inFlight) return;
    const auth = store.getState().auth;
    if (!auth.idToken) { blockedGeneration = null; onUnavailable(auth.storageError); return; }
    if (blockedGeneration === auth.generation && blockedDeadline === auth.refreshAt) return;
    blockedGeneration = null;
    const delay = auth.refreshAt - Date.now();
    if (Number.isSafeInteger(auth.refreshAt) && delay > 0) {
      onUnavailable(false);
      timer = setTimeout(() => { void check(); }, Math.min(delay, 2147483647));
      return;
    }
    inFlight = true;
    try {
      await ensureFreshSession(store);
      if (!stopped) {
        const next = store.getState().auth;
        if (next.idToken && next.refreshAt <= Date.now()) {
          blockedGeneration = next.generation;
          blockedDeadline = next.refreshAt;
          onUnavailable(true);
        } else onUnavailable(false);
      }
    } catch {
      if (!stopped && store.getState().auth.generation === auth.generation) {
        blockedGeneration = auth.generation;
        blockedDeadline = auth.refreshAt;
        onUnavailable(true);
      }
    } finally {
      inFlight = false;
      if (!stopped && blockedGeneration !== store.getState().auth.generation) void check();
    }
  }
  const unsubscribe = store.subscribe(() => { void check(); });
  const subscription = AppState.addEventListener("change", (state) => {
    if (state === "active") blockedGeneration = null;
    void check();
  });
  void check();
  return {
    async retry() {
      if (inFlight) return;
      if (store.getState().auth.storageError) {
        inFlight = true;
        try { await retryFailedSessionCleanup(store); } catch { if (!stopped) onUnavailable(true); }
        finally { inFlight = false; }
      }
      blockedGeneration = null;
      void check();
    },
    stop() {
      stopped = true;
      clearTimeout(timer);
      unsubscribe();
      subscription.remove();
      cancelSessionRefresh(store);
    },
  };
}
