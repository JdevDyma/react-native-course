import { useEffect, useRef, useState } from "react";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";
import * as ImagePicker from "expo-image-picker";
import { Ionicons } from "@react-native-vector-icons/ionicons";
import { Skeleton, SkeletonProps } from "../../../ui-components/skeletons/Skeleton";
import { colors } from "../../../constants/colors";
import { spaces } from "../../../constants/spaces";

export default function ProfilePicture({ image, setImage, photoUrl, disabled }) {
  const mounted = useRef(true);
  const choosing = useRef(false);
  const [failedUri, setFailedUri] = useState(null);
  const [attempt, setAttempt] = useState(0);
  const uri = image?.uri || photoUrl || "";
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
      {uri ? <LoadingPhoto key={`${uri}:${attempt}`} uri={uri}
        onFailure={() => { if (mounted.current) setFailedUri(uri); }} />
        : <Ionicons name="person-circle" size={90} color={colors.BLUE} />}
      <View style={styles.badge}><Ionicons name="camera" size={18} color={colors.WHITE} /></View>
    </Pressable>
    {failedUri === uri && uri ? <>
      <Text accessibilityRole="alert">Impossible de charger cette photo.</Text>
      <Pressable accessibilityRole="button" accessibilityLabel="Réessayer le chargement de la photo"
        disabled={disabled} accessibilityState={{ disabled }} style={styles.retry}
        onPress={() => { setFailedUri(null); setAttempt((value) => value + 1); }}>
        <Text>Réessayer la photo</Text>
      </Pressable>
    </> : null}
    {error ? <Text accessibilityRole="alert">{error}</Text> : null}
  </View>;
}
function LoadingPhoto({ uri, onFailure }) {
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);
  const mounted = useRef(true);
  useEffect(() => { mounted.current = true; return () => { mounted.current = false; }; }, []);
  return <View accessibilityLabel={loading ? "Chargement de la photo" : undefined}>
    <Skeleton {...SkeletonProps} show={loading} width={90} height={90} radius={45}>
      {failed ? <Ionicons name="person-circle" size={90} color={colors.BLUE} /> :
        <Image source={{ uri }} style={styles.image} accessible={false}
          onLoadStart={() => { if (mounted.current) setLoading(true); }}
          onLoad={() => { if (mounted.current) setLoading(false); }}
          onError={() => {
            if (!mounted.current) return;
            setFailed(true);
            setLoading(false);
            onFailure();
          }}
          onLoadEnd={() => { if (mounted.current) setLoading(false); }} />}
    </Skeleton>
  </View>;
}
const styles = StyleSheet.create({
  retry: { minHeight: 48, padding: spaces.M, justifyContent: "center" },
  container: { alignItems: "center", marginBottom: spaces.XL, gap: spaces.M },
  target: { width: 90, height: 100, alignItems: "center" },
  image: { width: 90, height: 90, borderRadius: 45 },
  badge: { position: "absolute", bottom: 0, width: 32, height: 32, borderRadius: 16,
    backgroundColor: colors.BLUE, alignItems: "center", justifyContent: "center" },
});
