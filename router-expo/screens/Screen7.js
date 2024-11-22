import { Pressable, StyleSheet, Text } from "react-native";

export default function Screen7() {
  return (
    <Pressable style={styles.container}>
      <Text>Notifications</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
});
