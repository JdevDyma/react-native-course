import { Image, Modal, Pressable, StyleSheet, Text, View } from "react-native";
import EvilIcons from "@expo/vector-icons/EvilIcons";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";

export default function FullPicture({
  isVisible, closeModal, imageSource, deleteMarker, orientationError, retryOrientation,
  busy = false, writeBlocked = false, storageError, reloadMarkers,
}) {
  if (!isVisible) return null;
  return (
    <Modal visible animationType="fade" presentationStyle="fullScreen"
      supportedOrientations={["portrait", "landscape-left", "landscape-right"]}
      onRequestClose={() => { if (!busy) closeModal(); }}>
      <SafeAreaProvider>
        <StatusBar style="light" />
        <SafeAreaView style={styles.container}>
          <View style={styles.content}>
            <Pressable style={StyleSheet.absoluteFill} onPress={closeModal} disabled={busy}
              accessibilityRole="button" accessibilityLabel="Fermer la photo">
              <Image style={styles.image} resizeMode="contain" source={imageSource} />
            </Pressable>
            {storageError ? <View style={styles.errorBox}>
              <Text accessibilityRole="alert" style={styles.errorText}>{storageError}</Text>
              <Pressable onPress={reloadMarkers} disabled={busy} accessibilityRole="button" style={styles.retry}>
                <Text>Recharger les marqueurs</Text>
              </Pressable>
            </View> : null}
            {orientationError ? <View style={styles.errorBox}>
              <Text accessibilityRole="alert" style={styles.errorText}>{orientationError}</Text>
              <Pressable onPress={retryOrientation} accessibilityRole="button" style={styles.retry}>
                <Text>Réessayer l’orientation</Text>
              </Pressable>
            </View> : null}
            <Pressable onPress={deleteMarker} disabled={busy || writeBlocked}
              accessibilityState={{ disabled: busy || writeBlocked, busy }} accessibilityRole="button"
              accessibilityLabel="Retirer ce marqueur de la carte" style={styles.deleteButton}>
              <EvilIcons name="trash" size={30} color="black" accessible={false} />
            </Pressable>
          </View>
        </SafeAreaView>
      </SafeAreaProvider>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "black" },
  content: { flex: 1 },
  image: { width: "100%", height: "100%" },
  deleteButton: { position: "absolute", bottom: 16, alignSelf: "center", width: 56, height: 56,
    justifyContent: "center", alignItems: "center", backgroundColor: "white", borderRadius: 99 },
  errorBox: { margin: 16, padding: 12, backgroundColor: "#333", borderRadius: 8 },
  errorText: { color: "white" },
  retry: { minHeight: 48, padding: 12, marginTop: 8, backgroundColor: "white", borderRadius: 8 },
});
