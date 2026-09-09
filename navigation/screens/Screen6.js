import { useEffect } from "react";
import { ScrollView, StyleSheet, Text } from "react-native";

export default function Screen6() {
  useEffect(() => {
    console.log("screen 6");
  }, []);

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <Text>Article 3</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#fff" },
  content: { flexGrow: 1, padding: 24, gap: 16, alignItems: "center", justifyContent: "center" },
});
