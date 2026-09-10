import Touchable from "../touchable/Touchable";
import { cardShadow } from "../../constants/cardShadow";
import useResponsiveSizes from "../../hooks/useResponsiveSizes";
import { View, StyleSheet, Image } from "react-native";
import { colors } from "../../constants/colors";
import { radius } from "../../constants/radius";
import { spaces } from "../../constants/spaces";
import TextMediumS from "../texts/TextMediumS";
import TextBoldL from "../texts/TextBoldL";
import TextMediumM from "../texts/TextMediumM";
import { Ionicons } from "@react-native-vector-icons/ionicons";
import { SMALL_ICON_SIZE } from "../../constants/sizes";
import { AntDesign } from "@react-native-vector-icons/ant-design";

export default function VerticalCard({ item, onPress, listScreen = false, isFavorite = false }) {
  const { width, isLargeWindow } = useResponsiveSizes();
  const cardWidth = listScreen ? "100%" : isLargeWindow ? width / 3.5 : 180;
  const availableColors = item.items.map((variant) => variant.color);
  return (
    <View style={[styles.container, { width: cardWidth }]}>
      <View style={styles.clip}>
        <Touchable style={styles.touchableContainer} onPress={onPress}
          accessibilityLabel={`${item.name}, ${item.price} euros${isFavorite ? ", favori" : ""}${listScreen ? `, couleurs : ${availableColors.join(", ")}` : ""}`}>
      {isFavorite && (
        <View style={styles.favoriteIcon} pointerEvents="none" accessible={false}
          accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
          <Ionicons name="star" size={SMALL_ICON_SIZE} color={colors.BLUE} />
        </View>
      )}
      <View style={styles.imageContainer}>
        <Image source={item.items[0].image} style={styles.image} />
      </View>
      <View style={[styles.descriptionContainer, listScreen && styles.listDescription]}>
        <View>
          <TextMediumS blue>TOP VENTE</TextMediumS>
          <TextBoldL style={styles.itemName}>{item.name}</TextBoldL>
        </View>
        {listScreen ? (
          <View style={styles.bottomDescriptionContainer}>
            <TextMediumM>{item.price} €</TextMediumM>
            <View style={styles.colorsContainer} accessible={false}
              accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
              {availableColors.map((color) => (
                <View key={color} style={[styles.colorItem, { backgroundColor: color }]} />
              ))}
            </View>
          </View>
        ) : <TextMediumM>{item.price} €</TextMediumM>}
      </View>
      {!listScreen && <View style={styles.btn} accessible={false}
        accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
        <AntDesign name="plus" size={24} color={colors.WHITE} />
      </View>}
        </Touchable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  favoriteIcon: { position: "absolute", top: spaces.M, left: spaces.M, zIndex: 1 },
  listDescription: { paddingBottom: spaces.S },
  bottomDescriptionContainer: { flexDirection: "row", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: spaces.S },
  colorsContainer: { flexDirection: "row", flexWrap: "wrap", gap: spaces.XS },
  colorItem: { width: spaces.M, height: spaces.M, borderRadius: radius.FULL, borderWidth: 1, borderColor: colors.GREY },
  clip: { flexGrow: 1, borderRadius: radius.REGULAR, overflow: "hidden" },
  touchableContainer: { flexGrow: 1, minHeight: 250, padding: spaces.S },
  container: {
    flexGrow: 1,
    ...cardShadow,
    width: 180,
    minHeight: 250,
    backgroundColor: colors.WHITE,
    borderRadius: radius.REGULAR,
  },
  imageContainer: {
    height: 125,
    justifyContent: "center",
    alignItems: "center",
    padding: spaces.S,
  },
  image: {
    width: "100%",
    height: "100%",
    resizeMode: "contain",
    transform: [
      { rotate: "-20deg" },
      { translateX: -spaces.S },
      { translateY: -spaces.S },
    ],
  },
  descriptionContainer: {
    flexGrow: 1,
    gap: spaces.M,
    paddingBottom: 40,
    justifyContent: "space-between",
    padding: spaces.S,
  },
  itemName: {
    marginTop: spaces.S,
  },
  btn: {
    position: "absolute",
    bottom: 0,
    right: 0,
    backgroundColor: colors.BLUE,
    borderTopLeftRadius: radius.REGULAR,
    borderBottomRightRadius: radius.REGULAR,
    justifyContent: "center",
    alignItems: "center",
    width: 36,
    height: 36,
  },
});
