import { Button, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function Screen2({ navigation, route }) {
  const insets = useSafeAreaInsets();
  const name = typeof route.params?.name === "string" ? route.params.name : "visiteur";
  return (
    <View style={[styles.container, { paddingLeft: insets.left, paddingRight: insets.right }]}>
      <Text>Hello {name}</Text>
      <Button title="Revenir à l’écran précédent" onPress={() => {
        if (navigation.canGoBack()) navigation.goBack();
        else navigation.navigate("Screen1");
      }} />
    </View>
  );
}
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff", alignItems: "center", justifyContent: "center", gap: 16 },
});
