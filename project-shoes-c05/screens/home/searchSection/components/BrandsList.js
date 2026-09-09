import { FlatList, StyleSheet } from "react-native";
import { brands } from "../../../../data/brands";
import { spaces } from "../../../../constants/spaces";
import BrandItem from "./BrandItem";
import ItemHorizontalSeparator from "./ItemHorizontalSeparator";

export default function BrandsList({ selectedBrand, setSelectedBrand }) {
  return (
    <FlatList
      keyboardShouldPersistTaps="handled"
      horizontal
      data={brands}
      extraData={selectedBrand}
      keyExtractor={(item) => item.name}
      renderItem={({ item }) => (
        <BrandItem item={item} selectedBrand={selectedBrand}
          setSelectedBrand={setSelectedBrand} />
      )}
      style={styles.listContainer}
      contentContainerStyle={styles.contentStyle}
      ItemSeparatorComponent={ItemHorizontalSeparator}
      showsHorizontalScrollIndicator={false}
    />
  );
}

const styles = StyleSheet.create({
  listContainer: { flexGrow: 0 },
  contentStyle: { paddingHorizontal: spaces.L, alignItems: "center" },
});
