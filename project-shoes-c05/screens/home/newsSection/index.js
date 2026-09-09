import { View, StyleSheet } from "react-native";
import Banner from "../components/Banner";
import { shoes } from "../../../data/shoes";
import HorizontalCard from "./components/HorizontalCard";
import TextRegularM from "../../../ui-components/texts/TextRegularM";
import { spaces } from "../../../constants/spaces";

export default function NewsSection({ selectedBrand }) {
  const stock = shoes.find((group) => group.brand === selectedBrand)?.stock ?? [];
  const item = stock.find((shoe) => shoe.new);
  return (
    <View style={styles.container}>
      <Banner text="Nouveautés" />
      {item ? (
        <HorizontalCard item={item} />
      ) : (
        <View style={styles.empty}>
          <TextRegularM>Aucune nouveauté pour cette marque.</TextRegularM>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 160, minHeight: 230, paddingVertical: spaces.M },
  empty: { paddingHorizontal: spaces.L },
});
