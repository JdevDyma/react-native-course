import { useCallback } from "react";
import { useBottomTabBarHeight } from "expo-router/js-tabs";
import { useLocalSearchParams, useRouter, useNavigation, useFocusEffect } from "expo-router";
import { Pressable, ScrollView, StyleSheet, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { articlesStyles } from "../../../../styles/articles";
import { colors } from "../../../../constants/colors";

export default function ArticleDetails() {
  const router = useRouter();
  function returnToArticles() {
    router.dismissTo("/articles");
  }
  const { id } = useLocalSearchParams();
  const articleId = typeof id === "string" ? id : "";
  const navigation = useNavigation();
  const tabBarHeight = useBottomTabBarHeight();
  useFocusEffect(useCallback(() => {
    navigation.getParent().setOptions({ title: articleId ? `Article : ${articleId}` : "Article invalide" });
  }, [navigation, articleId]));
  return (
    <SafeAreaView edges={["left", "right"]} style={[styles.screen, articlesStyles.borderTopPage]}>
      <ScrollView contentContainerStyle={[styles.container, { paddingBottom: 24 + tabBarHeight }]}>
        <Text style={styles.title}>Id de l’article</Text>
        <Text style={styles.title}>{articleId || "Identifiant invalide."}</Text>
        <Pressable style={styles.link} accessibilityRole="button" onPress={returnToArticles}>
          <Text style={styles.linkText}>Revenir à tous les articles</Text>
        </Pressable>
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
