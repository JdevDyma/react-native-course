import { Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function Screen1({ navigation }) {
  const insets = useSafeAreaInsets();
  return (
    <View style={[styles.container, {
      paddingLeft: insets.left, paddingRight: insets.right,
    }]}>
      <Pressable style={styles.button} accessibilityRole="button"
        accessibilityLabel="Ouvrir Screen 2"
        onPress={() => navigation.navigate("Screen2")}>
        <Text>Screen 1</Text>
      </Pressable>
    </View>
  );
}
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff", alignItems: "center", justifyContent: "center" },
  button: { minHeight: 48, minWidth: 48, padding: 16, justifyContent: "center", alignItems: "center" },
});
