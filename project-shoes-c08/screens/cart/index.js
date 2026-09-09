import { ScrollView, StyleSheet, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { colors } from "../../constants/colors";
import { spaces } from "../../constants/spaces";

export default function Cart() {
  return (
    <SafeAreaView edges={["left", "right"]} style={styles.screen}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.text}>Panier</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.LIGHT },
  content: { flexGrow: 1, justifyContent: "center", alignItems: "center", padding: spaces.L },
  text: { color: colors.DARK },
});
