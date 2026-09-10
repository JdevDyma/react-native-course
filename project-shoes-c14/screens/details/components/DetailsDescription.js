import { ActivityIndicator, Pressable, StyleSheet, View } from "react-native";
import { Ionicons } from "@react-native-vector-icons/ionicons";
import useUserProfile from "../../../hooks/useUserProfile";
import UserProfileStatus from "../../../ui-components/UserProfileStatus";
import TextMediumM from "../../../ui-components/texts/TextMediumM";
import TextBoldXL from "../../../ui-components/texts/TextBoldXL";
import TextBoldL from "../../../ui-components/texts/TextBoldL";
import { spaces } from "../../../constants/spaces";
import { colors } from "../../../constants/colors";
import { ICON_SIZE } from "../../../constants/sizes";

export default function DetailsDescription({ name, price, description, id }) {
  const profile = useUserProfile();
  const isFavorite = profile.user?.favoritesIds.includes(id) ?? false;
  const favoriteIconName = isFavorite ? "star" : "star-outline";
  const disabled = !profile.canWrite;
  const toggleFavorite = () => profile.writeProfile((user) => ({
    favoritesIds: user.favoritesIds.includes(id)
      ? user.favoritesIds.filter((entry) => entry !== id)
      : [...user.favoritesIds, id],
  }));
  return (
    <View style={styles.container}>
      <TextMediumM blue style={styles.spacing}>MEILLEUR CHOIX</TextMediumM>
      <View style={styles.nameAndFavoriteContainer}>
        <TextBoldXL style={[styles.spacing, styles.name]}>{name}</TextBoldXL>
        <Pressable onPress={toggleFavorite} disabled={disabled} style={styles.favoriteButton}
          accessibilityRole="button"
          accessibilityLabel={isFavorite ? `Retirer ${name} des favoris` : `Ajouter ${name} aux favoris`}
          accessibilityState={{ selected: isFavorite, disabled, busy: profile.busy }}>
          {profile.busy ? <ActivityIndicator color={colors.BLUE} /> :
            <Ionicons name={favoriteIconName} size={ICON_SIZE} color={colors.BLUE} accessible={false} />}
        </Pressable>
      </View>
      <UserProfileStatus profile={profile} />
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
