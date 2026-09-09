import { StyleSheet, TouchableOpacity } from "react-native";
import TextBoldL from "../texts/TextBoldL";
import { colors } from "../../constants/colors";
import { radius } from "../../constants/radius";
import { spaces } from "../../constants/spaces";

export default function CustomButton({ text, onPress }) {
  return (
    <TouchableOpacity activeOpacity={0.8} style={styles.btnContainer}
      onPress={onPress} accessibilityRole="button">
      <TextBoldL style={styles.btnText}>{text}</TextBoldL>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  btnContainer: {
    backgroundColor: colors.BLUE, width: "100%", minHeight: 70,
    paddingVertical: spaces.M, paddingHorizontal: spaces.L,
    justifyContent: "center", alignItems: "center", borderRadius: radius.FULL,
  },
  btnText: { color: colors.WHITE, textAlign: "center" },
});
