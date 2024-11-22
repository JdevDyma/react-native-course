import { Pressable, StyleSheet, Text } from "react-native";

export default function Screen6() {
  console.log("screen 6");

  return (
    <Pressable style={styles.container}>
      <Text>Article 3</Text>
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
