import { useEffect, useRef, useState } from "react";
import { useStore, useSelector } from "react-redux";
import { useCreateUserMutation } from "../store/api/userApi";
import { startSession, persistSession } from "../store/authSession";
import { signWithSdk } from "../lib/sdkSession";
import { useLogout } from "./useStoredSession";
import { clearHttpError, showHttpError } from "../store/slices/errorSlice";

export default function useAuthenticateWithProfile(endpoint, goToLogin) {
  const store = useStore();
  const logout = useLogout();
  const generation = useSelector((state) => state.auth.generation);
  const [createUser] = useCreateUserMutation();
  const [isLoading, setIsLoading] = useState(false);
  const [profileStep, setProfileStep] = useState(null);
  const mounted = useRef(true);
  const pending = useRef(null);
  const attempt = useRef(null);
  useEffect(() => {
    mounted.current = true;
    return () => { mounted.current = false; pending.current?.abort(); attempt.current = null; };
  }, []);
  useEffect(() => {
    if (attempt.current && attempt.current.key.generation !== generation) {
      attempt.current = null;
      setProfileStep(null);
    }
  }, [generation]);
  const current = (value) => mounted.current && attempt.current === value &&
    store.getState().auth.generation === value.key.generation &&
    store.getState().auth.userId === value.key.userId;

  async function finishProfile(value) {
    if (pending.current || !current(value)) return;
    let request;
    const lock = { abort: () => request?.abort() };
    pending.current = lock;
    setIsLoading(true);
    try {
      if (!value.profileConfirmed) {
        request = createUser({ generation: value.key.generation, email: value.email });
        await request.unwrap();
        if (!current(value) || pending.current !== lock) return;
        value.profileConfirmed = true;
      }
      const saved = await persistSession(store, value.key, () => current(value));
      if (saved) attempt.current = null;
    } catch (error) {
      if (current(value)) setProfileStep(error?.code === "SESSION_EXPIRED" ? "reauthenticate" : "retry");
    } finally {
      if (pending.current === lock) pending.current = null;
      if (mounted.current) setIsLoading(false);
      request?.reset();
    }
  }

  async function submitFormHandler({ email, password }) {
    if (pending.current || attempt.current) return;
    store.dispatch(clearHttpError());
    const before = store.getState().auth.generation;
    const lock = { cancelled: false, abort() { this.cancelled = true; } };
    pending.current = lock;
    setIsLoading(true);
    const active = () => mounted.current && !lock.cancelled && pending.current === lock &&
      store.getState().auth.generation === before;
    try {
      const installed = await signWithSdk({ endpoint, email, password }, active, (data) => {
        startSession(store, data);
        attempt.current = { email: data.email, profileConfirmed: false,
          key: { userId: data.localId, generation: store.getState().auth.generation } };
      });
      if (!installed || !mounted.current || !attempt.current) return;
      setProfileStep("retry");
      pending.current = null;
      await finishProfile(attempt.current);
    } catch (error) {
      if (mounted.current && pending.current === lock) {
        store.dispatch(showHttpError(error?.publicMessage ?? (endpoint === "signUp"
          ? "L’inscription n’est pas entièrement confirmée. Si le compte a été créé, utilisez la connexion ; ne répétez pas automatiquement l’inscription."
          : "La connexion n’a pas été confirmée. Votre saisie est conservée.")));
      }
    } finally {
      if (pending.current === lock) pending.current = null;
      if (mounted.current) setIsLoading(false);
    }
  }
  async function retryProfile() {
    if (pending.current) return;
    store.dispatch(clearHttpError());
    if (profileStep === "reauthenticate") {
      await logout();
      if (mounted.current) goToLogin();
    } else if (attempt.current) await finishProfile(attempt.current);
  }
  function cancelProfile() {
    pending.current?.abort();
    attempt.current = null;
    void logout();
    setProfileStep(null);
  }
  return { submitFormHandler, profileStep, retryProfile, cancelProfile, isLoading };
}
