import { useCallback, useEffect, useRef } from "react";
import IapConnectionDemo from "./examples/IapConnectionDemo";
import * as NativeSplashScreen from "expo-splash-screen";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { Text, StyleSheet, View } from "react-native";
import { useFonts } from "expo-font";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { Provider } from "react-redux";
import store from "./store/store";
import StripeBootstrap from "./ui-components/StripeBootstrap";
import { linkingConfig, startDeepLinks } from "./utils/linking";
import { NavigationContainer } from "@react-navigation/native";
import MainStackNavigator from "./navigators/MainStackNavigator";
import { colors } from "./constants/colors";
import { spaces } from "./constants/spaces";

const nativeSplashHold = NativeSplashScreen.preventAutoHideAsync().catch(() => false);

export default function App() {
  useEffect(() => startDeepLinks(), []);
  const splashHidden = useRef(false);
  const showReactContent = useCallback(() => {
    if (splashHidden.current) return;
    splashHidden.current = true;
    void nativeSplashHold.then(() => NativeSplashScreen.hide()).catch(() => {});
  }, []);
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
    <StripeBootstrap />
    <SafeAreaProvider>
      <View style={{ flex: 1 }} onLayout={showReactContent}>
      <StatusBar style="dark" />
      {fontError ? (
        <SafeAreaView style={styles.errorContainer}>
          <Text style={styles.error}>Impossible de charger les polices.</Text>
        </SafeAreaView>
      ) : (
        <>
        {__DEV__ && <SafeAreaView edges={["top", "left", "right"]} style={{ padding: spaces.M }}>
          <IapConnectionDemo />
        </SafeAreaView>}
        <NavigationContainer linking={linkingConfig}>
          <MainStackNavigator />
        </NavigationContainer>
        </>
      )}
      </View>
    </SafeAreaProvider>
    </Provider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  errorContainer: { flex: 1, backgroundColor: colors.LIGHT },
  error: { padding: spaces.L, color: colors.DARK },
});
