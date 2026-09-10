import * as SecureStore from "expo-secure-store";

const SESSION_KEY = "shoes.session";
let queue = Promise.resolve();
const serial = (operation) => {
  const result = queue.then(operation);
  queue = result.catch(() => {});
  return result;
};

export function readSession() {
  return serial(async () => {
    const value = await SecureStore.getItemAsync(SESSION_KEY);
    if (!value) return null;
    let data;
    try { data = JSON.parse(value); } catch { data = null; }
    if (typeof data?.refreshToken !== "string" || !data.refreshToken.trim()) {
      await SecureStore.deleteItemAsync(SESSION_KEY);
      return null;
    }
    return data.refreshToken;
  });
}

export function writeSession(refreshToken, isCurrent, install) {
  return serial(async () => {
    if (!isCurrent()) return false;
    if (typeof refreshToken !== "string" || !refreshToken.trim()) throw new Error("Session invalide.");
    await SecureStore.setItemAsync(SESSION_KEY, JSON.stringify({ refreshToken }));
    if (!isCurrent()) {
      // Aucune écriture suivante ne peut commencer avant ce nettoyage.
      await SecureStore.deleteItemAsync(SESSION_KEY);
      return false;
    }
    install();
    return true;
  });
}

export function deleteSession(isCurrent = () => true) {
  return serial(async () => {
    if (isCurrent()) await SecureStore.deleteItemAsync(SESSION_KEY);
  });
}
