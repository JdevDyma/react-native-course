import { SafeAreaView } from "react-native-safe-area-context";
import HttpErrorModal from "../ui-components/HttpErrorModal";
import { useSelector } from "react-redux";
import Login from "../screens/auth/Login";
import Signup from "../screens/auth/Signup";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import useStoredSession, { StoredSessionContext } from "../hooks/useStoredSession";
import CustomButton from "../ui-components/buttons/CustomButton";
import { Ionicons } from "@react-native-vector-icons/ionicons";
import { colors } from "../constants/colors";
import Details from "../screens/details";
import Cart from "../screens/cart";
import DrawerNavigator from "./DrawerNavigator";

const Stack = createNativeStackNavigator();

export default function MainStackNavigator() {
  const ready = useSelector((state) => Boolean(state.auth.idToken && state.auth.profileReady));
  const session = useStoredSession();
  if (session.busy || session.error) return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.LIGHT }}>
    <ScrollView contentContainerStyle={styles.sessionContainer}>
      {session.busy ? <View accessible accessibilityLabel="Ouverture ou fermeture de la session en cours">
        <ActivityIndicator color={colors.BLUE} size="large" />
        <Text>Patientez pendant la préparation de la session.</Text>
      </View> : <>
        <Text accessibilityRole="alert">{session.error}</Text>
        <CustomButton text="Réessayer" onPress={session.retry} />
        {!session.deletionPending && <CustomButton text="Revenir à la connexion" onPress={() => { void session.logout(); }} />}
      </>}
    </ScrollView>
    </SafeAreaView>
  );
  return (
    <StoredSessionContext.Provider value={session.logout}>
    <HttpErrorModal />
    <Stack.Navigator screenOptions={{
      statusBarStyle: "dark",
      headerStyle: { backgroundColor: colors.LIGHT },
      headerShadowVisible: false,
      headerTitleAlign: "center",
      headerTintColor: colors.DARK,
    }}>
      {!ready ? <Stack.Group navigationKey="signed-out">
      <Stack.Screen name="Login" component={Login} options={{ title: "Connexion" }} />
      <Stack.Screen name="Signup" component={Signup} options={{ title: "Formulaire d’inscription" }} />
      </Stack.Group> : <Stack.Group navigationKey="signed-in">
      <Stack.Screen name="DrawerNavigator" component={DrawerNavigator}
        options={{ headerShown: false }} />
      <Stack.Screen name="Details" component={Details}
        options={({ navigation }) => ({
          title: "Détails",
          headerBackVisible: false,
          headerLeft: ({ canGoBack }) => canGoBack ? (
            <Pressable onPress={() => navigation.goBack()}
              accessibilityRole="button" accessibilityLabel="Revenir à l’écran précédent"
              style={{ minWidth: 48, minHeight: 48, alignItems: "center", justifyContent: "center" }}>
              <Ionicons name="chevron-back" size={24} color={colors.DARK} />
            </Pressable>
          ) : null,
        })} />
      <Stack.Screen name="MainCart" component={Cart}
        options={({ navigation }) => ({
          title: "Mon panier",
          animation: "slide_from_bottom",
          headerBackVisible: false,
          headerLeft: ({ canGoBack }) => canGoBack ? (
            <Pressable onPress={() => navigation.goBack()}
              accessibilityRole="button" accessibilityLabel="Revenir à l’écran précédent"
              style={{ minWidth: 48, minHeight: 48, alignItems: "center", justifyContent: "center" }}>
              <Ionicons name="chevron-back" size={24} color={colors.DARK} />
            </Pressable>
          ) : null,
        })} />
      </Stack.Group>}
    </Stack.Navigator>
    </StoredSessionContext.Provider>
  );
}

const styles = StyleSheet.create({
  sessionContainer: { flexGrow: 1, justifyContent: "center", padding: 24,
    gap: 16, backgroundColor: colors.LIGHT },
});
