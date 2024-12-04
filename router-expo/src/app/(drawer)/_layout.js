import { GestureHandlerRootView } from "react-native-gesture-handler"
import { Drawer } from "expo-router/drawer"
import { colors } from "../../constants/colors"
import AntDesign from "@expo/vector-icons/AntDesign"
import FontAwesome from "@expo/vector-icons/FontAwesome"
import {
  DrawerContentScrollView,
  DrawerItemList,
  DrawerItem,
} from "@react-navigation/drawer"

export default function Layout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Drawer
        screenOptions={({ navigation }) => ({
          drawerStyle: {
            backgroundColor: colors.light,
          },
          drawerActiveBackgroundColor: colors.primary,
          drawerInactiveBackgroundColor: colors.light,
          drawerActiveTintColor: colors.dark,
          drawerInactiveTintColor: colors.dark,
          drawerItemStyle: {
            marginBottom: 12,
          },
          headerStyle: {
            backgroundColor: colors.dark,
          },
          headerTitleStyle: {
            color: colors.light,
          },
          headerTitleAlign: "center",
          overlayColor: colors.dark,
          headerLeft: () => (
            <AntDesign
              name="menuunfold"
              size={24}
              color={colors.light}
              style={{ marginLeft: 16 }}
              onPress={() => navigation.openDrawer()}
            />
          ),
        })}
        drawerContent={(props) => <CustomDrawerContent {...props} />}
      >
        <Drawer.Screen
          name="(tabs)"
          options={{
            headerShown: false,
            title: "Accueil",
            drawerLabel: "Accueil",
            drawerIcon: ({ color }) => (
              <FontAwesome size={28} name="home" color={color} />
            ),
          }}
        />
        <Drawer.Screen
          name="notifications"
          options={{
            title: "Notifications",
            drawerLabel: "Notifications",
            drawerIcon: ({ color }) => (
              <FontAwesome size={28} name="bell" color={color} />
            ),
          }}
        />
      </Drawer>
    </GestureHandlerRootView>
  )
}

function CustomDrawerContent(props) {
  return (
    <DrawerContentScrollView {...props}>
      <DrawerItemList {...props} />
      <DrawerItem
        label="Déconnexion"
        onPress={() => console.log("logout")}
        inactiveTintColor={colors.dark}
        activeTintColor={colors.primary}
        icon={({ color }) => (
          <FontAwesome size={28} name="sign-out" color={color} />
        )}
      />
    </DrawerContentScrollView>
  )
}
