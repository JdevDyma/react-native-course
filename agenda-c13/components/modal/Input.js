import { StyleSheet, Text, TextInput, View } from "react-native";
import { colors } from "../../constants/colors";

export default function Input({ label, error = false, style, ...inputProps }) {
  const inputStyles = [styles.input, inputProps.multiline && styles.multilineInput, error && styles.inputError, style];
  return (
    <View style={styles.inputContainer}>
      <Text style={styles.label}>{label}</Text>
      <TextInput {...inputProps}
        accessibilityLabel={inputProps.accessibilityLabel ?? label}
        accessibilityHint={error ? "Valeur à corriger" : inputProps.accessibilityHint}
        style={inputStyles} />
    </View>
  );
}

const styles = StyleSheet.create({
  inputContainer: { marginBottom: 12 },
  label: { marginBottom: 4, color: colors.LIGHT, fontWeight: "600", fontSize: 18 },
  input: { minHeight: 48, borderRadius: 12, backgroundColor: colors.WHITE,
    color: colors.DARK, fontSize: 18, paddingHorizontal: 12, paddingVertical: 10 },
  inputError: { borderColor: "red", borderWidth: 3 },
  multilineInput: { minHeight: 120, textAlignVertical: "top" },
});
