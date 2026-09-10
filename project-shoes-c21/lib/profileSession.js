export function getProfileKey(auth) {
  if (!auth?.profileReady || typeof auth.userId !== "string" ||
      !auth.userId.length || auth.userId !== auth.userId.trim() ||
      /[.#$\[\]\/\u0000-\u001f\u007f]/.test(auth.userId) ||
      typeof auth.idToken !== "string" || !auth.idToken.trim() ||
      !Number.isSafeInteger(auth.generation)) return null;
  return { userId: auth.userId, generation: auth.generation };
}

export function isSameProfileSession(state, key) {
  const current = getProfileKey(state.auth);
  return current !== null && key != null &&
    current.userId === key.userId && current.generation === key.generation;
}

export function profileTag(key) {
  return { type: "User", id: `${key.userId}:${key.generation}` };
}
