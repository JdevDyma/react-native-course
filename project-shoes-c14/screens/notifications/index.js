import { FlatList, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { shoes } from "../../data/shoes";
import { colors } from "../../constants/colors";
import { spaces } from "../../constants/spaces";
import ItemSeparator from "../../ui-components/separators/ListItemSeparator";
import ListItem from "./components/ListItem";
import useUserProfile from "../../hooks/useUserProfile";
import UserProfileStatus from "../../ui-components/UserProfileStatus";
const ids = ["adi3p", "reb64p", "nik84p"];
const catalog = shoes.flatMap((group) => group.stock);
const data = ids.map((id) => catalog.find((item) => item.id === id)).filter(Boolean);

function Separator() {
  return <ItemSeparator height={spaces.L} />;
}


export default function Notifications({ navigation }) {
  const profile = useUserProfile();
  const insets = useSafeAreaInsets();
  const navigateToDetails = (id) => navigation.navigate("Details", { id });
  const updateNotif = (id) => profile.writeProfile((user) => ({
    seenNotifsIds: user.seenNotifsIds.includes(id) ? user.seenNotifsIds : [...user.seenNotifsIds, id],
  }));
  return (
    <View style={[styles.screen, { paddingLeft: insets.left, paddingRight: insets.right }]}>
      {!profile.user ? <UserProfileStatus profile={profile} /> :
        <FlatList data={data} keyExtractor={(item) => item.id}
          renderItem={({ item }) => <ListItem item={item} navigateToDetails={navigateToDetails}
            isSeen={profile.user.seenNotifsIds.includes(item.id)} updateNotif={updateNotif} busy={!profile.canWrite} />}
          ItemSeparatorComponent={Separator}
          ListHeaderComponent={<UserProfileStatus profile={profile} />}
          ListEmptyComponent={<Text style={styles.empty}>Aucune offre à afficher.</Text>}
          contentContainerStyle={styles.content} />}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.LIGHT },
  content: { paddingTop: spaces.M, paddingBottom: spaces.L },
  empty: { padding: spaces.L, color: colors.DARK },
  status: { paddingHorizontal: spaces.L, paddingVertical: spaces.S },
  retry: { minHeight: 48, justifyContent: "center" },
});
