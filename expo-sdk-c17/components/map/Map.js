import { useEffect, useRef, useState } from "react";
import { Alert, Pressable, StyleSheet, Text, View } from "react-native";
import * as ImagePicker from "expo-image-picker";
import MapView, { Marker } from "react-native-maps";
import MarkerItem from "./MarkerItem";
import LocationButton from "./LocationButton";
import PictureButton from "../picture/PictureButton";
import PermissionsModal from "../permissions/PermissionsModal";
import FullPicture from "../picture/FullPicture";
import { persistMarker, removeMarker, updateMarkerCoordinate } from "../../utils/database";
import usePhotoOrientation from "../../hooks/usePhotoOrientation";
import * as Location from "expo-location";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const initialRegion = {
  latitude: 43.8765,
  longitude: 2.712,
  latitudeDelta: 10,
  longitudeDelta: 4,
};

function readCoordinate(value) {
  if (
    !Number.isFinite(value?.latitude) ||
    !Number.isFinite(value?.longitude) ||
    Math.abs(value.latitude) > 90 ||
    Math.abs(value.longitude) > 180
  ) {
    return null;
  }
  return { latitude: value.latitude, longitude: value.longitude };
}

export default function Map({ initialMarkers, reloadMarkers }) {
  const insets = useSafeAreaInsets();
  const mapRef = useRef(null);
  const mapReady = useRef(false);
  const pendingRegion = useRef(null);
  const locationPending = useRef(false);
  const initialLocationRequested = useRef(false);
  const [, requestLocationPermission, getLocationPermission] = Location.useForegroundPermissions();
  const [locationGranted, setLocationGranted] = useState(false);
  const [locating, setLocating] = useState(false);
  const [missingPermissions, setMissingPermissions] = useState([]);
  const [locationMessage, setLocationMessage] = useState("");
  const writeBlocked = useRef(false);
  const [storageMessage, setStorageMessage] = useState("");
  const pickerPending = useRef(false);
  const drag = useRef(null);
  const [mutating, setMutating] = useState(false);
  const [picking, setPicking] = useState(false);
  const mounted = useRef(true);
  useEffect(() => {
    mounted.current = true;
    if (!initialLocationRequested.current) {
      initialLocationRequested.current = true;
      void getUserLocation();
    }
    return () => { mounted.current = false; };
  }, []);
  const [markers, setMarkers] = useState(initialMarkers);

  const [selectedMarkerId, setSelectedMarkerId] = useState(null);
  const selectedMarker = markers.find((marker) => marker.id === selectedMarkerId);
  const orientation = usePhotoOrientation(Boolean(selectedMarker));
  const closeFullPicture = () => {
    if (!pickerPending.current) setSelectedMarkerId(null);
  };
  function mutationFailure() {
    writeBlocked.current = true;
    if (mounted.current) setStorageMessage("Écriture non confirmée. Rechargez les marqueurs pour retrouver les données réellement enregistrées avant de recommencer.");
  }
  function reloadStoredMarkers() {
    if (!pickerPending.current) reloadMarkers();
  }
  async function deleteSelectedMarker() {
    if (pickerPending.current || writeBlocked.current || !selectedMarker) return;
    const id = selectedMarker.id;
    pickerPending.current = true;
    setMutating(true);
    try {
      await removeMarker({ id });
      if (!mounted.current) return;
      setMarkers((current) => current.filter((marker) => marker.id !== id));
      setSelectedMarkerId((current) => current === id ? null : current);
      setStorageMessage("");
    } catch {
      if (mounted.current) mutationFailure();
    } finally {
      pickerPending.current = false;
      if (mounted.current) setMutating(false);
    }
  }

  function applyPendingRegion() {
    if (!mounted.current || !mapReady.current || !mapRef.current || !pendingRegion.current) return;
    mapRef.current.animateToRegion(pendingRegion.current, 2000);
    pendingRegion.current = null;
  }

  async function getUserLocation() {
    if (locationPending.current) return;
    locationPending.current = true;
    setLocating(true);
    setLocationMessage("");
    try {
      let permission = await getLocationPermission();
      if (!mounted.current) return;
      if (!permission.granted && permission.canAskAgain) permission = await requestLocationPermission();
      if (!mounted.current) return;
      setLocationGranted(permission.granted);
      if (!permission.granted) {
        setLocationMessage("La localisation reste désactivée. Vos photos sont conservées.");
        setMissingPermissions([{ id: "location", label: "Localisation", canAskAgain: permission.canAskAgain, getPermission: getLocationPermission }]);
        return;
      }
      const position = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      if (!mounted.current) return;
      const coordinate = readCoordinate(position.coords);
      if (!coordinate) throw new Error("Position invalide.");
      pendingRegion.current = { ...coordinate, latitudeDelta: 0.3, longitudeDelta: 0.15 };
      applyPendingRegion();
    } catch {
      if (mounted.current) setLocationMessage("Position indisponible. Vérifiez les services de localisation, puis réessayez avec le bouton.");
    } finally {
      locationPending.current = false;
      if (mounted.current) setLocating(false);
    }
  }

  async function addPersistedMarker(coordinate, asset) {
    if (writeBlocked.current) throw new Error("Rechargez les marqueurs.");
    try {
      const marker = await persistMarker(coordinate, asset);
      if (mounted.current) setMarkers((current) => [...current, marker]);
      return marker;
    } catch (error) {
      if (error.reloadRequired) {
        writeBlocked.current = true;
        if (mounted.current) setStorageMessage("Ajout non confirmé. Rechargez la liste et vérifiez vos photos avant de recommencer.");
      }
      throw error;
    }
  }

  const addMarker = async (event) => {
    if (writeBlocked.current || pickerPending.current || event.nativeEvent.action === "marker-press") return;
    const coordinate = readCoordinate(event.nativeEvent.coordinate);
    if (!coordinate) return;
    pickerPending.current = true;
    setPicking(true);
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        allowsMultipleSelection: false,
        quality: 0.5,
      });
      if (!mounted.current || result.canceled) return;
      const uri = result.assets?.[0]?.uri;
      if (typeof uri !== "string" || !uri.trim()) {
        throw new Error("Aucune image utilisable.");
      }
      await addPersistedMarker(coordinate, result.assets[0]);
    } catch {
      if (mounted.current && !writeBlocked.current) {
        Alert.alert("Photo non ajoutée", "La sélection ou l’enregistrement n’a pas abouti. Aucun nouvel ajout confirmé.");
      }
    } finally {
      pickerPending.current = false;
      if (mounted.current) setPicking(false);
    }
  };

  const dragStartHandler = (id) => () => {
    if (pickerPending.current || writeBlocked.current) return;
    const marker = markers.find((value) => value.id === id);
    if (!marker) return;
    pickerPending.current = true;
    drag.current = { id, previous: { ...marker.coordinate } };
    setMutating(true);
    setMarkers((current) => current.map((value) => value.id === id ? { ...value, isDragging: true } : value));
  };

  const dragEndHandler = (id) => async (event) => {
    const operation = drag.current;
    if (!operation || operation.id !== id || operation.finishing) return;
    operation.finishing = true;
    const coordinate = readCoordinate(event.nativeEvent.coordinate);
    // Une prop provisoire change réellement avant le retour éventuel à l’ancienne position.
    setMarkers((current) => current.map((value) => value.id === id
      ? { ...value, coordinate: coordinate ?? operation.previous, isDragging: false } : value));
    try {
      if (!coordinate) throw new Error("Position invalide.");
      await updateMarkerCoordinate({ id, coordinate });
      if (mounted.current && drag.current === operation) setStorageMessage("");
    } catch {
      if (mounted.current && drag.current === operation) {
        setMarkers((current) => current.map((value) => value.id === id
          ? { ...value, coordinate: operation.previous, isDragging: false } : value));
        mutationFailure();
      }
    } finally {
      if (drag.current === operation) {
        drag.current = null;
        pickerPending.current = false;
        if (mounted.current) setMutating(false);
      }
    }
  };

  return (
    <>
    <MapView ref={mapRef} showsUserLocation={locationGranted}
      onMapReady={() => { mapReady.current = true; applyPendingRegion(); }}
      zoomControlEnabled initialRegion={initialRegion} style={styles.map} onPress={addMarker}>
      {markers.map((marker) => (
        <Marker
          key={marker.id}
          onPress={() => { if (!pickerPending.current) setSelectedMarkerId(marker.id); }}
          coordinate={marker.coordinate}
          draggable={!writeBlocked.current && !picking && (!mutating || (drag.current?.id === marker.id && !drag.current.finishing))}
          isPreselected
          stopPropagation
          onDragStart={dragStartHandler(marker.id)}
          onDragEnd={dragEndHandler(marker.id)}
        >
          <MarkerItem isDragging={marker.isDragging} imageSource={marker.imageSource} />
        </Marker>
      ))}
    </MapView>
    <View pointerEvents="box-none" style={[styles.controls, {
      bottom: 30 + insets.bottom, left: 40 + insets.left, right: 40 + insets.right,
    }]}>
      {!selectedMarker && orientation.error ? <View style={styles.message}>
        <Text accessibilityRole="alert">{orientation.error}</Text>
        <Pressable onPress={orientation.retry} accessibilityRole="button" style={{ minHeight: 48, justifyContent: "center" }}>
          <Text>Réessayer le portrait</Text>
        </Pressable>
      </View> : null}
      {storageMessage ? <View style={styles.message}>
        <Text accessibilityRole="alert">{storageMessage}</Text>
        <Pressable onPress={reloadStoredMarkers} disabled={mutating} accessibilityRole="button" style={{ minHeight: 48, justifyContent: "center" }}><Text>Recharger les marqueurs</Text></Pressable>
      </View> : null}
      {locationMessage ? <Text accessibilityRole="alert" style={styles.message}>{locationMessage}</Text> : null}
      <View pointerEvents="box-none" style={styles.buttons}>
        <LocationButton onPress={getUserLocation} disabled={locating} />
        <PictureButton onBusyChange={setPicking} disabled={mutating} addPersistedMarker={addPersistedMarker} writeBlocked={writeBlocked} pickerPending={pickerPending} />
      </View>
    </View>
    {selectedMarker ? <FullPicture isVisible closeModal={closeFullPicture}
      imageSource={selectedMarker.imageSource} deleteMarker={() => { void deleteSelectedMarker(); }}
      busy={mutating} writeBlocked={writeBlocked.current} storageError={storageMessage} reloadMarkers={reloadStoredMarkers}
      orientationError={orientation.error} retryOrientation={orientation.retry} /> : null}
    <PermissionsModal permissions={missingPermissions} updatePermissions={setMissingPermissions}
      closeModal={() => setMissingPermissions([])} />
    </>
  );
}

const styles = StyleSheet.create({
  map: { width: "100%", height: "100%" },
  controls: { position: "absolute", gap: 8 },
  buttons: { flexDirection: "row", justifyContent: "space-between" },
  message: { backgroundColor: "#fff", color: "#222", padding: 8, borderRadius: 8 },
});
