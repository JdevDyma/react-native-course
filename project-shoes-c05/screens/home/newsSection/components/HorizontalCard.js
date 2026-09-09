import { View, StyleSheet, Image } from "react-native";
import TextMediumM from "../../../../ui-components/texts/TextMediumM";
import TextBoldXL from "../../../../ui-components/texts/TextBoldXL";
import TextBoldM from "../../../../ui-components/texts/TextBoldM";
import TextRegularS from "../../../../ui-components/texts/TextRegularS";
import { colors } from "../../../../constants/colors";
import { radius } from "../../../../constants/radius";
import { spaces } from "../../../../constants/spaces";

export default function HorizontalCard({ item }) {
  const image = item.items?.[0]?.image;
  return (
    <View style={styles.container}>
      <View style={styles.descriptionContainer}>
        <View>
          <TextMediumM blue>MEILLEUR CHOIX</TextMediumM>
          <TextBoldXL>{item.name}</TextBoldXL>
        </View>
        <TextBoldM>{item.price} €</TextBoldM>
      </View>
      <View style={styles.imageContainer}>
        {image ? (
          <Image source={image} style={styles.image} accessible={false} />
        ) : (
          <TextRegularS>Image indisponible</TextRegularS>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    minHeight: 180,
    backgroundColor: colors.WHITE,
    borderRadius: radius.REGULAR,
    flexDirection: "row",
    flexWrap: "wrap",
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
    flexBasis: 160,
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
