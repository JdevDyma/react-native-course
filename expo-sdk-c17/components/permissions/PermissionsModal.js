import { useEffect, useRef, useState } from "react";
import { AppState, Linking, Modal, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function PermissionsModal({ permissions, closeModal, updatePermissions, message }) {
  const insets = useSafeAreaInsets();
  const visible = permissions.length > 0;
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const active = useRef(false);
  const pending = useRef(false);

  useEffect(() => {
    active.current = true;
    return () => { active.current = false; };
  }, []);

  useEffect(() => {
    if (!visible) return;
    let current = true;
    let previousState = AppState.currentState;
    let reading = false;
    setError("");
    const subscription = AppState.addEventListener("change", async (state) => {
      const returned = state === "active" && previousState !== "active";
      previousState = state;
      if (!returned || reading) return;
      reading = true;
      try {
        const refreshed = [];
        for (const permission of permissions) {
          const response = await permission.getPermission();
          if (!current) return;
          if (!response?.granted) refreshed.push({ ...permission, canAskAgain: response?.canAskAgain });
        }
        if (current) updatePermissions(refreshed);
      } catch {
        if (current) setError("La lecture des autorisations n’a pas abouti. Vous pouvez consulter les réglages puis revenir.");
      } finally {
        reading = false;
      }
    });
    return () => { current = false; subscription.remove(); };
  }, [visible, permissions, updatePermissions]);

  async function openSettings() {
    if (pending.current) return;
    pending.current = true;
    setBusy(true);
    setError("");
    try {
      await Linking.openSettings();
    } catch {
      if (active.current) setError("Impossible d’ouvrir les réglages. Ouvrez-les depuis le système.");
    } finally {
      pending.current = false;
      if (active.current) setBusy(false);
    }
  }

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={closeModal}>
      <View style={styles.backdrop}>
        <ScrollView style={styles.sheet} contentContainerStyle={{
          padding: 24, paddingBottom: 24 + insets.bottom,
          paddingLeft: 24 + insets.left, paddingRight: 24 + insets.right,
        }}>
          <Text accessibilityRole="header" style={styles.title}>Autorisation nécessaire</Text>
          <Text>{message || "Pour cette action, l’application a besoin des capacités suivantes :"}</Text>
          {permissions.map((permission) => (
            <Text key={permission.id} style={styles.permission}>
              {permission.label}{permission.canAskAgain === false ? " : à modifier dans les réglages." : " : une nouvelle demande reste possible."}
            </Text>
          ))}
          <Text>Au retour, les autorisations seront relues. Fermer cette fenêtre ne relance aucune action et ne prend aucune photo.</Text>
          {error ? <Text accessibilityRole="alert" style={styles.error}>{error}</Text> : null}
          <View style={styles.buttons}>
            <Pressable onPress={closeModal} accessibilityRole="button" style={[styles.button, styles.cancel]}>
              <Text style={styles.buttonText}>Annuler</Text>
            </Pressable>
            <Pressable onPress={openSettings} disabled={busy} accessibilityRole="button"
              accessibilityState={{ disabled: busy, busy }} style={[styles.button, busy && styles.disabled]}>
              <Text style={styles.buttonText}>Ouvrir les réglages</Text>
            </Pressable>
          </View>
        </ScrollView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, justifyContent: "flex-end", paddingTop: 48, backgroundColor: "rgba(0,0,0,0.3)" },
  sheet: { flexGrow: 0, maxHeight: "100%", backgroundColor: "white", borderTopLeftRadius: 16, borderTopRightRadius: 16 },
  title: { fontSize: 20, fontWeight: "600", textAlign: "center", marginBottom: 16 },
  permission: { fontSize: 18, fontWeight: "600", marginVertical: 8 },
  buttons: { flexDirection: "row", flexWrap: "wrap", gap: 12, marginTop: 24 },
  button: { minHeight: 48, padding: 16, borderRadius: 16, justifyContent: "center", alignItems: "center", backgroundColor: "black", flexGrow: 1 },
  cancel: { backgroundColor: "#666" },
  buttonText: { color: "white", fontSize: 18, fontWeight: "700" },
  disabled: { opacity: 0.5 },
  error: { color: "#9b1c1c", marginTop: 12 },
});
