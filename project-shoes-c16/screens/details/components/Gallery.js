import { Image, ScrollView, StyleSheet, View } from "react-native";
import Touchable from "../../../ui-components/touchable/Touchable";
import TextBoldL from "../../../ui-components/texts/TextBoldL";
import { spaces } from "../../../constants/spaces";
import { colors } from "../../../constants/colors";
import { radius } from "../../../constants/radius";

export default function Gallery({ images = [], selectedIndex, onSelect }) {
  return (
    <View style={styles.container}>
      <TextBoldL style={styles.title}>Galerie</TextBoldL>
      <ScrollView horizontal contentContainerStyle={styles.content}>
        {images.map((image, index) => (
          <View key={index} style={[styles.frame, index === selectedIndex && styles.selectedImage]}>
            <Touchable style={styles.touchable} color={colors.BLUE}
              selected={index === selectedIndex}
              accessibilityLabel={`Choisir la variante ${index + 1}`}
              disabled={typeof onSelect !== "function"}
              onPress={() => onSelect?.(index)}>
              <View style={styles.touchable}>
                <Image source={image} style={styles.image} resizeMode="contain" accessible={false} />
              </View>
            </Touchable>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginTop: spaces.L },
  title: { marginHorizontal: spaces.L, marginBottom: spaces.M },
  content: { paddingHorizontal: spaces.L, gap: spaces.M },
  frame: { width: 90, height: 90, backgroundColor: colors.LIGHT, borderRadius: radius.REGULAR,
    overflow: "hidden", borderWidth: 1, borderColor: "transparent" },
  touchable: { flex: 1 },
  selectedImage: { borderColor: colors.BLUE },
  image: { width: 90, height: 112.5, top: -20, transform: [{ rotate: "-20deg" }, { translateX: -spaces.S }] },
});
