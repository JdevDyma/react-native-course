import { useEffect, useRef, useState } from "react";
import { useSelector, useStore } from "react-redux";
import { useGetUserByIdQuery, updateUserData, isUserWritePending } from "../store/api/userApi";
import { getProfileKey, isSameProfileSession } from "../lib/profileSession";

export default function useUserProfile() {
  const store = useStore();
  const auth = useSelector((state) => state.auth);
  const key = getProfileKey(auth);
  const query = useGetUserByIdQuery(key, { skip: key === null });
  const user = key === null ? undefined : query.currentData;
  const [isWriting, setIsWriting] = useState(false);
  const [mutationError, setMutationError] = useState("");
  const pending = useRef(false);
  const mounted = useRef(true);
  useEffect(() => { mounted.current = true; return () => { mounted.current = false; }; }, []);
  useEffect(() => { setMutationError(""); }, [auth.userId, auth.generation]);
  const busy = query.isFetching || isWriting;
  const canWrite = Boolean(key && user && query.isSuccess && !query.error && !mutationError && !busy);
  async function writeProfile(buildPatch) {
    if (pending.current || !canWrite || !isSameProfileSession(store.getState(), key)) return false;
    pending.current = true;
    setIsWriting(true);
    try {
      await updateUserData(store, key, buildPatch);
      return mounted.current && isSameProfileSession(store.getState(), key);
    } catch {
      if (mounted.current && isSameProfileSession(store.getState(), key)) {
        setMutationError("L’opération n’a pas été confirmée. Relisez le profil avant de réessayer.");
      }
      return false;
    } finally {
      pending.current = false;
      if (mounted.current) setIsWriting(false);
    }
  }
  async function retry() {
    if (!key || pending.current || busy || query.isUninitialized || isUserWritePending(store) ||
        !isSameProfileSession(store.getState(), key)) return;
    const result = await query.refetch();
    if (mounted.current && isSameProfileSession(store.getState(), key) && !result.error) setMutationError("");
  }
  const message = !key ? "Aucune session prête pour lire le profil." :
    mutationError || (query.error ? "Impossible de lire le profil." :
      !query.isFetching && user === null ? "Ce profil n’existe plus." : "");
  return { user, userId: key?.userId ?? null, busy, isWriting, canWrite, message, retry, writeProfile,
    canRetry: Boolean(key && !query.isUninitialized && !busy), isFetching: query.isFetching };
}
