import useResponsiveSizes from "../../../../hooks/useResponsiveSizes";
import { TouchableOpacity, View, StyleSheet, Image } from "react-native";
import { radius } from "../../../../constants/radius";
import { colors } from "../../../../constants/colors";
import { ICON_SIZE, SMALL_ICON_SIZE } from "../../../../constants/sizes";
import TextBoldL from "../../../../ui-components/texts/TextBoldL";
import { spaces } from "../../../../constants/spaces";

export default function BrandItem({ item, selectedBrand, setSelectedBrand }) {
  const { isSmallWindow } = useResponsiveSizes();
  const iconSize = isSmallWindow ? SMALL_ICON_SIZE : ICON_SIZE;
  const selectedPadding = isSmallWindow ? spaces.XS : spaces.S;
  const selected = item.name === selectedBrand;
  const onPressBrand = () => setSelectedBrand(item.name);
  return (
    <TouchableOpacity
      style={styles.touchTarget}
      onPress={onPressBrand}
      accessibilityRole="button"
      accessibilityLabel={item.name.replaceAll("-", " ")}
      accessibilityState={{ selected }}
    >
      {selected ? (
        <View style={[styles.selectedBrandContainer, { padding: selectedPadding }]}>
          <View style={styles.iconContainer}>
            <Image source={item.logo} style={[styles.image, { width: iconSize, height: iconSize }]} />
          </View>
          <TextBoldL style={styles.brandText}>
            {item.name.replaceAll("-", " ")}
          </TextBoldL>
        </View>
      ) : (
        <View style={[styles.iconContainer, { marginTop: selectedPadding }]}>
          <Image source={item.logo} style={[styles.image, { width: iconSize, height: iconSize }]} />
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  touchTarget: { minWidth: 48, minHeight: 48, justifyContent: "center", alignItems: "center" },
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
