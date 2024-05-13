import { Text, View, StyleSheet, FlatList } from "react-native";
import { colors } from "../../constants/colors";
import { shoes } from "../../data/shoes";
import VerticalCard from "../../ui-components/cards/VerticalCard";
import ListItemSeparator from "../../ui-components/separators/ListItemSeparator";
import { spaces } from "../../constants/spaces";
import { useEffect } from "react";
import { useSelector } from "react-redux";
import TextBoldL from "../../ui-components/texts/TextBoldL";

export default function Favorites({ navigation }) {
  const favoritesShoesIds = useSelector(
    (state) => state.favorites.favoritesShoesIds
  );

  const data = favoritesShoesIds.map((id) =>
    shoes
      .find((item) => item.stock.find((elem) => elem.id === id))
      .stock.find((el) => el.id === id)
  );

  const navigateToDetails = (id) => navigation.navigate("Details", { id });

  const renderItem = ({ item }) => (
    <View style={styles.cardContainer}>
      <VerticalCard
        item={item}
        listScreen
        onPress={() => navigateToDetails(item.id)}
        isFavorite
      />
    </View>
  );

  if (favoritesShoesIds.length === 0) {
    return (
      <View style={styles.emptyListContainer}>
        <TextBoldL>Vous n'avez pas encore de favoris</TextBoldL>
      </View>
    );
  }

  return (
    <FlatList
      data={data}
      keyExtractor={(item) => item.id}
      renderItem={renderItem}
      numColumns={2}
      style={styles.container}
      ItemSeparatorComponent={<ListItemSeparator height={spaces.L} />}
      contentContainerStyle={styles.contentStyle}
    />
  );
}

const styles = StyleSheet.create({
  emptyListContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.LIGHT,
  },
  container: {
    flex: 1,
    backgroundColor: colors.LIGHT,
    paddingTop: spaces.L,
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