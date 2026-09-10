import { useEffect, useRef, useState } from "react";
import { useStore, useSelector } from "react-redux";
import { useSignMutation } from "../store/api/authApi";
import { useCreateUserMutation } from "../store/api/userApi";
import { startSession, endSession, persistSession } from "../store/authSession";
import { useLogout } from "./useStoredSession";
import { clearHttpError, showHttpError } from "../store/slices/errorSlice";

export default function useAuthenticateWithProfile(endpoint, goToLogin) {
  const store = useStore();
  const logout = useLogout();
  const [saving, setSaving] = useState(false);
  const generation = useSelector((state) => state.auth.generation);
  const [sign, authState] = useSignMutation();
  const [createUser, profileState] = useCreateUserMutation();
  const [profileStep, setProfileStep] = useState(null);
  const mounted = useRef(true);
  const pending = useRef(null);
  const attempt = useRef(null);
  useEffect(() => {
    mounted.current = true;
    return () => { mounted.current = false; pending.current?.abort(); attempt.current = null; };
  }, []);
  useEffect(() => {
    if (attempt.current && attempt.current.generation !== generation) {
      attempt.current = null;
      setProfileStep(null);
    }
  }, [generation]);
  const current = (value) => mounted.current && attempt.current === value &&
    store.getState().auth.generation === value.generation;

  async function finishProfile(value) {
    if (!current(value)) return;
    if (Date.now() >= store.getState().auth.expiresAt) {
      attempt.current = null;
      endSession(store);
      setProfileStep("reauthenticate");
      return;
    }
    let request;
    // Un verrou couvre aussi l'écriture locale, qui n'est pas une mutation RTK.
    const lock = { abort: () => request?.abort() };
    pending.current = lock;
    try {
      if (!value.profileConfirmed) {
        request = createUser({ generation: value.generation, email: value.email });
        await request.unwrap();
        if (!current(value) || pending.current !== lock) return;
        value.profileConfirmed = true;
      }
      if (!current(value)) return;
      setSaving(true);
      setProfileStep("storage");
      const saved = await persistSession(store, value.data,
        { generation: value.generation, userId: value.data.localId }, () => current(value));
      if (saved) {
        attempt.current = null;
      } else if (current(value)) {
        attempt.current = null;
        endSession(store);
        setProfileStep("reauthenticate");
      }
    } catch (error) {
      if (!current(value)) return;
      if (error?.code === "SESSION_EXPIRED") {
        attempt.current = null;
        endSession(store);
        setProfileStep("reauthenticate");
      } else setProfileStep(value.profileConfirmed ? "storage" : "retry");
    } finally {
      if (pending.current === lock) pending.current = null;
      if (mounted.current) setSaving(false);
      request?.reset();
    }
  }

  async function submitFormHandler(values) {
    if (pending.current || attempt.current) return;
    store.dispatch(clearHttpError());
    const before = store.getState().auth.generation;
    const request = sign({ email: values.email, password: values.password, endpoint, generation: before });
    pending.current = request;
    let accountConfirmed = false;
    let confirmedGeneration = before;
    try {
      const data = await request.unwrap();
      if (!mounted.current || pending.current !== request || store.getState().auth.generation !== before) return;
      accountConfirmed = true;
      startSession(store, data);
      confirmedGeneration = store.getState().auth.generation;
      const value = { generation: store.getState().auth.generation, email: data.email, data, profileConfirmed: false };
      attempt.current = value;
      setProfileStep("retry");
      pending.current = null;
      await finishProfile(value);
    } catch {
      if (mounted.current && accountConfirmed && store.getState().auth.generation === confirmedGeneration) {
        setProfileStep("reauthenticate");
        store.dispatch(showHttpError("Le compte est authentifié, mais la session doit être rouverte avant de confirmer le profil."));
      }
      // Les refus des endpoints sont présentés par le middleware.
    } finally {
      if (pending.current === request) pending.current = null;
      request.reset();
    }
  }
  async function retryProfile() {
    if (pending.current) return;
    store.dispatch(clearHttpError());
    if (profileStep === "reauthenticate") { goToLogin(); return; }
    if (attempt.current) await finishProfile(attempt.current);
  }
  function cancelProfile() {
    pending.current?.abort();
    attempt.current = null;
    void logout();
    setProfileStep(null);
  }
  return { submitFormHandler, profileStep, retryProfile, cancelProfile,
    isLoading: saving || authState.isLoading || profileState.isLoading };
}
