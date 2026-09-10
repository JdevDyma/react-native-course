import { ActivityIndicator, StyleSheet, Text, TouchableOpacity } from "react-native";

export default function CustomBtn({ text, onPress, color, textColor = "white", disabled = false, isLoading = false }) {
  const isDisabled = disabled || isLoading || typeof onPress !== "function";
  return (
    <TouchableOpacity activeOpacity={0.8} onPress={onPress} disabled={isDisabled}
      accessibilityRole="button" accessibilityLabel={text} accessibilityState={{ disabled: isDisabled, busy: isLoading }}
      style={[styles.btn, { backgroundColor: color }, isDisabled && styles.disabled]}>
      {isLoading ? <ActivityIndicator color={textColor} size="small" /> : <Text style={[styles.text, { color: textColor }]}>{text}</Text>}
    </TouchableOpacity>
  );
}
const styles = StyleSheet.create({
  btn: { flexGrow: 1, flexBasis: 140, minHeight: 60, borderRadius: 6,
    alignItems: "center", justifyContent: "center", paddingHorizontal: 16, paddingVertical: 12 },
  text: { fontWeight: "800", fontSize: 24, textAlign: "center" },
  disabled: { opacity: 0.5 },
});
