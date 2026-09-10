import { useEffect, useState, useRef } from "react";
import { useSelector, useStore } from "react-redux";
import { ActivityIndicator, StyleSheet, Text, View, Pressable } from "react-native";
import { startSessionRefresh } from "../lib/sessionRefreshScheduler";
import { restoreSession } from "../store/authSession";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import Signup from "../components/auth/Signup";
import Login from "../components/auth/Login";
import AgendaList from "../components/agenda/AgendaList";
import { colors } from "../constants/colors";

const Stack = createNativeStackNavigator();
export default function StackNavigator() {
  const token = useSelector((state) => state.auth.idToken);
  const store = useStore();
  const [bootLoading, setBootLoading] = useState(!store.getState().auth.idToken);
  const [bootError, setBootError] = useState(false);
  const [refreshError, setRefreshError] = useState(false);
  const storageError = useSelector((state) => state.auth.storageError);
  const refreshControl = useRef(null);
  useEffect(() => {
    const control = startSessionRefresh(store, setRefreshError);
    refreshControl.current = control;
    return () => { refreshControl.current = null; control.stop(); };
  }, [store]);
  useEffect(() => {
    let mounted = true;
    const controller = new AbortController();
    const generation = store.getState().auth.generation;
    const isCurrent = () => mounted && !controller.signal.aborted &&
      store.getState().auth.generation === generation;
    async function restore() {
      try {
        if (!store.getState().auth.idToken) await restoreSession(store, controller.signal, isCurrent);
      } catch {
        if (isCurrent()) setBootError(true);
      } finally {
        if (mounted) setBootLoading(false);
      }
    }
    void restore();
    return () => { mounted = false; controller.abort(); };
  }, [store]);
  if (bootLoading) return <View style={styles.loading}>
    <ActivityIndicator color={colors.LIGHT} size="large" accessibilityLabel="Restauration de la session" />
  </View>;
  return (
    <View style={styles.container}>
    {bootError && !token ? <Text accessibilityRole="alert" style={styles.error}>La session n’a pas été restaurée. Connectez-vous pour continuer.</Text> : null}
    {refreshError ? <View style={styles.refreshNotice}>
      <Text accessibilityRole="alert" style={styles.error}>
        {storageError ? "La session est fermée, mais son effacement sécurisé doit être réessayé." :
          "La session n’a pas pu être renouvelée. Réessayez ou déconnectez-vous."}
      </Text>
      <Pressable accessibilityRole="button" accessibilityLabel="Réessayer l’opération de session"
        style={styles.retry} onPress={() => { void refreshControl.current?.retry(); }}>
        <Text style={styles.retryText}>Réessayer</Text>
      </Pressable>
    </View> : null}
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.DARK } }}>
        {token ? <Stack.Screen component={AgendaList} name="Agenda" /> : <>
          <Stack.Screen component={Signup} name="Signup" />
          <Stack.Screen component={Login} name="Login" />
        </>}
      </Stack.Navigator>
    </NavigationContainer>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  refreshNotice: { paddingBottom: 8 },
  retry: { minHeight: 48, justifyContent: "center", alignItems: "center", paddingHorizontal: 16 },
  retryText: { color: colors.LIGHT, fontWeight: "bold" },
  loading: { flex: 1, alignItems: "center", justifyContent: "center" },
  error: { color: colors.LIGHT, padding: 16, textAlign: "center" },
});
