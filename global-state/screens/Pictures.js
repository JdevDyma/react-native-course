import { useSelector } from "react-redux";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { FlatList, Pressable, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { pictures } from "../data/data";
import PictureImage from "../components/PictureImage";

export default function Pictures({ navigation }) {
  const favoritesIds = useSelector((state) => state.favorites.picturesIds);
  const insets = useSafeAreaInsets();

  const renderItem = ({ item }) => {
    const isFavorite = favoritesIds.includes(item.id);
    return (
      <Pressable
        style={styles.imageContainer}
        accessibilityRole="button"
        accessibilityLabel={`Ouvrir l’image ${item.id}${isFavorite ? ", dans les favoris" : ""}`}
        onPress={() => navigation.navigate("Picture", { id: item.id })}
      >
        <PictureImage key={item.url} uri={item.url} style={styles.image}
          label={`Image ${item.id}`} accessible={false} />
        {isFavorite ? (
          <View pointerEvents="none" style={styles.favoriteIcon}>
            <MaterialIcons name="favorite" size={32} color="red" accessible={false} />
          </View>
        ) : null}
      </Pressable>
    );
  };

  return (
    <View style={[styles.screen, { paddingBottom: insets.bottom,
      paddingLeft: insets.left, paddingRight: insets.right }]}>
      <FlatList
        data={pictures}
        extraData={favoritesIds}
        numColumns={2}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "white" },
  imageContainer: { flex: 0.5, padding: 8 },
  image: { width: "100%", height: 360, borderRadius: 8 },
  favoriteIcon: { position: "absolute", bottom: 20, right: 20 },
});
