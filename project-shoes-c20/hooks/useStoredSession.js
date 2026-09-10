import { createContext, useContext, useEffect, useRef, useState } from "react";
import { useStore } from "react-redux";
import { onIdTokenChanged } from "firebase/auth";
import { getFirebaseServices, observeStorageFailure } from "../firebaseConfig";
import { readSdkIdentity } from "../lib/sdkSession";
import { renewSession } from "../store/slices/authSlice";
import { restoreSession, endSession, endStoredSession, retrySessionDeletion } from "../store/authSession";

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
  const [restartRequired, setRestartRequired] = useState(false);
  const [deletionPending, setDeletionPending] = useState(false);
  const mounted = useRef(false);
  const operation = useRef(null);
  const attempt = useRef(null);
  const failedStorage = useRef(false);

  async function run(mode) {
    if (operation.current) return;
    if (failedStorage.current && mode !== "delete") return;
    const task = new AbortController();
    operation.current = task;
    const active = () => mounted.current && operation.current === task;
    setBusy(true);
    setError(null);
    try {
      if (mode === "delete") {
        const result = await retrySessionDeletion();
        if (active()) {
          setDeletionPending(false);
          if (result.restartRequired) {
            setRestartRequired(true);
            setError("L’effacement est confirmé. Fermez puis relancez l’application pour réinitialiser la persistance.");
          }
        }
      } else {
        if (!attempt.current) attempt.current = { generation: store.getState().auth.generation };
        await restoreSession(store, attempt.current, task.signal, active);
        if (active()) attempt.current = null;
      }
    } catch {
      if (active()) setError(failedStorage.current
        ? "Le stockage sécurisé est indisponible. Effacez la session enregistrée, puis relancez l’application."
        : mode === "delete"
          ? "L’effacement n’est pas confirmé. Une session pourrait être restaurée au prochain lancement. Réessayez avant toute connexion."
          : "La restauration ou la vérification du profil n’a pas abouti. Réessayez ou revenez à la connexion.");
    } finally {
      if (active()) { operation.current = null; setBusy(false); }
    }
  }

  async function logout() {
    operation.current?.abort();
    const task = new AbortController();
    operation.current = task;
    attempt.current = null;
    setBusy(true);
    setError(null);
    setDeletionPending(true);
    try {
      const result = await endStoredSession(store);
      if (mounted.current && operation.current === task) {
        setDeletionPending(false);
        if (result.restartRequired) {
          setRestartRequired(true);
          setError("L’effacement est confirmé. Relancez l’application pour réinitialiser la persistance.");
        }
      }
    } catch {
      if (mounted.current && operation.current === task) setError(
        "La session est fermée, mais son effacement n’est pas confirmé. Elle pourrait être restaurée au prochain lancement. Réessayez.");
    } finally {
      if (mounted.current && operation.current === task) { operation.current = null; setBusy(false); }
    }
  }

  useEffect(() => {
    mounted.current = true;
    const stopFailures = observeStorageFailure(() => {
      failedStorage.current = true;
      operation.current?.abort();
      endSession(store);
      if (mounted.current) {
        setRestartRequired(true);
        setDeletionPending(true);
        setError("Le stockage sécurisé n’est pas confirmé. Effacez la session, puis relancez l’application.");
      }
    });
    let stopTokens = () => {};
    try {
      const { auth } = getFirebaseServices();
      stopTokens = onIdTokenChanged(auth, (user) => {
        if (auth.currentUser !== user) return;
        const before = store.getState().auth;
        if (!before.idToken || failedStorage.current) return;
        if (!user || user.uid !== before.userId) { endSession(store); return; }
        void readSdkIdentity(user).then((identity) => {
          const now = store.getState().auth;
          if (mounted.current && now.generation === before.generation && now.userId === before.userId) {
            store.dispatch(renewSession({ userId: before.userId, generation: before.generation, ...identity }));
          }
        }, () => { /* La prochaine opération présentera l’échec de renouvellement. */ });
      });
      void run("restore");
    } catch {
      setBusy(false);
      setRestartRequired(true);
      setError("L’initialisation Firebase a échoué. Vérifiez sa configuration, puis relancez l’application.");
    }
    return () => {
      mounted.current = false;
      stopTokens();
      stopFailures();
      operation.current?.abort();
      operation.current = null;
      attempt.current = null;
    };
  }, [store]);
  const retry = () => { if (!operation.current) void run(deletionPending ? "delete" : "restore"); };
  return { busy, error, retry, logout, deletionPending, restartRequired };
}
