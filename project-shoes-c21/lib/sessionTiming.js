export function getSessionTimes(expiresIn, requestStartedAt) {
  const ttl = Number(expiresIn) * 1000;
  if (typeof expiresIn !== "string" || !/^\d+$/.test(expiresIn) ||
      !Number.isSafeInteger(ttl) || ttl <= 0 ||
      !Number.isSafeInteger(requestStartedAt) ||
      !Number.isSafeInteger(requestStartedAt + ttl)) throw new Error("Durée de session invalide.");
  const expiresAt = requestStartedAt + ttl;
  return { expiresAt, refreshAt: expiresAt - Math.min(30000, Math.floor(ttl / 10)) };
}
