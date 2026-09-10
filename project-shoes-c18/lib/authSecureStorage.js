import * as SecureStore from "expo-secure-store";

export function createAuthSecureStorage(onFailure) {
  let tail = Promise.resolve();
  let failure = null;
  const knownKeys = new Set();
  const options = { keychainService: "shoes.firebase.auth" };

  function storageKey(key) {
    if (typeof key !== "string" || !key.length) throw new Error("Clé invalide.");
    let encoded = "firebase_auth_";
    for (let index = 0; index < key.length; index += 1) {
      encoded += key.charCodeAt(index).toString(16).padStart(4, "0");
    }
    knownKeys.add(encoded);
    return encoded;
  }
  function recordFailure() {
    const first = failure === null;
    failure = new Error("Le stockage sécurisé de la session n’a pas été confirmé.");
    if (first) {
      try { onFailure?.(); } catch { /* Conserver l’erreur de stockage. */ }
    }
    return failure;
  }
  function run(operation) {
    const result = tail.then(operation).catch(() => { throw recordFailure(); });
    tail = result.then(() => undefined, () => undefined);
    return result;
  }
  const storage = {
    getItem(key) {
      return run(async () => {
        const value = await SecureStore.getItemAsync(storageKey(key), options);
        if (value !== null) JSON.parse(value);
        return value;
      });
    },
    setItem(key, value) {
      return run(async () => {
        if (typeof value !== "string") throw new Error("Valeur invalide.");
        await SecureStore.setItemAsync(storageKey(key), value, options);
      });
    },
    removeItem(key) {
      return run(() => SecureStore.deleteItemAsync(storageKey(key), options));
    },
  };
  return {
    storage,
    async assertHealthy() {
      await tail;
      if (failure) throw failure;
    },
    // Les clés viennent exclusivement des appels publics reçus du SDK.
    // Aucun nom de clé interne à Firebase n’est reconstruit ici.
    clearRecordedEntries() {
      return run(async () => {
        for (const key of knownKeys) await SecureStore.deleteItemAsync(key, options);
      });
    },
    hasFailed: () => failure !== null,
  };
}
