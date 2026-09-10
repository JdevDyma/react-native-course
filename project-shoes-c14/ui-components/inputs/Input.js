import { useState } from "react";
import { Pressable, StyleSheet, TextInput, View } from "react-native";
import { Ionicons } from "@react-native-vector-icons/ionicons";
import { colors } from "../../constants/colors";
import { spaces } from "../../constants/spaces";
import { radius } from "../../constants/radius";
import TextBoldL from "../texts/TextBoldL";
import TextMediumM from "../texts/TextMediumM";

export default function Input({ label, error, errorText, type, ...inputProps }) {
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const inputStyles = [styles.input, inputProps.readOnly && styles.readOnlyInput];
  return (
    <View style={styles.container}>
      <TextBoldL style={styles.label}>{label}</TextBoldL>
      <View style={[styles.inputContainer, error && styles.inputError]}>
        <TextInput {...inputProps} accessibilityLabel={label}
          style={inputStyles} secureTextEntry={type === "password" && !isPasswordVisible} />
        {type === "password" ? <Pressable style={styles.eye}
          onPress={() => setIsPasswordVisible((value) => !value)}
          accessibilityRole="button" accessibilityLabel={isPasswordVisible ? "Masquer le mot de passe" : "Afficher le mot de passe"}>
          <Ionicons name={isPasswordVisible ? "eye-outline" : "eye-off-outline"}
            size={24} color={colors.DARK} accessible={false} />
        </Pressable> : null}
      </View>
      <View style={styles.errorContainer}>
        {error && errorText ? <TextMediumM accessibilityRole="alert" style={styles.error}>{errorText}</TextMediumM> : null}
      </View>
    </View>
  );
}
const styles = StyleSheet.create({
  container: { marginBottom: spaces.L },
  label: { marginBottom: spaces.XS },
  inputContainer: { width: "100%", minHeight: 54, flexDirection: "row", alignItems: "center", borderRadius: radius.REGULAR, backgroundColor: colors.WHITE, paddingHorizontal: spaces.M },
  input: { flex: 1, minWidth: 0, fontSize: 16, color: colors.DARK, paddingVertical: spaces.M },
  readOnlyInput: { color: colors.GREY },
  eye: { minWidth: 48, minHeight: 48, alignItems: "center", justifyContent: "center" },
  inputError: { borderColor: "#a32119", borderWidth: 1 },
  errorContainer: { minHeight: spaces.L, justifyContent: "center" },
  error: { color: "#a32119" },
});
