import { File } from "expo-file-system";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { getFirebaseServices } from "../firebaseConfig";
import { isSameProfileSession } from "./profileSession";
import { readSdkIdentity } from "./sdkSession";
import { renewSession } from "../store/slices/authSlice";

const LIMIT = 5 * 1024 * 1024;
const allowedTypes = new Set(["image/jpeg", "image/png", "image/webp", "image/heic", "image/heif"]);

function readLocalBlob(uri, signal) {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    let settled = false;
    const finish = (error, blob) => {
      if (settled) return;
      settled = true;
      signal.removeEventListener("abort", abort);
      xhr.onload = xhr.onerror = xhr.ontimeout = xhr.onabort = null;
      if (error) reject(error); else resolve(blob);
    };
    const abort = () => {
      xhr.abort();
      finish(new Error("Lecture annulée."));
    };
    xhr.open("GET", uri);
    xhr.responseType = "blob";
    xhr.timeout = 15000;
    xhr.onload = () => {
      const blob = xhr.response;
      if ((xhr.status !== 0 && (xhr.status < 200 || xhr.status >= 300)) ||
          !blob || !Number.isFinite(blob.size) || blob.size <= 0 || blob.size > LIMIT) {
        blob?.close?.();
        finish(new Error("Image illisible ou trop volumineuse."));
      } else finish(null, blob);
    };
    xhr.onerror = xhr.ontimeout = xhr.onabort = () => finish(new Error("Lecture de l’image non confirmée."));
    signal.addEventListener("abort", abort, { once: true });
    if (signal.aborted) abort();
    else {
      try { xhr.send(null); } catch { finish(new Error("Lecture de l’image impossible.")); }
    }
  });
}

export async function uploadProfilePicture({ uri, mimeType, key }, api) {
  const current = () => !api.signal.aborted && isSameProfileSession(api.getState(), key);
  const check = () => { if (!current()) throw new Error("Session remplacée."); };
  check();
  if (typeof uri !== "string" || !uri.startsWith("file://") || !allowedTypes.has(mimeType)) {
    throw new Error("Choisissez une image locale prise en charge.");
  }
  const size = new File(uri).size;
  if (!Number.isFinite(size) || size <= 0 || size > LIMIT) throw new Error("Choisissez une image de cinq Mio au maximum.");
  const { auth, persistence, storage } = getFirebaseServices();
  const user = auth.currentUser;
  if (!user || user.uid !== key.userId) throw new Error("Identité Firebase différente.");
  const identity = await readSdkIdentity(user);
  check();
  api.dispatch(renewSession({ ...key, ...identity }));
  let blob;
  let task;
  const abortUpload = () => task?.cancel();
  try {
    blob = await readLocalBlob(uri, api.signal);
    check();
    if (auth.currentUser !== user) throw new Error("Identité Firebase remplacée.");
    const storagePath = `images/${key.userId}/profile`;
    task = uploadBytesResumable(ref(storage, storagePath), blob, {
      contentType: mimeType, cacheControl: "private,max-age=0,no-cache",
    });
    api.signal.addEventListener("abort", abortUpload, { once: true });
    if (api.signal.aborted) abortUpload();
    const snapshot = await task;
    check();
    await persistence.assertHealthy();
    const photoUrl = await getDownloadURL(snapshot.ref);
    check();
    await persistence.assertHealthy();
    return { photoUrl, storagePath };
  } finally {
    api.signal.removeEventListener("abort", abortUpload);
    blob?.close?.();
  }
}
