import { StyleSheet, View, useWindowDimensions } from "react-native";
import { Skeleton, SkeletonProps } from "../../../ui-components/skeletons/Skeleton";
import { spaces } from "../../../constants/spaces";

export default function SkeletonCartRow() {
  const { width, fontScale } = useWindowDimensions();
  const compact = width < 360 || fontScale >= 1.5;
  return <View pointerEvents="none" accessibilityElementsHidden
    importantForAccessibility="no-hide-descendants" style={[styles.container, compact && styles.compact]}>
    <Skeleton.Group show>
      <View style={[styles.left, compact && styles.compact]}>
        <Skeleton width={88} height={112} {...SkeletonProps} />
        <View style={styles.column}>
          <Skeleton width="100%" height={24} {...SkeletonProps} />
          <Skeleton width={70} height={24} {...SkeletonProps} />
          <Skeleton width={110} height={48} {...SkeletonProps} />
        </View>
      </View>
      <View style={[styles.right, compact && styles.compactMeta]}>
        <Skeleton width={64} height={24} {...SkeletonProps} />
        <Skeleton width={48} height={48} {...SkeletonProps} />
      </View>
    </Skeleton.Group>
  </View>;
}
const styles = StyleSheet.create({
  container: { flexDirection: "row", flexWrap: "wrap", width: "100%", minHeight: 140,
    gap: spaces.S, paddingVertical: spaces.S, paddingHorizontal: spaces.S },
  left: { flex: 1, flexBasis: 220, flexDirection: "row", gap: spaces.M },
  column: { flex: 1, minWidth: 0, gap: spaces.S },
  right: { justifyContent: "space-between", alignItems: "center", gap: spaces.S },
  compact: { flexDirection: "column", flexBasis: "auto" },
  compactMeta: { flexDirection: "row", justifyContent: "space-between" },
});
