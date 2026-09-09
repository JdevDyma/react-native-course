import Touchable from "../../../../ui-components/touchable/Touchable";
import { cardShadow } from "../../../../constants/cardShadow";
import useResponsiveSizes from "../../../../hooks/useResponsiveSizes";
import { View, StyleSheet, Image } from "react-native";
import { colors } from "../../../../constants/colors";
import { radius } from "../../../../constants/radius";
import { spaces } from "../../../../constants/spaces";
import TextMediumS from "../../../../ui-components/texts/TextMediumS";
import TextBoldL from "../../../../ui-components/texts/TextBoldL";
import TextMediumM from "../../../../ui-components/texts/TextMediumM";
import { AntDesign } from "@react-native-vector-icons/ant-design";

export default function VerticalCard({ item, onPress }) {
  const { width, isLargeWindow } = useResponsiveSizes();
  const cardWidth = isLargeWindow ? width / 3.5 : 180;
  return (
    <View style={[styles.container, { width: cardWidth }]}>
      <View style={styles.clip}>
        <Touchable style={styles.touchableContainer} onPress={onPress}
          accessibilityLabel={`${item.name}, ${item.price} euros`}>
      <View style={styles.imageContainer}>
        <Image source={item.items[0].image} style={styles.image} />
      </View>
      <View style={styles.descriptionContainer}>
        <View>
          <TextMediumS blue>TOP VENTE</TextMediumS>
          <TextBoldL style={styles.itemName}>{item.name}</TextBoldL>
        </View>
        <TextMediumM>{item.price} €</TextMediumM>
      </View>
      <View style={styles.btn} accessible={false}
        accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
        <AntDesign name="plus" size={24} color={colors.WHITE} />
      </View>
        </Touchable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  clip: { flexGrow: 1, borderRadius: radius.REGULAR, overflow: "hidden" },
  touchableContainer: { flexGrow: 1, minHeight: 250, padding: spaces.S },
  container: {
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
