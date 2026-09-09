import { FlatList, StyleSheet, Text } from "react-native";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { useFonts } from "expo-font";
import { data } from "./data";
import ItemCard from "./components/ItemCard";
import ListItemSeparator from "./components/ListItemSeparator";
import { colors } from "./constants/colors";
import { padding } from "./constants/padding";

export default function App() {
  const [fontLoaded, fontError] = useFonts({
    "Inter-Regular": require("./assets/fonts/Inter-Regular.ttf"),
    "Inter-Bold": require("./assets/fonts/Inter-Bold.ttf"),
  });

  if (!fontLoaded && !fontError) return null;

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.container}>
        <StatusBar style="dark" />
        {fontError ? (
          <Text style={styles.error}>Impossible de charger les polices.</Text>
        ) : (
          <FlatList
            style={styles.listContainer}
            contentContainerStyle={styles.listContent}
            data={data}
            keyExtractor={(item) => item.id}
            ItemSeparatorComponent={ListItemSeparator}
            renderItem={({ item }) => (
              <ItemCard
                title={item.title}
                description={item.description}
                color={item.color}
                Logo={item.logo}
              />
            )}
          />
        )}
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.LIGHT },
  listContainer: { flex: 1, width: "100%" },
  listContent: {
    paddingHorizontal: padding.HORIZONTAL_SCREEN,
    paddingVertical: 8,
  },
  error: { padding: padding.HORIZONTAL_SCREEN, color: colors.DARK },
});
