import {
  DrawerContentScrollView,
  DrawerItem,
  DrawerItemList,
  createDrawerNavigator,
} from "@react-navigation/drawer";
import { AntDesign } from "@react-native-vector-icons/ant-design";
import { Ionicons } from "@react-native-vector-icons/ionicons";
import { MaterialIcons } from "@react-native-vector-icons/material-icons";
import { Pressable, StyleSheet } from "react-native";
import BottomTabsNavigator from "./BottomTabsNavigator";
import Screen7 from "../screens/Screen7";

const Drawer = createDrawerNavigator();

export default function DrawerNavigator() {
  return (
    <Drawer.Navigator
      initialRouteName="Navigation"
      drawerContent={(props) => <CustomDrawerContent {...props} />}
    >
      <Drawer.Group
        screenOptions={({ navigation }) => ({
          headerTitleAlign: "center",
          drawerActiveTintColor: "blue",
          drawerInactiveTintColor: "grey",
          headerLeft: () => (
            <Pressable
              style={styles.headerButton}
              accessibilityRole="button"
              accessibilityLabel="Ouvrir le menu"
              onPress={() => navigation.openDrawer()}
            >
              <AntDesign name="menu-fold" size={24} color="black" />
            </Pressable>
          ),
          swipeEdgeWidth: 100,
          swipeMinDistance: 20,
          overlayColor: "rgba(0,0,255,0.5)",
        })}
      >
        <Drawer.Screen
          component={BottomTabsNavigator}
          name="Navigation"
          options={({ navigation }) => ({
            drawerLabel: "Home",
            drawerIcon: ({ color, size }) => (
              <AntDesign name="home" size={size} color={color} />
            ),
            headerRight: () => (
              <Pressable
                style={styles.headerButton}
                accessibilityRole="button"
                accessibilityLabel="Ouvrir le profil de John"
                onPress={() => navigation.navigate("Navigation", {
                  screen: "Home",
                  params: {
                    screen: "Screen2",
                    initial: false,
                    params: { name: "John" },
                  },
                })}
              >
                <AntDesign name="user" size={24} color="black" />
              </Pressable>
            ),
          })}
        />
        <Drawer.Screen
          component={Screen7}
          name="Notifications"
          options={{
            drawerIcon: ({ color, size }) => (
              <Ionicons name="notifications" size={size} color={color} />
            ),
          }}
        />
      </Drawer.Group>
    </Drawer.Navigator>
  );
}

function CustomDrawerContent(props) {
  return (
    <DrawerContentScrollView {...props}>
      <DrawerItemList {...props} />
      <DrawerItem
        label="Logout"
        onPress={() => {
          console.log("logout");
          props.navigation.closeDrawer();
        }}
        icon={({ color, size }) => (
          <MaterialIcons name="logout" size={size} color={color} />
        )}
      />
    </DrawerContentScrollView>
  );
}

const styles = StyleSheet.create({
  headerButton: {
    minWidth: 48,
    minHeight: 48,
    alignItems: "center",
    justifyContent: "center",
    marginHorizontal: 4,
  },
});
