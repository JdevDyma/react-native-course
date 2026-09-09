import { StyleSheet, Text, TouchableOpacity } from "react-native";

export default function CustomBtn({ text, onPress, color, textColor = "white", disabled = false }) {
  const isDisabled = disabled || typeof onPress !== "function";
  return (
    <TouchableOpacity activeOpacity={0.8} onPress={onPress} disabled={isDisabled}
      accessibilityRole="button" accessibilityState={{ disabled: isDisabled }}
      style={[styles.btn, { backgroundColor: color }, isDisabled && styles.disabled]}>
      <Text style={[styles.text, { color: textColor }]}>{text}</Text>
    </TouchableOpacity>
  );
}
const styles = StyleSheet.create({
  btn: { flexGrow: 1, flexBasis: 140, minHeight: 60, borderRadius: 6,
    alignItems: "center", justifyContent: "center", paddingHorizontal: 16, paddingVertical: 12 },
  text: { fontWeight: "800", fontSize: 24, textAlign: "center" },
  disabled: { opacity: 0.5 },
});
