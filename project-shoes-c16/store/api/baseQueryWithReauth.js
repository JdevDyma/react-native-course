import { profileBaseQuery } from "../../lib/profileBaseQuery";
import { isSameProfileSession } from "../../lib/profileSession";
import { observeRenewal, renewAfterUnauthorized } from "../../lib/sessionRenewal";

const failure = (status) => ({ error: { status, data: "Requête non confirmée. Vérifiez votre session et réessayez." } });
export async function baseQueryWithReauth(args, api, extraOptions) {
  const key = args?.key;
  const current = () => !api.signal.aborted && isSameProfileSession(api.getState(), key);
  if (!current()) return failure("SESSION_CHANGED");
  const observed = observeRenewal(api, key);
  const usedToken = api.getState().auth.idToken;
  const result = await profileBaseQuery(args, api, extraOptions);
  if (!current()) return failure("SESSION_CHANGED");
  if (result.error?.status !== 401) return result;
  const renewed = await renewAfterUnauthorized(api, key, usedToken, observed);
  if (!current()) return failure("SESSION_CHANGED");
  if (!renewed) return failure("RENEWAL_FAILED");
  // Une seule reprise du transport, pas une nouvelle mutation RTK ni une récursion.
  return await profileBaseQuery(args, api, extraOptions);
}
