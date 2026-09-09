import { ScrollView, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { colors } from "../constants/colors";

export function CustomView({ children, edges = ["bottom", "left", "right"] }) {
  return (
    <SafeAreaView edges={edges} style={styles.screen}>
      <ScrollView contentContainerStyle={styles.container}>
        {children}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.light },
  container: { flexGrow: 1, alignItems: "center", justifyContent: "center", padding: 24 },
});
