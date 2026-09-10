import { FlatList, Text, View, StyleSheet, useWindowDimensions } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import useUserProfile from "../../hooks/useUserProfile";
import UserProfileStatus from "../../ui-components/UserProfileStatus";
import { colors } from "../../constants/colors";
import { spaces } from "../../constants/spaces";
import { shoes } from "../../data/shoes";
import VerticalCard from "../../ui-components/cards/VerticalCard";
import ListItemSeparator from "../../ui-components/separators/ListItemSeparator";
import TextBoldL from "../../ui-components/texts/TextBoldL";

const catalog = shoes.flatMap((group) => group.stock);

export default function Favorites({ navigation }) {
  const profile = useUserProfile();
  const ids = profile.user?.favoritesIds ?? [];
  const data = ids.map((id) => catalog.find((shoe) => shoe.id === id)).filter(Boolean);
  const unavailableCount = ids.length - data.length;
  const insets = useSafeAreaInsets();
  const { width, fontScale } = useWindowDimensions();
  const availableWidth = width - insets.left - insets.right;
  const numColumns = availableWidth < 360 || fontScale >= 1.5 ? 1 : 2;
  const navigateToDetails = (id) => navigation.navigate("Details", { id });
  const renderItem = ({ item }) => (
    <View style={[styles.cardContainer, { flex: 1 / numColumns }]}>
      <VerticalCard item={item} listScreen isFavorite onPress={() => navigateToDetails(item.id)} />
    </View>
  );
  return (
    <View style={[styles.container, { paddingLeft: insets.left, paddingRight: insets.right }]}>
      <FlatList key={numColumns} data={data} keyExtractor={(item) => item.id}
        renderItem={renderItem} numColumns={numColumns}
        ItemSeparatorComponent={<ListItemSeparator height={spaces.L} />}
        ListHeaderComponent={<>
          <UserProfileStatus profile={profile} />
          {unavailableCount > 0 ? <Text style={styles.emptyText}>{unavailableCount} favori(s) indisponible(s) dans le catalogue.</Text> : null}
        </>}
        ListEmptyComponent={profile.user && !profile.busy && !profile.message ?
          <View style={styles.emptyListContainer}><TextBoldL style={styles.emptyText}>
            {ids.length ? "Aucun favori disponible dans le catalogue" : "Vous n’avez pas encore de favoris"}
          </TextBoldL></View> : null}
        contentContainerStyle={[styles.content, data.length === 0 && styles.emptyContent]} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.LIGHT },
  content: { flexGrow: 1, paddingHorizontal: spaces.S, paddingTop: spaces.L, paddingBottom: spaces.XL },
  cardContainer: { paddingHorizontal: spaces.S, alignItems: "stretch" },
  emptyContent: { justifyContent: "center" },
  emptyListContainer: { alignItems: "center", padding: spaces.L },
  retryButton: { minHeight: 48, justifyContent: "center", padding: spaces.S },
  emptyText: { textAlign: "center" },
});
