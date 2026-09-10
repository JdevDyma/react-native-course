import { useEffect, useRef, useState } from "react";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";
import * as ImagePicker from "expo-image-picker";
import { Ionicons } from "@react-native-vector-icons/ionicons";
import { colors } from "../../../constants/colors";
import { spaces } from "../../../constants/spaces";

export default function ProfilePicture({ image, setImage, disabled }) {
  const mounted = useRef(true);
  const choosing = useRef(false);
  const [failedUri, setFailedUri] = useState(null);
  const [error, setError] = useState(null);
  useEffect(() => { mounted.current = true; return () => { mounted.current = false; }; }, []);
  async function pickImage() {
    if (disabled || choosing.current) return;
    choosing.current = true;
    setError(null);
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"], allowsEditing: true, quality: 0.5,
      });
      if (!mounted.current || result.canceled) return;
      const asset = result.assets?.[0];
      if (!asset?.uri || !asset.mimeType) throw new Error("Format non identifié.");
      setImage({ uri: asset.uri, mimeType: asset.mimeType, dirty: true });
      setFailedUri(null);
    } catch {
      if (mounted.current) setError("La sélection n’a pas abouti. Votre photo précédente est conservée.");
    } finally { choosing.current = false; }
  }
  return <View style={styles.container}>
    <Pressable onPress={() => { void pickImage(); }} disabled={disabled}
      accessibilityRole="button" accessibilityLabel="Choisir une photo de profil"
      accessibilityState={{ disabled }} style={styles.target}>
      {image?.uri && failedUri !== image.uri
        ? <Image key={image.uri} source={{ uri: image.uri }} style={styles.image}
            onError={() => setFailedUri(image.uri)} accessible={false} />
        : <Ionicons name="person-circle" size={90} color={colors.BLUE} />}
      <View style={styles.badge}><Ionicons name="camera" size={18} color={colors.WHITE} /></View>
    </Pressable>
    {error ? <Text accessibilityRole="alert">{error}</Text> : null}
  </View>;
}
const styles = StyleSheet.create({
  container: { alignItems: "center", marginBottom: spaces.XL, gap: spaces.M },
  target: { width: 90, height: 100, alignItems: "center" },
  image: { width: 90, height: 90, borderRadius: 45 },
  badge: { position: "absolute", bottom: 0, width: 32, height: 32, borderRadius: 16,
    backgroundColor: colors.BLUE, alignItems: "center", justifyContent: "center" },
});
