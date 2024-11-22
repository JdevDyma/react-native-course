import { Pressable, StyleSheet, Text } from "react-native";

export default function Screen5({ route }) {
  console.log("screen 5");

  return (
    <Pressable style={styles.container}>
      <Text>Article 2 {route.params?.name}</Text>
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
