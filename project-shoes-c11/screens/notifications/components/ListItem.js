import { useDispatch, useSelector } from "react-redux";
import { addSeenNotification } from "../../../store/slices/notificationsSlice";
import { StyleSheet, View, Image } from "react-native";
import TextBoldM from "../../../ui-components/texts/TextBoldM";
import TextMediumM from "../../../ui-components/texts/TextMediumM";
import TextBoldL from "../../../ui-components/texts/TextBoldL";
import TextMediumS from "../../../ui-components/texts/TextMediumS";
import Touchable from "../../../ui-components/touchable/Touchable";
import { radius } from "../../../constants/radius";
import { spaces } from "../../../constants/spaces";
import { colors } from "../../../constants/colors";

export default function ListItem({ item, navigateToDetails }) {
  const dispatch = useDispatch();
  const seenNotificationsIds = useSelector(
    (state) => state.notifications.seenNotificationsIds
  );
  const isSeen = seenNotificationsIds.includes(item.id);
  const canNavigate = typeof navigateToDetails === "function";
  const image = item.items?.[0]?.image;

  function navigate() {
    if (!canNavigate) return;
    navigateToDetails(item.id);
    dispatch(addSeenNotification(item.id));
  }
  return (
    <View style={styles.container}>
      <Touchable color={colors.BLUE}
        accessibilityLabel={`Consulter l’offre ${item.name}, ${item.price} euros, ${isSeen ? "déjà vue" : "non vue"}`}
        onPress={canNavigate ? navigate : undefined}>
        <View style={styles.itemContainer}>
          <View style={styles.imageContainer}>
            {image != null && <Image source={image} style={styles.image} resizeMode="contain" accessible={false} />}
          </View>
          <View style={styles.textContainer}>
            <TextBoldM>Nouvelle offre</TextBoldM>
            <TextMediumM>{item.name}</TextMediumM>
            <TextBoldL>{item.price} €</TextBoldL>
          </View>
          <View style={styles.metaContainer}>
            <TextMediumS>Il y a 2 jours</TextMediumS>
            {isSeen ? (
              <TextMediumS style={styles.seenText}>vu</TextMediumS>
            ) : (
              <View style={styles.dot} />
            )}
          </View>
        </View>
      </Touchable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { width: "100%", minHeight: 120, overflow: "hidden" },
  itemContainer: { flexDirection: "row", flexWrap: "wrap", alignItems: "center",
    paddingVertical: spaces.XS, paddingHorizontal: spaces.L },
  imageContainer: { width: 96, height: 112, borderRadius: radius.REGULAR },
  image: { width: "100%", height: "100%",
    transform: [{ rotate: "-20deg" }, { translateX: -spaces.S }, { translateY: -spaces.S }] },
  textContainer: { flexGrow: 1, flexShrink: 1, flexBasis: 120, paddingVertical: spaces.S },
  metaContainer: { marginLeft: "auto", paddingVertical: spaces.S },
  seenText: { marginTop: spaces.M, alignSelf: "flex-end" },
  dot: { width: spaces.S, height: spaces.S, borderRadius: radius.FULL,
    backgroundColor: colors.BLUE, marginTop: spaces.M, alignSelf: "flex-end" },
});
