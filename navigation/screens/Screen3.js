import { StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function Screen3({ route }) {
  const insets = useSafeAreaInsets();
  const name = typeof route.params?.name === "string" ? route.params.name : "visiteur";
  return (
    <View style={[styles.container, { paddingLeft: insets.left, paddingRight: insets.right }]}>
      <Text>Settings {name}</Text>
    </View>
  );
}
const styles = StyleSheet.create({ container: { flex: 1, backgroundColor: "#fff", alignItems: "center", justifyContent: "center" } });
