import { FlatList, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { shoes } from "../../data/shoes";
import { colors } from "../../constants/colors";
import { spaces } from "../../constants/spaces";
import ItemSeparator from "../../ui-components/separators/ListItemSeparator";
import ListItem from "./components/ListItem";

const ids = ["adi3p", "reb64p", "nik84p"];
const catalog = shoes.flatMap((group) => group.stock);
const data = ids.map((id) => catalog.find((item) => item.id === id)).filter(Boolean);

function Separator() {
  return <ItemSeparator height={spaces.L} />;
}

export default function Notifications({ navigation }) {
  const insets = useSafeAreaInsets();
  const navigateToDetails = (id) => navigation.navigate("Details", { id });
  return (
    <View style={[styles.screen, { paddingLeft: insets.left, paddingRight: insets.right }]}>
      <FlatList data={data} keyExtractor={(item) => item.id}
        renderItem={({ item }) => <ListItem item={item} navigateToDetails={navigateToDetails} />}
        ItemSeparatorComponent={Separator}
        ListEmptyComponent={<Text style={styles.empty}>Aucune offre à afficher.</Text>}
        contentContainerStyle={styles.content} />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.LIGHT },
  content: { paddingTop: spaces.M, paddingBottom: spaces.L },
  empty: { padding: spaces.L, color: colors.DARK },
});
