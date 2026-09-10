import { signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut,
  getIdTokenResult } from "firebase/auth";
import { getFirebaseServices } from "../firebaseConfig";

let tail = Promise.resolve();

// Auth n’expose pas AbortSignal pour ces opérations. Une file conserve leur ordre.
export function inAuthQueue(operation) {
  const result = tail.then(operation);
  tail = result.then(() => undefined, () => undefined);
  return result;
}

export async function readSdkIdentity(user, forceRefresh = false) {
  const { auth, persistence } = getFirebaseServices();
  await persistence.assertHealthy();
  if (!user || auth.currentUser !== user || typeof user.uid !== "string" || !user.uid) {
    throw new Error("Session Firebase absente.");
  }
  const result = await getIdTokenResult(user, forceRefresh);
  await persistence.assertHealthy();
  const expiresAt = Date.parse(result.expirationTime);
  if (auth.currentUser !== user || typeof result.token !== "string" || !result.token ||
      !Number.isSafeInteger(expiresAt) || expiresAt <= Date.now()) {
    throw new Error("Session Firebase non confirmée.");
  }
  return { idToken: result.token, localId: user.uid, email: user.email,
    expiresAt, refreshAt: expiresAt - 30000 };
}

export function signWithSdk({ endpoint, email, password }, isCurrent, install) {
  return inAuthQueue(async () => {
    const { auth, persistence } = getFirebaseServices();
    await auth.authStateReady();
    await persistence.assertHealthy();
    if (!isCurrent()) return false;
    if (!["signUp", "signInWithPassword"].includes(endpoint) ||
        typeof email !== "string" || !email.trim() || typeof password !== "string") {
      throw new Error("Saisie d’authentification invalide.");
    }
    const sign = endpoint === "signUp" ? createUserWithEmailAndPassword : signInWithEmailAndPassword;
    let accountCreated = false;
    let installed = false;
    try {
      const credential = await sign(auth, email.trim(), password);
      accountCreated = endpoint === "signUp";
      const data = await readSdkIdentity(credential.user);
      if (!isCurrent()) {
        await signOut(auth);
        await persistence.clearRecordedEntries();
        return false;
      }
      // L’installation appartient à la même tâche que l’authentification.
      install(data);
      installed = true;
      return true;
    } catch (cause) {
      // Ne pas relancer automatiquement une inscription après une réponse ambiguë.
      const error = new Error(endpoint === "signUp"
        ? "L’inscription n’est pas entièrement confirmée. Essayez la connexion avant toute nouvelle inscription."
        : "La connexion n’a pas été confirmée.");
      error.accountCreated = accountCreated;
      const messages = {
        "auth/invalid-credential": "Vérifiez vos identifiants.",
        "auth/invalid-email": "Vérifiez le format de votre email.",
        "auth/email-already-in-use": "Ce compte existe déjà. Utilisez la connexion.",
        "auth/weak-password": "Choisissez un mot de passe plus robuste.",
        "auth/too-many-requests": "Trop de tentatives. Patientez avant de réessayer.",
        "auth/network-request-failed": "Vérifiez votre connexion réseau.",
      };
      error.publicMessage = accountCreated ? error.message : messages[cause?.code] ?? error.message;
      throw error;
    } finally {
      // Une annulation peut aussi croiser un refus ou une erreur de persistance.
      // Aucun prochain login n’entre dans la file avant ce nettoyage.
      if (!installed && !isCurrent() && auth.currentUser) {
        await signOut(auth);
        await persistence.clearRecordedEntries();
      }
    }
  });
}

export function clearSdkSession() {
  return inAuthQueue(async () => {
    const { auth, persistence } = getFirebaseServices();
    await auth.authStateReady();
    await signOut(auth);
    await persistence.clearRecordedEntries();
    // Un défaut antérieur reste terminal : redémarrer reconstruira la persistance.
    return { restartRequired: persistence.hasFailed() };
  });
}
