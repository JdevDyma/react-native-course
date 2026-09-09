import { useCallback, useLayoutEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { pictures } from "../data/data";
import { addFavorite, removeFavorite } from "../store/slices/favoritesSlice";
import PictureImage from "../components/PictureImage";

export default function PictureDetails({ route, navigation }) {
  const dispatch = useDispatch();
  const favoritesIds = useSelector((state) => state.favorites.picturesIds);
  const id = route.params?.id;
  const picture = typeof id === "string"
    ? pictures.find((item) => item.id === id)
    : undefined;
  const isFavorite = picture ? favoritesIds.includes(picture.id) : false;

  const toggleFavoriteStatus = useCallback(() => {
    if (!picture) return;
    if (!isFavorite) {
      dispatch(addFavorite(picture.id));
    } else {
      dispatch(removeFavorite(picture.id));
    }
  }, [picture, isFavorite, dispatch]);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: picture
        ? () => (
          <Pressable
            style={styles.favoriteButton}
            accessibilityRole="button"
            accessibilityLabel={isFavorite
              ? "Retirer l’image des favoris"
              : "Ajouter l’image aux favoris"}
            accessibilityState={{ selected: isFavorite }}
            onPress={toggleFavoriteStatus}
          >
            <MaterialIcons name={isFavorite ? "favorite" : "favorite-outline"}
              size={24} color="black" accessible={false} />
          </Pressable>
        )
        : undefined,
    });
  }, [navigation, picture, isFavorite, toggleFavoriteStatus]);

  const insets = useSafeAreaInsets();
  return (
    <View style={[styles.screen, { paddingBottom: insets.bottom,
      paddingLeft: insets.left, paddingRight: insets.right }]}>
      {picture ? (
        <PictureImage key={picture.url} uri={picture.url} style={styles.image}
          label={`Image ${picture.id}`} />
      ) : (
        <Text style={styles.message}>Image introuvable.</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "white" },
  image: { flex: 1 },
  message: { color: "black", textAlign: "center", padding: 24 },
  favoriteButton: { minWidth: 48, minHeight: 48, alignItems: "center", justifyContent: "center" },
});
