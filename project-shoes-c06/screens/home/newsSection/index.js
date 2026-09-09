import useResponsiveSizes from "../../../hooks/useResponsiveSizes";
import { Alert, View, StyleSheet } from "react-native";
import Banner from "../components/Banner";
import { shoes } from "../../../data/shoes";
import HorizontalCard from "./components/HorizontalCard";
import TextRegularM from "../../../ui-components/texts/TextRegularM";
import { spaces } from "../../../constants/spaces";

export default function NewsSection({ selectedBrand }) {
  const { height, isLargeWindow } = useResponsiveSizes();
  const stock = shoes.find((group) => group.brand === selectedBrand)?.stock ?? [];
  const item = stock.find((shoe) => shoe.new);
  return (
    <View style={[styles.container, { minHeight: height < 400 ? 240 : isLargeWindow ? 320 : 230 }]}>
      <Banner text="Nouveautés" />
      {item ? (
        <HorizontalCard item={item} onPress={() => Alert.alert("Chaussure sélectionnée", item.name)} />
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
