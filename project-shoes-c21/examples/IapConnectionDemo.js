import { useEffect, useState } from "react";
import { Text } from "react-native";
import { initConnection, endConnection } from "expo-iap";

// Ce diagnostic est le seul propriétaire de la connexion.
let queue = Promise.resolve();
let connectionUncertain = false;
function checkConnection(isCurrent) {
  const operation = queue.then(async () => {
    if (!isCurrent()) return "Diagnostic annulé.";
    if (connectionUncertain) {
      return "La fermeture précédente reste incertaine. Rouvrez l’application avant un nouveau diagnostic.";
    }
    try {
      const connected = await initConnection();
      return connected ? "Connexion établie, aucun achat effectué." : "Connexion indisponible.";
    } catch {
      return "Connexion indisponible. Vérifiez la configuration du magasin.";
    } finally {
      try {
        if (await endConnection() !== true) throw new Error("Fermeture non confirmée.");
      } catch (error) {
        connectionUncertain = true;
        throw error;
      }
    }
  });
  queue = operation.catch(() => undefined);
  return operation;
}
export default function IapConnectionDemo() {
  const [message, setMessage] = useState("Connexion en cours…");
  useEffect(() => {
    let current = true;
    checkConnection(() => current).then(
      (result) => { if (current) setMessage(result); },
      () => { if (current) setMessage("La fermeture de la connexion n’a pas été confirmée. Rouvrez l’application."); },
    );
    return () => { current = false; };
  }, []);
  return <Text accessibilityRole="alert">{message}</Text>;
}
