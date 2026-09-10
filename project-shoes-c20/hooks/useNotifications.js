import { createContext, useContext, useEffect, useRef, useState } from "react";
import { AppState, Linking } from "react-native";
import { useSelector, useStore } from "react-redux";
import { getProfileKey, isSameProfileSession } from "../lib/profileSession";
import {
  allowsNotifications, prepareNotificationPermissions, registerForPushNotificationsAsync,
  scheduleExampleNotification, cancelExampleNotification, NotificationSetupError,
  notificationEnvironment,
} from "../utils/notifications";

export const NotificationsContext = createContext(null);

export function useNotificationControls() {
  const value = useContext(NotificationsContext);
  if (!value) throw new Error("Les commandes de notification doivent être placées sous leur fournisseur.");
  return value;
}

export function useNotifications() {
  const store = useStore();
  const key = getProfileKey(useSelector((state) => state.auth));
  const [permission, setPermission] = useState(null);
  const [expoPushToken, setExpoPushToken] = useState(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const epoch = useRef(0);
  const permissionRead = useRef(0);
  const running = useRef(false);
  const scheduled = useRef(null);

  const current = (attempt) => attempt === epoch.current && key
    && isSameProfileSession(store.getState(), key);

  function acceptPermission(settings) {
    setPermission(settings);
    if (!allowsNotifications(settings)) {
      setExpoPushToken(null);
      setMessage(settings.canAskAgain
        ? "Les notifications ne sont pas encore autorisées."
        : "Les notifications sont désactivées. Vous pouvez modifier ce choix dans les réglages.");
    }
  }

  useEffect(() => {
    const attempt = ++epoch.current;
    running.current = false;
    setBusy(false);
    setPermission(null);
    setExpoPushToken(null);
    setMessage("");
    async function refresh() {
      if (!key || !notificationEnvironment.supported || running.current) return;
      const read = ++permissionRead.current;
      const active = () => current(attempt) && read === permissionRead.current && !running.current;
      try {
        const settings = await prepareNotificationPermissions({ current: active });
        if (active()) {
          acceptPermission(settings);
          if (allowsNotifications(settings)) setMessage("");
        }
      } catch {
        if (active()) setMessage("Les permissions n'ont pas pu être vérifiées.");
      }
    }
    void refresh();
    const subscription = AppState.addEventListener("change", (state) => {
      if (state === "active" && !running.current) void refresh();
    });
    return () => {
      epoch.current += 1;
      permissionRead.current += 1;
      subscription.remove();
      const identifier = scheduled.current;
      scheduled.current = null;
      if (identifier) void cancelExampleNotification(identifier).catch(() => {});
    };
  }, [key?.userId, key?.generation]);

  async function run(operation) {
    if (!key || running.current || !isSameProfileSession(store.getState(), key)) return;
    const attempt = epoch.current;
    permissionRead.current += 1;
    running.current = true;
    setBusy(true);
    setMessage("");
    try { await operation(() => current(attempt)); }
    catch (error) {
      if (current(attempt)) {
        setMessage(error instanceof NotificationSetupError ? error.message
          : "L'opération de notification a échoué. Vérifiez la configuration et la connexion avant de réessayer.");
      }
    } finally {
      if (current(attempt)) { running.current = false; setBusy(false); }
    }
  }

  const requestPermission = () => run(async (active) => {
    const settings = await prepareNotificationPermissions({ request: true, current: active });
    if (!active()) return;
    acceptPermission(settings);
    if (allowsNotifications(settings)) setMessage("Les notifications sont autorisées selon vos réglages système.");
  });

  const registerPush = () => run(async (active) => {
    setExpoPushToken(null);
    const result = await registerForPushNotificationsAsync(active);
    if (!active()) return;
    acceptPermission(result.settings);
    setExpoPushToken(result.expoPushToken);
    if (result.expoPushToken) setMessage("La destination de notification est disponible.");
  });

  const scheduleLocal = () => run(async (active) => {
    if (scheduled.current) {
      await cancelExampleNotification(scheduled.current);
      if (!active()) return;
      scheduled.current = null;
    }
    const result = await scheduleExampleNotification(active);
    if (!active()) {
      if (result.identifier) await cancelExampleNotification(result.identifier);
      return;
    }
    acceptPermission(result.settings);
    scheduled.current = result.identifier;
    if (result.identifier) setMessage("Le rappel local est programmé dans trois secondes.");
  });

  const cancelLocal = () => run(async (active) => {
    const identifier = scheduled.current;
    if (!identifier) { setMessage("Aucun rappel local à annuler."); return; }
    await cancelExampleNotification(identifier);
    if (!active()) return;
    scheduled.current = null;
    setMessage("La programmation du rappel est annulée. Une notification déjà affichée reste dans le centre de notifications.");
  });

  const openSettings = () => run(async () => { await Linking.openSettings(); });

  return { permission, expoPushToken, busy, message, environment: notificationEnvironment,
    requestPermission, registerPush, scheduleLocal, cancelLocal, openSettings };
}
