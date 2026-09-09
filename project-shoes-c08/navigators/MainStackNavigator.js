import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { Pressable } from "react-native";
import { Ionicons } from "@react-native-vector-icons/ionicons";
import { colors } from "../constants/colors";
import Details from "../screens/details";
import DrawerNavigator from "./DrawerNavigator";

const Stack = createNativeStackNavigator();

export default function MainStackNavigator() {
  return (
    <Stack.Navigator initialRouteName="DrawerNavigator" screenOptions={{
      statusBarStyle: "dark",
      headerStyle: { backgroundColor: colors.LIGHT },
      headerShadowVisible: false,
      headerTitleAlign: "center",
      headerTintColor: colors.DARK,
    }}>
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
    </Stack.Navigator>
  );
}
