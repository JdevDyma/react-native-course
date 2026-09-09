import { useState } from "react";
import { Image, StyleSheet, Text, View } from "react-native";

export default function PictureImage({ uri, style, label, accessible = true }) {
  const [failed, setFailed] = useState(false);
  return (
    <View style={[styles.container, style]}>
      {failed ? (
        <Text style={styles.message}>Image indisponible.</Text>
      ) : (
        <Image
          source={{ uri }}
          style={StyleSheet.absoluteFill}
          resizeMode="cover"
          accessible={accessible}
          accessibilityLabel={label}
          onError={() => setFailed(true)}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { backgroundColor: "#111", alignItems: "center", justifyContent: "center", overflow: "hidden" },
  message: { color: "white", textAlign: "center", padding: 16 },
});
