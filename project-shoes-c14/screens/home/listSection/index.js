import { View, StyleSheet } from "react-native";
import { spaces } from "../../../constants/spaces";
import ShoesList from "./components/ShoesList";
import Banner from "../components/Banner";

export default function ListSection({ selectedBrand, inputValue, navigation }) {
  const navigateToList = () => {
    navigation.navigate("List", { brand: selectedBrand });
  };
  return (
    <View style={styles.container}>
      <Banner text="Shoes populaires" onPress={navigateToList} />
      <ShoesList selectedBrand={selectedBrand} inputValue={inputValue} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 240,
    minHeight: 300,
    paddingVertical: spaces.L,
  },
});
