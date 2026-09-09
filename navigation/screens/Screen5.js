import { useEffect } from "react";
import { ScrollView, StyleSheet, Text } from "react-native";

export default function Screen5({ route }) {
  useEffect(() => {
    console.log("screen 5");
  }, []);
  const name = typeof route.params?.name === "string" ? route.params.name : "Lecteur";

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <Text>Article 2 {name}</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#fff" },
  content: { flexGrow: 1, padding: 24, gap: 16, alignItems: "center", justifyContent: "center" },
});
