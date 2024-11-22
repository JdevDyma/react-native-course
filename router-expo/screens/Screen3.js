import { Pressable, StyleSheet, Text } from "react-native";

export default function Screen3({ route }) {
  const { name } = route.params;
  return (
    <Pressable style={styles.container}>
      <Text>Settings {name}</Text>
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
