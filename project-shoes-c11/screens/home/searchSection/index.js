import useResponsiveSizes from "../../../hooks/useResponsiveSizes";
import { View, StyleSheet } from "react-native";
import SearchInput from "../../../ui-components/inputs/SearchInput";
import { spaces } from "../../../constants/spaces";
import BrandsList from "./components/BrandsList";

export default function SearchSection({ inputValue, setInputValue, selectedBrand, setSelectedBrand }) {
  const { isLargeWindow } = useResponsiveSizes();
  return (
    <View style={styles.container}>
      <View style={[styles.inputWrapper, { alignItems: isLargeWindow ? "center" : "flex-start" }]}>
      <SearchInput
        placeholder="Trouvez vos shoes"
        value={inputValue}
        onChangeText={setInputValue}
      />
      </View>
      <BrandsList selectedBrand={selectedBrand} setSelectedBrand={setSelectedBrand} />
    </View>
  );
}

const styles = StyleSheet.create({
  inputWrapper: { width: "100%", paddingHorizontal: spaces.L },
  container: {
    flexGrow: 120,
    minHeight: 144,
    paddingVertical: spaces.S,
    gap: spaces.M,

  },
});
