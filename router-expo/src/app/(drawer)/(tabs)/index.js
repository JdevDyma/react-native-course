import { Link } from "expo-router";
import { Pressable, ScrollView, StyleSheet, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { colors } from "../../../constants/colors";

export default function HomePage() {
  return (
    <SafeAreaView edges={["left", "right"]} style={styles.screen}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>Bienvenue sur l’écran d’accueil</Text>
        <Link href="/profile/settings" asChild>
          <Pressable style={styles.link}><Text style={styles.linkText}>Aller à la page des réglages</Text></Pressable>
        </Link>
        <Link href="/articles" asChild>
          <Pressable style={styles.link}><Text style={styles.linkText}>Voir les articles</Text></Pressable>
        </Link>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.light },
  container: { flexGrow: 1, alignItems: "center", justifyContent: "center", padding: 24 },
  title: { fontSize: 32, fontWeight: "bold", textAlign: "center", color: colors.dark },
  link: { padding: 16, minHeight: 48, minWidth: 48, maxWidth: "100%", backgroundColor: colors.dark,
    borderRadius: 8, alignItems: "center", justifyContent: "center", marginTop: 12 },
  linkText: { color: colors.light, fontSize: 20, textAlign: "center" },
});
