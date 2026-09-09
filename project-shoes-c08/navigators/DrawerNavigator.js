import { useState } from "react";
import { DrawerContentScrollView, DrawerItem,
  createDrawerNavigator } from "@react-navigation/drawer";
import { Ionicons } from "@react-native-vector-icons/ionicons";
import { Image, StyleSheet, Text, View } from "react-native";
import { SMALL_ICON_SIZE } from "../constants/sizes";
import { spaces } from "../constants/spaces";
import { colors } from "../constants/colors";
import { radius } from "../constants/radius";
import TextBoldXL from "../ui-components/texts/TextBoldXL";
import BottomTabsNavigator from "./BottomTabsNavigator";
import HomeIcon from "../assets/images/navigation/home.svg";
import ProfileIcon from "../assets/images/navigation/user.svg";

import { getFocusedRouteNameFromRoute } from "@react-navigation/native";
import FavoriteIcon from "../assets/images/navigation/favorite.svg";
import NotificationsIcon from "../assets/images/navigation/notifications.svg";
import CartIcon from "../assets/images/navigation/cart.svg";

const menuRoutes = [
  { name: "HomeStack", label: "Accueil", icon: HomeIcon },
  { name: "Profile", label: "Profil", icon: ProfileIcon },
  { name: "Cart", label: "Panier", icon: CartIcon },
  { name: "Favorites", label: "Favoris", icon: FavoriteIcon },
  { name: "Notifications", label: "Notifications", icon: NotificationsIcon },
];

const Drawer = createDrawerNavigator();

export default function DrawerNavigator() {
  return (
    <Drawer.Navigator id="MainDrawer" initialRouteName="BottomTabs"
      drawerContent={(props) => <CustomDrawerContent {...props} />}
      screenOptions={{
        headerShown: false,
        drawerStyle: { backgroundColor: colors.DARK },
        overlayColor: colors.DARK,
      }}>
      <Drawer.Screen name="BottomTabs" component={BottomTabsNavigator}
        options={{ title: "Navigation" }} />
    </Drawer.Navigator>
  );
}

function CustomDrawerContent(props) {
  const [imageFailed, setImageFailed] = useState(false);
  const tabsRoute = props.state.routes.find((route) => route.name === "BottomTabs");
  const activeName = tabsRoute
    ? getFocusedRouteNameFromRoute(tabsRoute) ?? "HomeStack"
    : "HomeStack";

  return (
    <DrawerContentScrollView {...props}>
      <View style={styles.userInfosContainer}>
        {imageFailed ? (
          <View style={[styles.image, styles.avatarFallback]} accessible={false}>
            <Text style={styles.initials}>JD</Text>
          </View>
        ) : (
          <Image
            source={{ uri: "https://cdn.pixabay.com/photo/2014/02/27/16/10/flowers-276014_640.jpg" }}
            style={styles.image} resizeMode="cover" accessible={false}
            onError={() => setImageFailed(true)} />
        )}
        <TextBoldXL style={styles.text}>John Doe</TextBoldXL>
      </View>
      {menuRoutes.map((route) => {
        const Icon = route.icon;
        return (
          <DrawerItem key={route.name} label={route.label}
            focused={activeName === route.name}
            activeTintColor={colors.WHITE} inactiveTintColor={colors.GREY}
            activeBackgroundColor="transparent"
            onPress={() => {
              props.navigation.navigate("BottomTabs", { screen: route.name });
              props.navigation.closeDrawer();
            }}
            icon={({ color }) => <Icon width={SMALL_ICON_SIZE} height={SMALL_ICON_SIZE} color={color} accessible={false} />}
            labelStyle={styles.label} />
        );
      })}
      <DrawerItem label="Déconnexion"
        onPress={() => console.log("logout")}
        icon={() => <Ionicons name="log-out-outline" size={SMALL_ICON_SIZE} color={colors.GREY} />}
        labelStyle={[styles.label, { color: colors.GREY }]}
        style={styles.logoutItem} />
    </DrawerContentScrollView>
  );
}

const styles = StyleSheet.create({
  userInfosContainer: { marginLeft: spaces.L, marginVertical: spaces.XL },
  image: { width: 90, height: 90, borderRadius: radius.FULL },
  avatarFallback: { backgroundColor: colors.GREY, alignItems: "center", justifyContent: "center" },
  initials: { color: colors.DARK, fontFamily: "Medium", fontSize: 24 },
  text: { color: colors.WHITE, marginTop: spaces.L },
  label: { fontSize: 18, fontFamily: "Medium" },
  logoutItem: { borderTopWidth: 1, borderTopColor: colors.GREY,
    paddingTop: spaces.XL, marginTop: spaces.XL },
});
