import { useEffect, useState } from "react";
import { StatusBar } from "expo-status-bar";
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import Map from "./components/map/Map";
import { getAllMarkers, initDatabase } from "./utils/database";

export default function App() {
  const [attempt, setAttempt] = useState(0);
  const [state, setState] = useState({ status: "loading", markers: [] });
  useEffect(() => {
    let active = true;
    (async () => {
      try {
        await initDatabase();
        const markers = await getAllMarkers();
        if (active) setState({ status: "ready", markers });
      } catch {
        if (active) setState({ status: "error", markers: [] });
      }
    })();
    return () => { active = false; };
  }, [attempt]);
  function reloadMarkers() {
    setState({ status: "loading", markers: [] });
    setAttempt((current) => current + 1);
  }
  return (
    <SafeAreaProvider>
      <View style={styles.container}>
        {state.status === "ready" ? <Map initialMarkers={state.markers} reloadMarkers={reloadMarkers} /> :
          <SafeAreaView style={styles.message}>
            {state.status === "loading" ? <><ActivityIndicator /><Text>Chargement des marqueurs…</Text></> : <>
              <Text accessibilityRole="alert">Les marqueurs n’ont pas pu être chargés. Aucune ligne n’a été effacée.</Text>
              <Pressable onPress={reloadMarkers} accessibilityRole="button" style={styles.button}><Text>Réessayer</Text></Pressable>
            </>}
          </SafeAreaView>}
        <StatusBar style="dark" />
      </View>
    </SafeAreaProvider>
  );
}
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff", alignItems: "center", justifyContent: "center" },
  message: { padding: 24, gap: 16 },
  button: { minHeight: 48, justifyContent: "center" },
});
