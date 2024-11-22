import { View, StyleSheet, FlatList } from "react-native";
import { colors } from "../../constants/colors";
import { shoes } from "../../data/shoes";
import VerticalCard from "../../ui-components/cards/VerticalCard";
import ListItemSeparator from "../../ui-components/separators/ListItemSeparator";
import { spaces } from "../../constants/spaces";
import { SCREEN_HEIGHT } from "../../constants/sizes";

export default function NewsList({ navigation }) {
  const items = shoes.map((brand) => {
    return brand.stock.find((item) => item.new);
  });

  const navigateToDetails = (id) => navigation.navigate("Details", { id });

  const renderItem = ({ item }) => (
    <View style={styles.cardContainer}>
      <VerticalCard
        item={item}
        listScreen
        onPress={() => navigateToDetails(item.id)}
      />
    </View>
  );
  return (
    <View style={styles.container}>
      <FlatList
        data={items}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        numColumns={2}
        ItemSeparatorComponent={<ListItemSeparator height={spaces.L} />}
        contentContainerStyle={styles.contentStyle}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: SCREEN_HEIGHT,
    paddingVertical: spaces.L,
    paddingBottom: 106,
  },
  contentStyle: {
    paddingBottom: spaces.XL,
  },
  cardContainer: {
    flex: 0.5,
    height: 240,
    justifyContent: "center",
    alignItems: "center",
  },
});
