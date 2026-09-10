import { Image, StyleSheet, View, useWindowDimensions } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { spaces } from "../../../constants/spaces";

export default function DetailsImage({ source, name }) {
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const size = Math.max(1, Math.min(width - insets.left - insets.right, 480));

  return (
    <View style={[styles.container, { width: size, height: size * 0.8 }]}>
      <Image
        source={require("../../../assets/images/details/shoes-stand.png")}
        resizeMode="contain"
        accessible={false}
        style={[styles.stand, { width: size * 0.8, height: size * 0.14 }]}
      />
      {source != null && (
        <Image source={source} accessibilityLabel={name} accessible
          resizeMode="contain"
          style={[styles.shoe, { width: size, height: size * 1.25, top: -size * 0.32 }]} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { position: "relative", alignSelf: "center", alignItems: "center", overflow: "hidden" },
  stand: { position: "absolute", bottom: "8%" },
  shoe: { position: "absolute", transform: [{ rotate: "-20deg" }, { translateX: -spaces.M }] },
});
