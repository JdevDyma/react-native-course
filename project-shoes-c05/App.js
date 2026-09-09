import { Text, StyleSheet } from "react-native";
import { useFonts } from "expo-font";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import HomeScreen from "./screens/home";
import { colors } from "./constants/colors";
import { spaces } from "./constants/spaces";

export default function App() {
  const [fontsLoaded, fontError] = useFonts({
    Light: require("./assets/fonts/Montserrat-Light.ttf"),
    Regular: require("./assets/fonts/Montserrat-Regular.ttf"),
    Medium: require("./assets/fonts/Montserrat-Medium.ttf"),
    SemiBold: require("./assets/fonts/Montserrat-SemiBold.ttf"),
  });
  if (!fontsLoaded && !fontError) return null;

  return (
    <SafeAreaProvider>
      <StatusBar style="dark" />
      {fontError ? (
        <SafeAreaView style={styles.errorContainer}>
          <Text style={styles.error}>Impossible de charger les polices.</Text>
        </SafeAreaView>
      ) : (
        <HomeScreen />
      )}
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  errorContainer: { flex: 1, backgroundColor: colors.LIGHT },
  error: { padding: spaces.L, color: colors.DARK },
});
