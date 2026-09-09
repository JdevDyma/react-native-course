if (__DEV__) {
  require("./ReactotronConfig");
}

import { GestureHandlerRootView } from "react-native-gesture-handler";
import { Text, StyleSheet } from "react-native";
import { useFonts } from "expo-font";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { Provider } from "react-redux";
import store from "./store/store";
import { NavigationContainer } from "@react-navigation/native";
import MainStackNavigator from "./navigators/MainStackNavigator";
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
    <GestureHandlerRootView style={{ flex: 1 }}>
    <Provider store={store}>
    <SafeAreaProvider>
      <StatusBar style="dark" />
      {fontError ? (
        <SafeAreaView style={styles.errorContainer}>
          <Text style={styles.error}>Impossible de charger les polices.</Text>
        </SafeAreaView>
      ) : (
        <NavigationContainer>
          <MainStackNavigator />
        </NavigationContainer>
      )}
    </SafeAreaProvider>
    </Provider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  errorContainer: { flex: 1, backgroundColor: colors.LIGHT },
  error: { padding: spaces.L, color: colors.DARK },
});
