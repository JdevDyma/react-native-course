import { profileBaseQuery } from "../../lib/profileBaseQuery";
import { isSameProfileSession } from "../../lib/profileSession";
import { getFirebaseServices } from "../../firebaseConfig";
import { readSdkIdentity } from "../../lib/sdkSession";
import { renewSession } from "../slices/authSlice";

const failure = () => ({ error: { status: "SESSION_CHANGED", data: "La requête n’a pas été confirmée. Vérifiez votre session." } });
export async function baseQueryWithReauth(args, api, extraOptions) {
  const key = args?.key;
  const current = () => !api.signal.aborted && isSameProfileSession(api.getState(), key);
  if (!current()) return failure();
  try {
    const { auth } = getFirebaseServices();
    const user = auth.currentUser;
    if (!user || user.uid !== key.userId) return failure();
    const identity = await readSdkIdentity(user);
    if (!current()) return failure();
    api.dispatch(renewSession({ ...key, ...identity }));
    const result = await profileBaseQuery(args, api, extraOptions);
    if (!current()) return failure();
    if (result.error?.status !== 401) return result;
    const renewed = await readSdkIdentity(user, true);
    if (!current()) return failure();
    api.dispatch(renewSession({ ...key, ...renewed }));
    // Seul un refus d’authentification confirmé autorise cette unique reprise.
    return await profileBaseQuery(args, api, extraOptions);
  } catch { return failure(); }
}
