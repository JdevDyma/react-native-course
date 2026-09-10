import { StyleSheet, View } from "react-native";
import { Skeleton, SkeletonProps } from "../../../ui-components/skeletons/Skeleton";
import TextBoldXL from "../../../ui-components/texts/TextBoldXL";
import CustomButton from "../../../ui-components/buttons/CustomButton";
import { colors } from "../../../constants/colors";
import { radius } from "../../../constants/radius";
import { spaces } from "../../../constants/spaces";

export default function SkeletonPriceSummary() {
  return <View style={styles.container}>
    <View pointerEvents="none" accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
      <Skeleton.Group show>
        {["Sous-total", "Frais de port", "Total"].map((label) => (
          <View key={label} style={styles.row}>
            <TextBoldXL>{label}</TextBoldXL>
            <Skeleton width={90} height={28} {...SkeletonProps} />
          </View>
        ))}
      </Skeleton.Group>
    </View>
    <CustomButton text="Passer la commande" disabled />
  </View>;
}
const styles = StyleSheet.create({
  container: { backgroundColor: colors.WHITE, borderTopLeftRadius: radius.REGULAR,
    borderTopRightRadius: radius.REGULAR, padding: spaces.L },
  row: { flexDirection: "row", flexWrap: "wrap", alignItems: "center",
    justifyContent: "space-between", gap: spaces.S, marginBottom: spaces.M },
});
