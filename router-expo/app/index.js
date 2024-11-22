import { Link } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";

export default function Screen1(props) {
  return (
    <View style={styles.container}>
    <Link href={"/user/John"}>
      <Text>Screen 1</Text>
    </Link>
    </View>

  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    // backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
});
