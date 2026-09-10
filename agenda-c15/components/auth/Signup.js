import { useEffect, useRef, useState } from "react";
import { useStore } from "react-redux";
import { useSignMutation } from "../../store/api/authApi";
import { toAuthMessages } from "../../lib/authErrors";
import { persistSession } from "../../store/authSession";
import AuthForm from "./AuthForm";

export default function Signup({ navigation }) {
  const store = useStore();
  const [sign, { isLoading }] = useSignMutation();
  const [httpError, setHttpError] = useState();
  const mounted = useRef(true);
  const pending = useRef(null);
  useEffect(() => {
    mounted.current = true;
    return () => { mounted.current = false; pending.current?.abort(); };
  }, []);
  const navigate = () => navigation.replace("Login");
  async function submitFormHandler(values) {
    if (pending.current) throw new Error("Une demande est déjà en cours.");
    setHttpError(undefined);
    const generation = store.getState().auth.generation;
    const request = sign({ ...values, endpoint: "signUp" });
    pending.current = request;
    let accountCreated = false;
    try {
      const data = await request.unwrap();
      accountCreated = true;
      if (!mounted.current || pending.current !== request ||
          store.getState().auth.generation !== generation) return;
      await persistSession(store, data, () => mounted.current &&
        pending.current === request && store.getState().auth.generation === generation);
    } catch (error) {
      if (!mounted.current || pending.current !== request ||
          store.getState().auth.generation !== generation) return;
      setHttpError(accountCreated
        ? { auth: "Le compte est créé, mais la session n’a pas été enregistrée. Utilisez le lien Connectez-vous pour ouvrir une session." }
        : toAuthMessages(error));
    } finally {
      if (pending.current === request) pending.current = null;
      request.reset();
    }
  }
  return <AuthForm navigate={navigate} submitFormHandler={submitFormHandler} isLoading={isLoading} httpError={httpError} setHttpError={setHttpError} />;
}
