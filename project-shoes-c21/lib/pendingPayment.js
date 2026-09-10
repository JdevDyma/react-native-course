import AsyncStorage from "@react-native-async-storage/async-storage";

let tail = Promise.resolve();
function serialize(operation) {
  const result = tail.then(operation);
  tail = result.catch(() => {});
  return result;
}

function storageKey(userId) {
  if (typeof userId !== "string" || !userId) throw new Error("Utilisateur absent.");
  return `shoes:pending-payment:${encodeURIComponent(userId)}`;
}

function validateId(value) {
  if (value !== null && (typeof value !== "string" || !/^[a-f0-9]{64}$/.test(value))) {
    throw new Error("L'identifiant de la commande enregistrée est invalide.");
  }
  return value;
}

export function readPendingPayment(userId) {
  return serialize(async () => validateId(await AsyncStorage.getItem(storageKey(userId))));
}

export function rememberPendingPayment(userId, orderId) {
  validateId(orderId);
  if (orderId === null) return Promise.reject(new Error("Commande absente."));
  return serialize(async () => {
    const key = storageKey(userId);
    const previous = validateId(await AsyncStorage.getItem(key));
    if (previous !== null && previous !== orderId) {
      throw new Error("Une autre commande attend une vérification.");
    }
    await AsyncStorage.setItem(key, orderId);
  });
}

export function forgetPendingPayment(userId, orderId) {
  return serialize(async () => {
    const key = storageKey(userId);
    const previous = validateId(await AsyncStorage.getItem(key));
    if (previous !== orderId) return previous === null;
    await AsyncStorage.removeItem(key);
    return true;
  });
}
