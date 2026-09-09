import { Text, StyleSheet } from "react-native";
import { textSize } from "../constants/textSize";
import { colors } from "../constants/colors";

export const TextXL = ({ children, color = colors.DARK }) => (
  <Text style={[styles.textXL, { color }]}>{children}</Text>
);

export const TextM = ({ children }) => (
  <Text style={styles.textM}>{children}</Text>
);

const styles = StyleSheet.create({
  textXL: { fontFamily: "Inter-Bold", fontSize: textSize.TEXT_XL, color: colors.DARK },
  textM: { fontFamily: "Inter-Regular", fontSize: textSize.TEXT_M, color: colors.DARK },
});
