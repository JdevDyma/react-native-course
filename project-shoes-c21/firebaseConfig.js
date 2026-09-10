import { getApps, initializeApp } from "firebase/app";
import { initializeAuth, getReactNativePersistence } from "firebase/auth";
import { getStorage } from "firebase/storage";
import { createAuthSecureStorage } from "./lib/authSecureStorage";

let services;
const failureListeners = new Set();

export function observeStorageFailure(listener) {
  failureListeners.add(listener);
  return () => failureListeners.delete(listener);
}

export function getFirebaseServices() {
  if (services) return services;
  const apiKey = process.env.EXPO_PUBLIC_FIREBASE_API_KEY?.trim();
  const projectId = process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID?.trim();
  const storageBucket = process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET?.trim();
  if (!apiKey || !projectId || !storageBucket || /[/:\s]/.test(storageBucket)) {
    throw new Error("Complétez la configuration publique Firebase.");
  }
  const name = "shoes-storage";
  const app = getApps().find((value) => value.name === name)
    ?? initializeApp({ apiKey, projectId, storageBucket }, name);
  const persistence = createAuthSecureStorage(() => {
    for (const listener of failureListeners) listener();
  });
  // Ce module est l’unique propriétaire de cette instance Auth nommée.
  const auth = initializeAuth(app, {
    persistence: getReactNativePersistence(persistence.storage),
  });
  services = { auth, persistence, storage: getStorage(app) };
  return services;
}
