import { Pressable, StyleSheet, View } from "react-native";
import { Ionicons } from "@react-native-vector-icons/ionicons";
import { useDispatch, useSelector } from "react-redux";
import { addFavorite, removeFavorite } from "../../../store/slices/favoritesSlice";
import TextMediumM from "../../../ui-components/texts/TextMediumM";
import TextBoldXL from "../../../ui-components/texts/TextBoldXL";
import TextBoldL from "../../../ui-components/texts/TextBoldL";
import { spaces } from "../../../constants/spaces";
import { colors } from "../../../constants/colors";
import { ICON_SIZE } from "../../../constants/sizes";

export default function DetailsDescription({ name, price, description, id }) {
  const dispatch = useDispatch();
  const favoritesShoesIds = useSelector((state) => state.favorites.favoritesShoesIds);
  const isFavorite = favoritesShoesIds.includes(id);
  const favoriteIconName = isFavorite ? "star" : "star-outline";

  function toggleFavorite() {
    dispatch(isFavorite ? removeFavorite(id) : addFavorite(id));
  }

  return (
    <View style={styles.container}>
      <TextMediumM blue style={styles.spacing}>MEILLEUR CHOIX</TextMediumM>
      <View style={styles.nameAndFavoriteContainer}>
        <TextBoldXL style={[styles.spacing, styles.name]}>{name}</TextBoldXL>
        <Pressable onPress={toggleFavorite} style={styles.favoriteButton}
          accessibilityRole="button"
          accessibilityLabel={isFavorite ? `Retirer ${name} des favoris` : `Ajouter ${name} aux favoris`}
          accessibilityState={{ selected: isFavorite }}>
          <Ionicons name={favoriteIconName} size={ICON_SIZE} color={colors.BLUE}
            accessible={false} />
        </Pressable>
      </View>
      <TextBoldL style={styles.spacing}>{price} €</TextBoldL>
      <TextMediumM style={styles.description}>{description}</TextMediumM>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { paddingHorizontal: spaces.L },
  spacing: { marginBottom: spaces.S },
  description: { color: colors.GREY },
  nameAndFavoriteContainer: {
    flexDirection: "row", alignItems: "flex-start", gap: spaces.S,
    justifyContent: "space-between",
  },
  name: { flex: 1 },
  favoriteButton: { minWidth: 48, minHeight: 48, alignItems: "center", justifyContent: "center" },
});
