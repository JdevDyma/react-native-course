import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { Platform, Pressable, StyleSheet } from "react-native";
import { Ionicons } from "@react-native-vector-icons/ionicons";
import HomeScreen from "../screens/home";
import List from "../screens/list";
import NewsList from "../screens/newsList";
import { colors } from "../constants/colors";
import { spaces } from "../constants/spaces";
import DrawerIcon from "../assets/images/navigation/drawer.svg";

const Stack = createNativeStackNavigator();

export default function HomeStackNavigator() {
  return (
    <Stack.Navigator initialRouteName="Home" screenOptions={{
      statusBarStyle: "dark",
      headerStyle: { backgroundColor: colors.LIGHT },
      headerShadowVisible: false,
      headerTitleAlign: "center",
      headerTintColor: colors.DARK,
      headerBackVisible: false,
    }}>
      <Stack.Screen component={HomeScreen} name="Home"
        options={({ navigation }) => ({
          title: "Shoes",
          headerLeft: () => (
            <Pressable
              onPress={() => navigation.getParent("MainDrawer")?.openDrawer()}
              accessibilityRole="button" accessibilityLabel="Ouvrir le menu"
              style={[styles.headerButton, styles.drawerButton]}>
              <DrawerIcon width={44} height={44} accessible={false} />
            </Pressable>
          ),
        })} />
      <Stack.Group screenOptions={({ navigation }) => ({
        headerLeft: ({ canGoBack }) => canGoBack ? (
          <Pressable onPress={() => navigation.goBack()} accessibilityRole="button"
            accessibilityLabel="Revenir à l’écran précédent" style={styles.headerButton}>
            <Ionicons name="chevron-back" size={24} color={colors.DARK} />
          </Pressable>
        ) : null,
      })}>
        <Stack.Screen component={List} name="List" options={{ title: "Chaussures" }} />
        <Stack.Screen component={NewsList} name="NewsList" options={{ title: "Nouveautés" }} />
      </Stack.Group>
    </Stack.Navigator>
  );
}

const styles = StyleSheet.create({
  headerButton: { minWidth: 48, minHeight: 48, alignItems: "center", justifyContent: "center" },
  drawerButton: { marginLeft: Platform.select({ ios: spaces.XS, android: spaces.S, default: 0 }) },
});
