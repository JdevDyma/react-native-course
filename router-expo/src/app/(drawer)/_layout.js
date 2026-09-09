import { Drawer, DrawerContentScrollView, DrawerItem, DrawerItemList } from "expo-router/drawer";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { Pressable, StyleSheet } from "react-native";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import AntDesign from "@expo/vector-icons/AntDesign";
import { colors } from "../../constants/colors";

export default function DrawerLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Drawer
        initialRouteName="(tabs)"
        drawerContent={(props) => <CustomDrawerContent {...props} />}
        screenOptions={({ navigation }) => ({
          drawerStyle: { backgroundColor: colors.light },
          drawerActiveBackgroundColor: colors.primary,
          drawerInactiveBackgroundColor: colors.light,
          drawerActiveTintColor: colors.dark,
          drawerInactiveTintColor: colors.dark,
          drawerItemStyle: { marginBottom: 12 },
          headerStyle: { backgroundColor: colors.dark },
          headerTintColor: colors.light,
          headerTitleStyle: { color: colors.light },
          headerTitleAlign: "center",
          overlayColor: colors.dark,
          headerLeft: () => (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Ouvrir le menu"
              onPress={() => navigation.openDrawer()}
              style={styles.menuButton}
            >
              <AntDesign name="menu-unfold" size={24} color={colors.light} accessible={false} />
            </Pressable>
          ),
        })}
      >
        <Drawer.Screen name="(tabs)" options={{
          headerShown: false,
          drawerLabel: "Accueil",
          title: "Accueil",
          drawerIcon: ({ color }) => (
            <FontAwesome size={28} name="home" color={color} accessible={false} />
          ),
        }} />
        <Drawer.Screen name="notifications" options={{
          drawerLabel: "Notifications",
          title: "Notifications",
          drawerIcon: ({ color }) => (
            <FontAwesome size={28} name="bell" color={color} accessible={false} />
          ),
        }} />
      </Drawer>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  menuButton: { minWidth: 48, minHeight: 48, marginLeft: 8,
    alignItems: "center", justifyContent: "center" },
});

function CustomDrawerContent(props) {
  return (
    <DrawerContentScrollView {...props}>
      <DrawerItemList {...props} />
      <DrawerItem
        label="Déconnexion"
        activeTintColor={colors.primary}
        inactiveTintColor={colors.dark}
        icon={({ color }) => (
          <FontAwesome size={28} name="sign-out" color={color} accessible={false} />
        )}
        onPress={() => {
          console.log("logout");
          props.navigation.closeDrawer();
        }}
      />
    </DrawerContentScrollView>
  );
}
