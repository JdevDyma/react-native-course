import Touchable from "../../../../ui-components/touchable/Touchable";
import { cardShadow } from "../../../../constants/cardShadow";
import useResponsiveSizes from "../../../../hooks/useResponsiveSizes";
import { View, StyleSheet, Image } from "react-native";
import TextMediumM from "../../../../ui-components/texts/TextMediumM";
import TextBoldXL from "../../../../ui-components/texts/TextBoldXL";
import TextBoldM from "../../../../ui-components/texts/TextBoldM";
import TextRegularS from "../../../../ui-components/texts/TextRegularS";
import { colors } from "../../../../constants/colors";
import { radius } from "../../../../constants/radius";
import { spaces } from "../../../../constants/spaces";

export default function HorizontalCard({ item, onPress }) {
  const { height, isLargeWindow } = useResponsiveSizes();
  const isShortWindow = height < 400;
  const imageSize = isLargeWindow && !isShortWindow ? { width: 160, height: 128 } : { width: 112, height: 90 };
  const image = item.items?.[0]?.image;
  return (
    <View style={styles.container}>
      <View style={styles.clip}>
        <Touchable style={styles.touchableContainer} onPress={onPress}
          accessibilityLabel={`${item.name}, ${item.price} euros`}>
      <View style={[styles.descriptionContainer, { padding: isLargeWindow ? spaces.XL : spaces.L }]}>
        <View>
          <TextMediumM blue>MEILLEUR CHOIX</TextMediumM>
          <TextBoldXL>{item.name}</TextBoldXL>
        </View>
        <TextBoldM>{item.price} €</TextBoldM>
      </View>
      <View style={styles.imageContainer}>
        {image ? (
          <Image source={image} style={[styles.image, imageSize, isShortWindow && styles.shortImage]} accessible={false} />
        ) : (
          <TextRegularS>Image indisponible</TextRegularS>
        )}
      </View>
        </Touchable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  shortImage: { transform: [{ rotate: "-20deg" }, { translateX: -spaces.XS }, { translateY: -spaces.S }, { scale: 0.8 }] },
  clip: { flexGrow: 1, borderRadius: radius.REGULAR, overflow: "hidden" },
  touchableContainer: { flexGrow: 1, minHeight: 180, flexDirection: "row", flexWrap: "wrap" },
  container: {
    ...cardShadow,
    minHeight: 180,
    backgroundColor: colors.WHITE,
    borderRadius: radius.REGULAR,
    marginHorizontal: spaces.L,
  },
  descriptionContainer: {
    flexGrow: 1,
    flexBasis: 140,
    justifyContent: "space-between",
    padding: spaces.L,
    gap: spaces.M,
  },
  imageContainer: {
    flexGrow: 1,
    flexBasis: 190,
    minHeight: 180,
    alignItems: "center",
    justifyContent: "center",
  },
  image: {
    width: 112,
    height: 90,
    resizeMode: "contain",
    transform: [
      { rotate: "-20deg" },
      { translateX: -spaces.XS },
      { translateY: -spaces.S },
      { scale: 1.1 },
    ],
  },
});
