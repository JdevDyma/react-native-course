import { TouchableOpacity, View, StyleSheet, Image } from "react-native";
import { radius } from "../../../../constants/radius";
import { colors } from "../../../../constants/colors";
import { ICON_SIZE } from "../../../../constants/sizes";
import TextBoldL from "../../../../ui-components/texts/TextBoldL";
import { spaces } from "../../../../constants/spaces";

export default function BrandItem({ item, selectedBrand, setSelectedBrand }) {
  const selected = item.name === selectedBrand;
  const onPressBrand = () => setSelectedBrand(item.name);
  return (
    <TouchableOpacity
      onPress={onPressBrand}
      accessibilityRole="button"
      accessibilityLabel={item.name.replaceAll("-", " ")}
      accessibilityState={{ selected }}
    >
      {selected ? (
        <View style={styles.selectedBrandContainer}>
          <View style={styles.iconContainer}>
            <Image source={item.logo} style={styles.image} />
          </View>
          <TextBoldL style={styles.brandText}>
            {item.name.replaceAll("-", " ")}
          </TextBoldL>
        </View>
      ) : (
        <View style={[styles.iconContainer, styles.unselectedBrandContainer]}>
          <Image source={item.logo} style={styles.image} />
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  selectedBrandContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: radius.FULL,
    backgroundColor: colors.BLUE,
    padding: spaces.S,
  },
  iconContainer: {
    backgroundColor: colors.WHITE,
    borderRadius: radius.FULL,
    padding: spaces.S,
  },
  image: {
    width: ICON_SIZE,
    height: ICON_SIZE,
    resizeMode: "contain",
  },
  brandText: {
    color: colors.WHITE,
    marginHorizontal: spaces.S,
    textTransform: "capitalize",
  },
  unselectedBrandContainer: {
    marginTop: spaces.S,
  },
});
