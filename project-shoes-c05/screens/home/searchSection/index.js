import { View, StyleSheet } from "react-native";
import SearchInput from "../../../ui-components/inputs/SearchInput";
import { spaces } from "../../../constants/spaces";
import BrandsList from "./components/BrandsList";

export default function SearchSection({ inputValue, setInputValue, selectedBrand, setSelectedBrand }) {
  return (
    <View style={styles.container}>
      <SearchInput
        placeholder="Trouvez vos shoes"
        value={inputValue}
        onChangeText={setInputValue}
      />
      <BrandsList selectedBrand={selectedBrand} setSelectedBrand={setSelectedBrand} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 120,
    minHeight: 144,
    paddingVertical: spaces.S,
    gap: spaces.M,

  },
});
