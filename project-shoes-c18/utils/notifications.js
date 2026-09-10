import * as Notifications from "expo-notifications";
import Constants from "expo-constants";
import * as Device from "expo-device";
import { isRunningInExpoGo } from "expo";
import { Platform } from "react-native";

export class NotificationSetupError extends Error {}

if (Platform.OS !== "web") {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
    }),
  });
}

export const notificationEnvironment = {
  supported: Platform.OS === "android" || Platform.OS === "ios",
  physicalDevice: Device.isDevice,
  expoGo: isRunningInExpoGo(),
};

export function allowsNotifications(settings) {
  return settings.granted
    || settings.ios?.status === Notifications.IosAuthorizationStatus.PROVISIONAL
    || settings.ios?.status === Notifications.IosAuthorizationStatus.EPHEMERAL;
}

function checkCurrent(current) {
  if (!current()) throw new NotificationSetupError("La session a changé.");
}

export async function prepareNotificationPermissions({ request = false, current = () => true } = {}) {
  if (!notificationEnvironment.supported) {
    throw new NotificationSetupError("Les notifications de cet exemple sont disponibles sur Android et iOS.");
  }
  checkCurrent(current);
  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("default", {
      name: "Notifications Shoes",
      importance: Notifications.AndroidImportance.HIGH,
      sound: "default",
    });
    checkCurrent(current);
  }
  let settings = await Notifications.getPermissionsAsync();
  checkCurrent(current);
  if (request && !allowsNotifications(settings) && settings.canAskAgain) {
    settings = await Notifications.requestPermissionsAsync();
    checkCurrent(current);
  }
  return settings;
}

export async function registerForPushNotificationsAsync(current = () => true) {
  if (!notificationEnvironment.supported) {
    throw new NotificationSetupError("Utilisez l'application Android ou iOS.");
  }
  if (notificationEnvironment.expoGo) {
    throw new NotificationSetupError("Ouvrez votre application de développement pour configurer les notifications distantes.");
  }
  const projectId = Constants.expoConfig?.extra?.eas?.projectId ?? Constants.easConfig?.projectId;
  if (typeof projectId !== "string"
    || !/^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/i.test(projectId)) {
    throw new NotificationSetupError("Reliez ce projet à votre compte Expo avant de récupérer sa destination de notification.");
  }
  const settings = await prepareNotificationPermissions({ request: true, current });
  if (!allowsNotifications(settings)) {
    return { settings, expoPushToken: null };
  }
  const response = await Notifications.getExpoPushTokenAsync({ projectId });
  checkCurrent(current);
  if (typeof response.data !== "string" || !/^(ExpoPushToken|ExponentPushToken)\[[^\]\s]+\]$/.test(response.data)) {
    throw new NotificationSetupError("La destination de notification reçue est invalide.");
  }
  return { settings, expoPushToken: response.data };
}

export async function scheduleExampleNotification(current = () => true) {
  const settings = await prepareNotificationPermissions({ request: true, current });
  if (!allowsNotifications(settings)) return { settings, identifier: null };
  checkCurrent(current);
  const identifier = await Notifications.scheduleNotificationAsync({
    content: {
      title: "Ma première notification",
      body: "Ceci est un message dans le body",
      sound: "default",
      data: { key: "value" },
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
      seconds: 3,
      repeats: false,
      ...(Platform.OS === "android" ? { channelId: "default" } : {}),
    },
  });
  if (!current()) {
    await Notifications.cancelScheduledNotificationAsync(identifier);
    checkCurrent(current);
  }
  return { settings, identifier };
}

export function cancelExampleNotification(identifier) {
  return Notifications.cancelScheduledNotificationAsync(identifier);
}
