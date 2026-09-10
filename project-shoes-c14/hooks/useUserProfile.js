import { useEffect, useRef, useState } from "react";
import { useSelector, useStore } from "react-redux";
import { useGetUserByIdQuery, updateUserData, isUserWritePending } from "../store/api/userApi";

export default function useUserProfile() {
  const store = useStore();
  const userId = useSelector((state) => state.user.id);
  const query = useGetUserByIdQuery(userId, { skip: !userId });
  const user = query.currentData;
  const [isWriting, setIsWriting] = useState(false);
  const [mutationError, setMutationError] = useState("");
  const pending = useRef(false);
  const generation = useRef(0);
  const mounted = useRef(true);
  const currentId = useRef(userId);
  currentId.current = userId;
  useEffect(() => {
    mounted.current = true;
    return () => { mounted.current = false; };
  }, []);
  useEffect(() => {
    generation.current += 1;
    setMutationError("");
    return () => { generation.current += 1; };
  }, [userId]);
  const busy = query.isFetching || isWriting;
  const canWrite = Boolean(userId && user && query.isSuccess && !query.error && !mutationError && !busy);

  async function writeProfile(buildPatch) {
    if (pending.current || !canWrite) return false;
    pending.current = true;
    setIsWriting(true);
    const attempt = generation.current;
    const selectedId = userId;
    try {
      await updateUserData(store, selectedId, buildPatch);
      return true;
    } catch {
      if (mounted.current && attempt === generation.current && currentId.current === selectedId) {
        setMutationError("L’opération n’a pas été confirmée. Relisez le profil avant de réessayer.");
      }
      return false;
    } finally {
      pending.current = false;
      if (mounted.current) setIsWriting(false);
    }
  }
  async function retry() {
    if (!userId || pending.current || busy || isUserWritePending(store)) return;
    const attempt = generation.current;
    const selectedId = userId;
    const result = await query.refetch();
    if (mounted.current && attempt === generation.current && currentId.current === selectedId && !result.error) {
      setMutationError("");
    }
  }
  const message = !userId ? "Aucun profil de démonstration sélectionné." :
    mutationError || (query.error ? "Impossible de lire le profil." :
      !query.isFetching && user === null ? "Ce profil n’existe plus." : "");
  return { user, userId, busy, isWriting, canWrite, message, retry, writeProfile,
    canRetry: Boolean(userId && !busy), isFetching: query.isFetching };
}
