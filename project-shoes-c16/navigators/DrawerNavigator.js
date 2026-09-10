import { useState } from "react";
import { useLogout } from "../hooks/useStoredSession";
import useUserProfile from "../hooks/useUserProfile";
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
  { name: "MainCart", label: "Panier", icon: CartIcon },
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

function CartMenuLabel({ label, color, cartHasLines, cartLineCount }) {
  return (
    <View style={styles.menuLabel}>
      <Text style={[styles.label, { color: cartHasLines ? colors.BLUE : color }]}>{label}</Text>
      {cartHasLines && <View style={styles.cartBadge} accessible={false}>
        <Text style={styles.cartBadgeText}>{cartLineCount}</Text>
      </View>}
    </View>
  );
}

function CustomDrawerContent(props) {
  const logout = useLogout();
  const { user } = useUserProfile();
  const cartLineCount = user?.cart.shoes.length ?? 0;
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
        const isCart = route.name === "MainCart";
        const cartHasLines = isCart && cartLineCount > 0;
        return (
          <DrawerItem key={route.name}
            label={({ color }) => (
              <CartMenuLabel label={route.label} color={color}
                cartHasLines={cartHasLines} cartLineCount={cartLineCount} />
            )}
            accessibilityLabel={isCart ? `Panier, ${cartLineCount} ligne${cartLineCount === 1 ? "" : "s"}` : route.label}
            focused={activeName === route.name}
            activeTintColor={colors.WHITE} inactiveTintColor={colors.GREY}
            activeBackgroundColor="transparent"
            onPress={() => {
              props.navigation.closeDrawer();
              if (isCart) {
                props.navigation.navigate("MainCart");
              } else {
                props.navigation.navigate("BottomTabs", { screen: route.name });
              }
            }}
            icon={({ color }) => <Icon width={SMALL_ICON_SIZE} height={SMALL_ICON_SIZE} color={cartHasLines ? colors.BLUE : color} accessible={false} />}
            labelStyle={styles.label} />
        );
      })}
      <DrawerItem label="Déconnexion"
        onPress={() => { void logout(); }}
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
  label: { fontSize: 18, fontFamily: "Medium", flexShrink: 1 },
  menuLabel: { flexDirection: "row", flexWrap: "wrap", alignItems: "center", gap: spaces.S },
  cartBadge: { minWidth: 24, minHeight: 24, paddingHorizontal: spaces.XS,
    borderRadius: radius.FULL, backgroundColor: colors.BLUE, alignItems: "center", justifyContent: "center" },
  cartBadgeText: { color: colors.WHITE, fontFamily: "Medium" },
  logoutItem: { borderTopWidth: 1, borderTopColor: colors.GREY,
    paddingTop: spaces.XL, marginTop: spaces.XL },
});
