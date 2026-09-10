import FontAwesome5 from "@expo/vector-icons/FontAwesome5";
import { StyleSheet, TouchableOpacity } from "react-native";

export default function LocationButton({ onPress, disabled = false }) {
  return <TouchableOpacity activeOpacity={0.8} onPress={onPress} disabled={disabled}
    accessibilityRole="button" accessibilityLabel="Recentrer sur ma position"
    accessibilityState={{ disabled, busy: disabled }}
    style={[styles.button, disabled && styles.disabled]}>
    <FontAwesome5 name="location-arrow" size={30} color="#4285F4" accessible={false} />
  </TouchableOpacity>;
}
const styles = StyleSheet.create({
  button: { width: 60, height: 60, justifyContent: "center", alignItems: "center", backgroundColor: "#fff", borderRadius: 99 },
  disabled: { opacity: 0.6 },
});
