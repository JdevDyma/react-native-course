import { useEffect, useRef, useState } from "react";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { Alert, StyleSheet, TouchableOpacity } from "react-native";
import * as ImagePicker from "expo-image-picker";
import * as Location from "expo-location";
import * as MediaLibrary from "expo-media-library";
import PermissionsModal from "../permissions/PermissionsModal";

export default function PictureButton({ disabled = false, onBusyChange, addPersistedMarker, writeBlocked, pickerPending }) {
  const mounted = useRef(true);
  const [capturing, setCapturing] = useState(false);
  const [missingPermissions, setMissingPermissions] = useState([]);
  const [permissionMessage, setPermissionMessage] = useState("");
  const [, requestLocation, getLocation] = Location.useForegroundPermissions();
  const [, requestCamera, getCamera] = ImagePicker.useCameraPermissions();
  const [, requestLibrary, getLibrary] = MediaLibrary.usePermissions({
    writeOnly: true,
    granularPermissions: ["photo"],
  });

  useEffect(() => {
    mounted.current = true;
    return () => { mounted.current = false; };
  }, []);

  async function obtainPermission(getPermission, requestPermission, title, message = "Cette autorisation n’est pas accordée.") {
    let permission = await getPermission();
    if (!mounted.current) return false;
    if (!permission?.granted && permission?.canAskAgain) {
      permission = await requestPermission();
    }
    if (!mounted.current) return false;
    if (permission?.granted) return true;
    setPermissionMessage(message);
    setMissingPermissions([{ id: title, label: title, canAskAgain: permission?.canAskAgain, getPermission }]);
    return false;
  }

  async function savePicture(uri) {
    try {
      const granted = await obtainPermission(getLibrary, requestLibrary, "Copie dans la galerie non autorisée", "Le marqueur est ajouté, mais aucune copie n’a été enregistrée dans la galerie. Fermez cette fenêtre ; ne reprenez pas la photo pour créer le même marqueur.");
      if (!mounted.current) return;
      if (!granted) return;
      await MediaLibrary.Asset.create(uri);
      if (mounted.current) Alert.alert("Photo enregistrée", "Le marqueur est ajouté et une copie est enregistrée dans la galerie.");
    } catch {
      if (mounted.current) Alert.alert("Photo sur la carte", "Le marqueur est ajouté, mais la copie dans la galerie a échoué. Ne reprenez pas la photo pour créer le même marqueur.");
    }
  }

  async function takePictureHandler() {
    if (disabled || writeBlocked.current || pickerPending.current) return;
    pickerPending.current = true;
    setCapturing(true);
    onBusyChange(true);
    try {
      if (!(await obtainPermission(getLocation, requestLocation, "Localisation non autorisée"))) return;
      if (!(await obtainPermission(getCamera, requestCamera, "Caméra non autorisée"))) return;
      const picture = await ImagePicker.launchCameraAsync({ mediaTypes: ["images"], quality: 0.5 });
      if (!mounted.current || picture.canceled) return;
      const uri = picture.assets?.[0]?.uri;
      if (typeof uri !== "string" || !uri.trim()) throw new Error("Photo indisponible.");
      const position = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      if (!mounted.current) return;
      const { latitude, longitude } = position.coords;
      if (!Number.isFinite(latitude) || !Number.isFinite(longitude) || Math.abs(latitude) > 90 || Math.abs(longitude) > 180) {
        throw new Error("Position invalide.");
      }
      await addPersistedMarker({ latitude, longitude }, picture.assets[0]);
      if (!mounted.current) return;
      await savePicture(uri);
    } catch {
      if (mounted.current && !writeBlocked.current) Alert.alert("Photo non ajoutée", "La capture, la localisation ou l’enregistrement n’a pas abouti. Aucun nouvel ajout confirmé.");
    } finally {
      pickerPending.current = false;
      if (mounted.current) { setCapturing(false); onBusyChange(false); }
    }
  }

  return (
    <>
    <TouchableOpacity onPress={takePictureHandler} disabled={disabled || capturing}
      accessibilityRole="button" accessibilityLabel="Prendre une photo"
      accessibilityState={{ disabled: disabled || capturing, busy: capturing }}
      style={[styles.btn, capturing && styles.disabled]} activeOpacity={0.8}>
      <MaterialIcons name="photo-camera" size={30} color="black" />
    </TouchableOpacity>
    <PermissionsModal permissions={missingPermissions} message={permissionMessage}
      updatePermissions={setMissingPermissions} closeModal={() => setMissingPermissions([])} />
    </>
  );
}

const styles = StyleSheet.create({
  btn: { width: 60, height: 60, justifyContent: "center", alignItems: "center", backgroundColor: "#fff", borderRadius: 99 },
  disabled: { opacity: 0.5 },
});
