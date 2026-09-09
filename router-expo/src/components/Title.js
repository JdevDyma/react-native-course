import { StyleSheet, Text } from "react-native";
import { colors } from "../constants/colors";

export function Title({ text }) {
  return <Text style={styles.title} accessibilityRole="header">{text}</Text>;
}

const styles = StyleSheet.create({
  title: { fontSize: 32, fontWeight: "bold", textAlign: "center", color: colors.dark },
});
