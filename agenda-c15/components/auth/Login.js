import { useEffect, useRef, useState } from "react";
import { useStore } from "react-redux";
import { useSignMutation } from "../../store/api/authApi";
import { toAuthMessages } from "../../lib/authErrors";
import { persistSession } from "../../store/authSession";
import AuthForm from "./AuthForm";

export default function Login({ navigation }) {
  const store = useStore();
  const [sign, { isLoading }] = useSignMutation();
  const [httpError, setHttpError] = useState();
  const mounted = useRef(true);
  const pending = useRef(null);
  useEffect(() => {
    mounted.current = true;
    return () => { mounted.current = false; pending.current?.abort(); };
  }, []);
  const navigate = () => navigation.replace("Signup");
  async function submitFormHandler(values) {
    if (pending.current) throw new Error("Une demande est déjà en cours.");
    setHttpError(undefined);
    const generation = store.getState().auth.generation;
    const request = sign({ ...values, endpoint: "signInWithPassword" });
    pending.current = request;
    try {
      const data = await request.unwrap();
      if (!mounted.current || pending.current !== request ||
          store.getState().auth.generation !== generation) return;
      await persistSession(store, data, () => mounted.current &&
        pending.current === request && store.getState().auth.generation === generation);
    } catch (error) {
      if (!mounted.current || pending.current !== request ||
          store.getState().auth.generation !== generation) return;
      setHttpError(toAuthMessages(error));
    } finally {
      if (pending.current === request) pending.current = null;
      request.reset();
    }
  }
  return <AuthForm loginScreen navigate={navigate} submitFormHandler={submitFormHandler} isLoading={isLoading} httpError={httpError} setHttpError={setHttpError} />;
}
