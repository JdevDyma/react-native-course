import { Link } from "expo-router";
import { Pressable, StyleSheet, Text } from "react-native";
import { colors } from "../constants/colors";

export function CustomLink({ href, text }) {
  return (
    <Link href={href} asChild>
      <Pressable style={styles.link}>
        <Text style={styles.text}>{text}</Text>
      </Pressable>
    </Link>
  );
}

export function CustomButton({ onPress, text }) {
  return (
    <Pressable onPress={onPress} style={styles.link} accessibilityRole="button">
      <Text style={styles.text}>{text}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  link: { padding: 16, minHeight: 48, minWidth: 48, maxWidth: "100%",
    backgroundColor: colors.dark, borderRadius: 8, justifyContent: "center",
    alignItems: "center", marginTop: 12 },
  text: { color: colors.light, fontSize: 20, textAlign: "center" },
});
