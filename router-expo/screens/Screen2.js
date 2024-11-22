import { StyleSheet, Text, Pressable } from "react-native";

export default function Screen2({ route, navigation }) {
  const { name } = route.params;
  return (
    <Pressable
      style={styles.container}
      onPress={() => {
        navigation.goBack();
      }}
    >
      <Text>Hello {name}</Text>
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
