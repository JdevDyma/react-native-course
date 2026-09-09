import { useEffect } from "react";
import { Button, ScrollView, StyleSheet, Text } from "react-native";

export default function Screen4({ navigation }) {
  useEffect(() => {
    console.log("screen 4");
  }, []);

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <Text>Article 1</Text>
      <Button title="Lire l’article 2 avec Fred"
        onPress={() => navigation.jumpTo("Article 2", { name: "Fred" })} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#fff" },
  content: { flexGrow: 1, padding: 24, gap: 16, alignItems: "center", justifyContent: "center" },
});
