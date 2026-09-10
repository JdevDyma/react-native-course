import { useNavigation } from "@react-navigation/native";
import { FlatList, StyleSheet } from "react-native";
import { shoes } from "../../../../data/shoes";
import VerticalCard from "../../../../ui-components/cards/VerticalCard";
import ItemSeparator from "../../../../ui-components/separators/ListItemSeparator";
import TextRegularM from "../../../../ui-components/texts/TextRegularM";
import { spaces } from "../../../../constants/spaces";


function ShoeSeparator() {
  return <ItemSeparator width={spaces.L} />;
}

export default function ShoesList({ selectedBrand, inputValue }) {
  const navigation = useNavigation();
  const navigateToDetails = (id) => navigation.navigate("Details", { id });
  const stock = shoes.find((group) => group.brand === selectedBrand)?.stock ?? [];
  const data = stock.filter((item) => !item.new);
  const query = inputValue.trim().toLowerCase();
  const filteredData = data.filter((item) => item.name.toLowerCase().includes(query));
  return (
    <FlatList
      data={filteredData}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => <VerticalCard item={item} onPress={() => navigateToDetails(item.id)} />}
      ListEmptyComponent={<TextRegularM>Aucune chaussure ne correspond à votre recherche.</TextRegularM>}
      horizontal
      style={styles.list}
      ItemSeparatorComponent={ShoeSeparator}
      contentContainerStyle={styles.listContent}
      showsHorizontalScrollIndicator={false}
    />
  );
}

const styles = StyleSheet.create({
  list: { flexGrow: 0 },
  listContent: { paddingHorizontal: spaces.L, paddingVertical: spaces.S, alignItems: "stretch" },
});
