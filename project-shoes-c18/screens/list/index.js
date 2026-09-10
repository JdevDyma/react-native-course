import { FlatList, View, StyleSheet, useWindowDimensions } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { colors } from "../../constants/colors";
import { spaces } from "../../constants/spaces";
import { shoes } from "../../data/shoes";
import VerticalCard from "../../ui-components/cards/VerticalCard";
import ListItemSeparator from "../../ui-components/separators/ListItemSeparator";
import TextRegularM from "../../ui-components/texts/TextRegularM";
import { useEffect } from "react";

export default function List({ route, navigation }) {
  const brand = typeof route.params?.brand === "string" ? route.params.brand : "";
  const data = shoes.find((group) => group.brand === brand);
  const items = data?.stock ?? [];
  useEffect(() => {
    const title = data ? brand.charAt(0).toUpperCase() + brand.slice(1) : "Chaussures";
    navigation.setOptions({ title });
  }, [brand, data, navigation]);
  const insets = useSafeAreaInsets();
  const { width, fontScale } = useWindowDimensions();
  const availableWidth = width - insets.left - insets.right;
  const numColumns = availableWidth < 360 || fontScale >= 1.5 ? 1 : 2;
  const navigateToDetails = (id) => navigation.navigate("Details", { id });
  const renderItem = ({ item }) => (
    <View style={[styles.cardContainer, { flex: 1 / numColumns }]}>
      <VerticalCard item={item} listScreen
        onPress={() => navigateToDetails(item.id)} />
    </View>
  );
  return (
    <View style={[styles.container, {
      paddingLeft: insets.left, paddingRight: insets.right,
    }]}>
      <FlatList
        key={numColumns}
        data={items}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        numColumns={numColumns}
        ItemSeparatorComponent={<ListItemSeparator height={spaces.L} />}
        ListEmptyComponent={<TextRegularM>Aucune chaussure pour cette marque.</TextRegularM>}
        contentContainerStyle={styles.content}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.LIGHT },
  content: { flexGrow: 1, paddingHorizontal: spaces.S, paddingTop: spaces.L, paddingBottom: spaces.XL },
  cardContainer: { paddingHorizontal: spaces.S, alignItems: "stretch" },
});
