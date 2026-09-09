import { useCallback } from "react";
import { useBottomTabBarHeight } from "expo-router/js-tabs";
import { Link, useLocalSearchParams, useRouter, useNavigation, useFocusEffect } from "expo-router";
import { Pressable, ScrollView, StyleSheet, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { articlesStyles } from "../../../../../styles/articles";
import { colors } from "../../../../../constants/colors";

export default function FavoritesArticlesPage() {
  const router = useRouter();
  function returnToArticles() {
    router.dismissTo("/articles");
  }
  const { ids } = useLocalSearchParams();
  let favoriteIds = null;
  if (typeof ids === "string") {
    try {
      const value = JSON.parse(ids);
      if (Array.isArray(value) && value.every((id) => typeof id === "string" && id.length > 0)) {
        favoriteIds = value;
      }
    } catch {
      // Une URL peut contenir un texte qui n’est pas un JSON valide.
    }
  }
  const navigation = useNavigation();
  const tabBarHeight = useBottomTabBarHeight();
  useFocusEffect(useCallback(() => {
    navigation.getParent().setOptions({ title: "Articles favoris" });
  }, [navigation]));
  return (
    <SafeAreaView edges={["left", "right"]} style={[styles.screen, articlesStyles.borderTopPage]}>
      <ScrollView contentContainerStyle={[styles.container, { paddingBottom: 24 + tabBarHeight }]}>
        <Text style={styles.title}>Les articles favoris</Text>
        {favoriteIds === null ? (
          <Text style={styles.text}>Les identifiants reçus sont invalides.</Text>
        ) : favoriteIds.length === 0 ? (
          <Text style={styles.text}>Aucun article favori.</Text>
        ) : favoriteIds.map((id, index) => (
          <Text key={`${id}-${index}`} style={styles.text}>{id}</Text>
        ))}
        <Pressable style={styles.link} accessibilityRole="button" onPress={returnToArticles}>
          <Text style={styles.linkText}>Revenir sur tous les articles</Text>
        </Pressable>
        <Link href={{ pathname: "/articles/[id]", params: { id: "34543" } }} push asChild>
          <Pressable style={styles.link}><Text style={styles.linkText}>Lire l’article</Text></Pressable>
        </Link>
        <Link href="/" asChild>
          <Pressable style={styles.link}><Text style={styles.linkText}>Revenir sur l’écran de bienvenue</Text></Pressable>
        </Link>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.dark },
  container: { flexGrow: 1, alignItems: "center", justifyContent: "center", padding: 24 },
  title: { fontSize: 32, fontWeight: "bold", textAlign: "center", color: colors.light },
  text: { color: colors.light, fontSize: 18, textAlign: "center" },
  link: { padding: 16, minHeight: 48, minWidth: 48, maxWidth: "100%", backgroundColor: colors.primary,
    borderRadius: 8, alignItems: "center", justifyContent: "center", marginTop: 12 },
  linkText: { color: colors.dark, fontSize: 20, textAlign: "center" },
});
