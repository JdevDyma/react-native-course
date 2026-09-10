import { useEffect, useRef, useState } from "react";
import { Button, ScrollView, StyleSheet, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  prepareNotificationPermissions, allowsNotifications,
  scheduleExampleNotification, cancelExampleNotification,
} from "../../utils/notifications";

export default function FirstNotification() {
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const generation = useRef(0);
  const running = useRef(false);
  const scheduled = useRef(null);

  useEffect(() => () => {
    generation.current += 1;
    const identifier = scheduled.current;
    scheduled.current = null;
    if (identifier) void cancelExampleNotification(identifier).catch(() => {});
  }, []);

  async function run(schedule) {
    if (running.current) return;
    const attempt = ++generation.current;
    const active = () => generation.current === attempt;
    running.current = true;
    setBusy(true);
    try {
      const settings = await prepareNotificationPermissions({ request: true, current: active });
      if (!active()) return;
      console.log(settings.status);
      if (!allowsNotifications(settings)) {
        setMessage("Les notifications ne sont pas autorisées. Vous pouvez modifier ce choix dans les réglages de l'application.");
        return;
      }
      setMessage("Les notifications sont autorisées selon les réglages système.");
      if (!schedule) return;
      if (scheduled.current) await cancelExampleNotification(scheduled.current);
      if (!active()) return;
      const result = await scheduleExampleNotification(active);
      if (!active()) {
        if (result.identifier) await cancelExampleNotification(result.identifier);
        return;
      }
      scheduled.current = result.identifier;
      setMessage(result.identifier ? "Rappel programmé dans trois secondes." : "La permission a changé. Vérifiez vos réglages.");
    } catch {
      if (active()) setMessage("La notification n'a pas pu être préparée.");
    } finally {
      if (active()) { running.current = false; setBusy(false); }
    }
  }

  return (
    <SafeAreaView style={styles.screen}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Ma première notification</Text>
        <Button title="Autoriser les notifications" disabled={busy} onPress={() => { void run(false); }} />
        <Button title="Programmer un rappel" disabled={busy} onPress={() => { void run(true); }} />
        <Text accessibilityLiveRegion="polite">{message}</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  content: { padding: 24, gap: 24 },
  title: { fontSize: 22, fontWeight: "600" },
});

