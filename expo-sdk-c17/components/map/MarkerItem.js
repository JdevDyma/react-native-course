import { Image, StyleSheet } from "react-native";

export default function MarkerItem({ isDragging = false, imageSource }) {
  return (
    <Image
      accessibilityLabel="Image associée au repère"
      style={[styles.image, { borderColor: isDragging ? "#8a00c9" : "#fff" }]}
      source={imageSource}
      resizeMode="cover"
    />
  );
}

const styles = StyleSheet.create({
  image: {
    width: 80,
    height: 80,
    borderRadius: 12,
    borderWidth: 4,
  },
});
