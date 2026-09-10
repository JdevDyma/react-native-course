import { StyleSheet, Text, View } from "react-native";
import { useNotificationControls } from "../../../hooks/useNotifications";
import { allowsNotifications } from "../../../utils/notifications";
import CustomButton from "../../../ui-components/buttons/CustomButton";
import { colors } from "../../../constants/colors";
import { spaces } from "../../../constants/spaces";

export default function NotificationControls() {
  const notifications = useNotificationControls();
  const { permission, busy, message, environment } = notifications;
  if (!environment.supported) {
    return <Text style={styles.message}>Les notifications de cet exemple sont disponibles sur Android et iOS.</Text>;
  }
  const permissionLabel = !permission ? "Permission à vérifier"
    : allowsNotifications(permission) ? "Notifications autorisées selon les réglages système"
    : "Notifications non autorisées";
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Mes notifications</Text>
      <Text style={styles.message}>{permissionLabel}</Text>
      {!!message && <Text style={styles.message} accessibilityLiveRegion="polite">{message}</Text>}
      <CustomButton text="Autoriser les notifications" disabled={busy}
        onPress={() => { void notifications.requestPermission(); }} />
      <CustomButton text="Programmer un rappel local" disabled={busy}
        onPress={() => { void notifications.scheduleLocal(); }} />
      <CustomButton text="Annuler le rappel local" disabled={busy}
        onPress={() => { void notifications.cancelLocal(); }} />
      <CustomButton text="Configurer les notifications distantes" disabled={busy}
        onPress={() => { void notifications.registerPush(); }} />
      <CustomButton text="Ouvrir les réglages" disabled={busy}
        onPress={() => { void notifications.openSettings(); }} />
      {__DEV__ && notifications.expoPushToken && (
        <View>
          <Text style={styles.message}>Destination pour l'outil de test Expo :</Text>
          <Text selectable style={styles.token}>{notifications.expoPushToken}</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: spaces.L, gap: spaces.M, backgroundColor: colors.WHITE },
  title: { fontFamily: "SemiBold", fontSize: 20, color: colors.DARK },
  message: { color: colors.DARK, paddingVertical: spaces.S },
  token: { color: colors.DARK, fontFamily: "Regular", flexShrink: 1 },
});

