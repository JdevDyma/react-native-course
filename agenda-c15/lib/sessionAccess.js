// Ce pont évite un import circulaire entre le service et le coordinateur.
let resolveFreshSession;
export function configureSessionAccess(resolver) { resolveFreshSession = resolver; }
export function awaitFreshSession(api) {
  if (!resolveFreshSession) return Promise.reject(new Error("Session indisponible."));
  return resolveFreshSession(api);
}
