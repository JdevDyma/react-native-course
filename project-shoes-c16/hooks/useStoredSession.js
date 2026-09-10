import { registerSessionCloser, cancelSessionRenewal } from "../lib/sessionRenewal";
import { createContext, useContext, useEffect, useRef, useState } from "react";
import { useStore } from "react-redux";
import { restoreSession, endStoredSession, retrySessionDeletion } from "../store/authSession";

export const StoredSessionContext = createContext(null);
export function useLogout() {
  const logout = useContext(StoredSessionContext);
  if (!logout) throw new Error("Coordinateur de session absent.");
  return logout;
}

export default function useStoredSession() {
  const store = useStore();
  const [busy, setBusy] = useState(true);
  const [error, setError] = useState(null);
  const mounted = useRef(false);
  const operation = useRef(null);
  const attempt = useRef(null);
  const deletionGeneration = useRef(null);

  async function run(mode) {
    if (operation.current) return;
    const task = { controller: new AbortController() };
    operation.current = task;
    const active = () => mounted.current && operation.current === task;
    setBusy(true);
    setError(null);
    try {
      if (mode === "delete") {
        await retrySessionDeletion(store, deletionGeneration.current);
        if (active()) deletionGeneration.current = null;
      } else {
        if (!attempt.current) attempt.current = { generation: store.getState().auth.generation };
        await restoreSession(store, attempt.current, task.controller.signal, active);
        if (active()) attempt.current = null;
      }
    } catch {
      if (active()) setError(mode === "delete"
        ? "La session est fermée, mais son effacement local n’est pas confirmé. Réessayez avant de vous reconnecter."
        : "La restauration n’a pas abouti. Réessayez ou revenez à la connexion pour confirmer votre profil.");
    } finally {
      if (active()) { operation.current = null; setBusy(false); }
    }
  }

  async function logout() {
    operation.current?.controller.abort();
    const task = { controller: new AbortController() };
    operation.current = task;
    attempt.current = null;
    setBusy(true);
    setError(null);
    // endStoredSession ferme l'état en mémoire avant son premier await.
    const deletion = endStoredSession(store);
    deletionGeneration.current = store.getState().auth.generation;
    try {
      await deletion;
      if (mounted.current && operation.current === task) deletionGeneration.current = null;
    } catch {
      if (mounted.current && operation.current === task) setError(
        "La session est fermée, mais son effacement local n’est pas confirmé. Réessayez avant de vous reconnecter.");
    } finally {
      if (mounted.current && operation.current === task) { operation.current = null; setBusy(false); }
    }
  }

  useEffect(() => {
    mounted.current = true;
    const unregister = registerSessionCloser(store, (key) => {
      const auth = store.getState().auth;
      if (auth.userId === key.userId && auth.generation === key.generation) return logout();
    });
    if (store.getState().auth.idToken && store.getState().auth.profileReady) setBusy(false);
    else void run("restore");
    return () => {
      mounted.current = false;
      unregister();
      cancelSessionRenewal(store);
      operation.current?.controller.abort();
      operation.current = null;
      attempt.current = null;
    };
  }, [store]);
  const retry = () => { if (!operation.current) void run(deletionGeneration.current === null ? "restore" : "delete"); };
  return { busy, error, retry, logout, deletionPending: deletionGeneration.current !== null };
}
