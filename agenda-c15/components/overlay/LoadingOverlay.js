import { StyleSheet, View } from "react-native";

export default function LoadingOverlay() {
  return <View style={styles.container} pointerEvents="auto" accessible
    accessibilityRole="progressbar" accessibilityLabel="Opération en cours"
    accessibilityState={{ busy: true }} />;
}
const styles = StyleSheet.create({
  container: { ...StyleSheet.absoluteFill, backgroundColor: "rgba(0,0,0,0.3)" },
});
