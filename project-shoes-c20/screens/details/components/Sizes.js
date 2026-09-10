import { ScrollView, StyleSheet, TouchableOpacity, View } from "react-native";
import TextBoldL from "../../../ui-components/texts/TextBoldL";
import TextMediumM from "../../../ui-components/texts/TextMediumM";
import { spaces } from "../../../constants/spaces";
import { colors } from "../../../constants/colors";
import { cardShadow } from "../../../constants/cardShadow";
import { radius } from "../../../constants/radius";

export default function Sizes({ sizes = [], selectedSize, setSelectedSize }) {
  return (
    <View style={styles.container}>
      <TextBoldL style={styles.title}>Tailles</TextBoldL>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.contentContainer}>
        {Array(9).fill(0).map((_, index) => {
          const size = index + 37;
          const available = sizes.includes(size);
          const selected = available && selectedSize === size;
          return (
            <TouchableOpacity key={size}
              disabled={!available || typeof setSelectedSize !== "function"}
              accessibilityRole="button" accessibilityLabel={`Pointure ${size}`}
              accessibilityState={{ disabled: !available || typeof setSelectedSize !== "function", selected }}
              activeOpacity={0.8}
              onPress={() => { if (available) setSelectedSize?.(size); }}
              style={[
              styles.sizeContainer,
              selected ? styles.selectedSizeContainer : available ? styles.availableSizeContainer : styles.unavailableSizeContainer,
            ]}>
              <TextMediumM style={selected ? styles.selectedSizeText : styles.sizeText}>
                {size}
              </TextMediumM>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginTop: spaces.L },
  title: { marginLeft: spaces.L, marginBottom: spaces.M, color: colors.DARK },
  contentContainer: { paddingHorizontal: spaces.L, gap: spaces.M },
  sizeContainer: {
    minWidth: 60, minHeight: 60, padding: spaces.S,
    borderRadius: radius.FULL, justifyContent: "center", alignItems: "center",
    borderWidth: 1, marginBottom: spaces.S,
  },
  availableSizeContainer: { backgroundColor: colors.LIGHT, borderColor: colors.BLUE },
  unavailableSizeContainer: { backgroundColor: colors.WHITE, borderColor: colors.GREY },
  selectedSizeContainer: { backgroundColor: colors.BLUE, borderColor: colors.BLUE, ...cardShadow },
  selectedSizeText: { color: colors.WHITE },
  sizeText: { color: colors.DARK },
});
