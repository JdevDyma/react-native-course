import { Pressable, StyleSheet, Text } from "react-native";

export default function Screen1(props) {
  return (
    <Pressable
      style={styles.container}
      onPress={() => {
        props.navigation.jumpTo("Settings", { name: "john" });
      }}
    >
      <Text>Screen 1</Text>
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
