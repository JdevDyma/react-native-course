import { useEffect } from "react";
import { StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import DetailsContent from "./DetailsContent";
import { shoes } from "../../data/shoes";
import { colors } from "../../constants/colors";
import { spaces } from "../../constants/spaces";

const catalog = shoes.flatMap((group) => group.stock);

function getTitle(data) {
  if (!data) return "Détails";
  if (data.gender === "m") return "Shoes Homme";
  if (data.gender === "f") return "Shoes Femme";
  if (data.gender === "u") return "Shoes Unisexe";
  return "Shoes";
}

export default function Details({ route, navigation }) {
  const insets = useSafeAreaInsets();
  const id = typeof route.params?.id === "string" ? route.params.id : "";
  const data = catalog.find((item) => item.id === id);
  const title = getTitle(data);
  useEffect(() => {
    navigation.setOptions({ title });
  }, [navigation, title]);
  if (!data) {
    return (
      <View style={[styles.screen, { paddingLeft: insets.left, paddingRight: insets.right, paddingBottom: insets.bottom }]}>
        <Text style={styles.message}>Cette chaussure est introuvable.</Text>
      </View>
    );
  }
  return <DetailsContent key={data.id} data={data} />;
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.WHITE },
  message: { padding: spaces.L, color: colors.DARK },
});
