import { ActivityIndicator, StyleSheet, TouchableOpacity } from "react-native";
import TextBoldL from "../texts/TextBoldL";
import { colors } from "../../constants/colors";
import { radius } from "../../constants/radius";
import { spaces } from "../../constants/spaces";

export default function CustomButton({ text, onPress, disabled = false, isLoading = false }) {
  const isDisabled = disabled || isLoading || typeof onPress !== "function";
  return (
    <TouchableOpacity activeOpacity={0.8} style={[styles.btnContainer, isDisabled && styles.disabled]}
      onPress={onPress} disabled={isDisabled} accessibilityRole="button"
      accessibilityLabel={isLoading ? "Chargement" : text} accessibilityState={{ disabled: isDisabled, busy: isLoading }}>
      {isLoading ? <ActivityIndicator color={colors.WHITE} /> : <TextBoldL style={styles.btnText}>{text}</TextBoldL>}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  btnContainer: {
    backgroundColor: colors.BLUE, width: "100%", minHeight: 70,
    paddingVertical: spaces.M, paddingHorizontal: spaces.L,
    justifyContent: "center", alignItems: "center", borderRadius: radius.FULL,
  },
  disabled: { opacity: 0.5 },
  btnText: { color: colors.WHITE, textAlign: "center" },
});
