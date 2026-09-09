import { useCallback } from "react";
import { useBottomTabBarHeight } from "expo-router/js-tabs";
import { Link, useNavigation, useFocusEffect } from "expo-router";
import { Pressable, ScrollView, StyleSheet, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { articlesStyles } from "../../../../styles/articles";
import { colors } from "../../../../constants/colors";

export default function ArticlesPage() {
  const navigation = useNavigation();
  const tabBarHeight = useBottomTabBarHeight();
  useFocusEffect(useCallback(() => {
    navigation.getParent().setOptions({ title: "Articles" });
  }, [navigation]));
  return (
    <SafeAreaView edges={["left", "right"]} style={[styles.screen, articlesStyles.borderTopPage]}>
      <ScrollView contentContainerStyle={[styles.container, { paddingBottom: 24 + tabBarHeight }]}>
        <Text style={styles.title}>Tous les articles</Text>
        <Link href="/articles/1234" push asChild>
          <Pressable style={styles.link}><Text style={styles.linkText}>Aller sur le détail de l’article</Text></Pressable>
        </Link>
        <Link href={{
          pathname: "/articles/favorites/[ids]",
          params: { ids: JSON.stringify(["1234", "6534", "8734"]) },
        }} push asChild>
          <Pressable style={styles.link}><Text style={styles.linkText}>Aller aux articles favoris</Text></Pressable>
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
