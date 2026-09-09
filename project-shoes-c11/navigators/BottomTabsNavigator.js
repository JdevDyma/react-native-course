import DrawerIcon from "../assets/images/navigation/drawer.svg";
import { spaces } from "../constants/spaces";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import Favorites from "../screens/favorites";
import HomeStackNavigator from "./HomeStackNavigator";
import { useSelector } from "react-redux";
import Notifications from "../screens/notifications";
import Profile from "../screens/profile";
import HomeIcon from "../assets/images/navigation/home.svg";
import FavoriteIcon from "../assets/images/navigation/favorite.svg";
import CartIcon from "../assets/images/navigation/cart.svg";
import NotificationsIcon from "../assets/images/navigation/notifications.svg";
import ProfileIcon from "../assets/images/navigation/user.svg";
import { colors } from "../constants/colors";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { FOCUSED_ICON_SIZE, SMALL_ICON_SIZE } from "../constants/sizes";
import { radius } from "../constants/radius";
import { Pressable, StyleSheet, TouchableOpacity, View, useWindowDimensions } from "react-native";
import BottomTabsBackground from "../assets/images/navigation/bottomTabsBackground.svg";

const ORIGINAL_WIDTH = 375;
const ORIGINAL_HEIGHT = 110;
const ASPECT_RATIO = ORIGINAL_WIDTH / ORIGINAL_HEIGHT;

const Tabs = createBottomTabNavigator();

function CartShortcut() {
  return null;
}

export default function BottomTabsNavigator() {
  const cartLineCount = useSelector((state) => state.cart.shoes.length);
  const hasCartLines = cartLineCount > 0;
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const artworkHeight = Math.max(110, Math.min(width / ASPECT_RATIO, 140));
  return (
    <Tabs.Navigator initialRouteName="HomeStack"
      screenOptions={({ navigation }) => ({
        headerStyle: { backgroundColor: colors.LIGHT },
        headerShadowVisible: false,
        headerTitleAlign: "center",
        headerTintColor: colors.DARK,
        headerLeft: () => (
          <Pressable
            onPress={() => navigation.getParent("MainDrawer")?.openDrawer()}
            accessibilityRole="button" accessibilityLabel="Ouvrir le menu"
            style={styles.drawerButton}>
            <DrawerIcon width={44} height={44} accessible={false} />
          </Pressable>
        ),
        tabBarShowLabel: false,
        tabBarActiveTintColor: colors.BLUE,
        tabBarInactiveTintColor: colors.GREY,
        tabBarStyle: {
          height: artworkHeight + insets.bottom,
          paddingTop: 8,
          paddingBottom: 8 + insets.bottom,
          backgroundColor: colors.LIGHT,
          borderTopWidth: 0,
          elevation: 0,
          shadowOpacity: 0,
        },
        tabBarButton: (props) => <TouchableOpacity {...props} style={[props.style, styles.tabButton]} activeOpacity={1} />,
        tabBarBackground: () => (
          <View pointerEvents="none" style={StyleSheet.absoluteFill}>
            <BottomTabsBackground width="100%" height={artworkHeight}
              viewBox="0 0 375 110" preserveAspectRatio="none" accessible={false} />
            <View style={[styles.safeBottom, { height: insets.bottom }]} />
          </View>
        ),
        tabBarIconStyle: { width: 60, height: 60 },
      })}>
      <Tabs.Screen name="HomeStack" component={HomeStackNavigator}
        options={{ title: "Accueil", tabBarAccessibilityLabel: "Accueil",
          popToTopOnBlur: true,
          headerShown: false,
          tabBarIcon: ({ color, focused }) => (
            <HomeIcon width={focused ? FOCUSED_ICON_SIZE : SMALL_ICON_SIZE} height={focused ? FOCUSED_ICON_SIZE : SMALL_ICON_SIZE}
              color={color} accessible={false} />
          ),
        }} />
      <Tabs.Screen name="Favorites" component={Favorites}
        options={{ title: "Favoris", tabBarAccessibilityLabel: "Favoris",
          tabBarIcon: ({ color, focused }) => (
            <FavoriteIcon width={focused ? FOCUSED_ICON_SIZE : SMALL_ICON_SIZE} height={focused ? FOCUSED_ICON_SIZE : SMALL_ICON_SIZE}
              color={color} accessible={false} />
          ),
        }} />
      <Tabs.Screen name="CartShortcut" component={CartShortcut}
        listeners={({ navigation }) => ({
          tabPress: (event) => {
            event.preventDefault();
            navigation.navigate("MainCart");
          },
        })}
        options={{ title: "Panier",
          tabBarAccessibilityLabel: `Panier, ${cartLineCount} ligne${cartLineCount === 1 ? "" : "s"}`,
          tabBarBadge: hasCartLines ? cartLineCount : undefined,
          tabBarBadgeStyle: styles.cartBadge,
          tabBarIcon: () => (
            <View style={[styles.cartContainer, hasCartLines ? styles.activeCart : styles.inactiveCart]}>
              <CartIcon width={hasCartLines ? FOCUSED_ICON_SIZE : SMALL_ICON_SIZE}
                height={hasCartLines ? FOCUSED_ICON_SIZE : SMALL_ICON_SIZE}
                color={hasCartLines ? colors.WHITE : colors.GREY} accessible={false} />
            </View>
          ),
        }} />
      <Tabs.Screen name="Notifications" component={Notifications}
        options={{ title: "Notifications", tabBarAccessibilityLabel: "Notifications",
          tabBarIcon: ({ color, focused }) => (
            <NotificationsIcon width={focused ? FOCUSED_ICON_SIZE : SMALL_ICON_SIZE} height={focused ? FOCUSED_ICON_SIZE : SMALL_ICON_SIZE}
              color={color} accessible={false} />
          ),
        }} />
      <Tabs.Screen name="Profile" component={Profile}
        options={{ title: "Profil", tabBarAccessibilityLabel: "Profil",
          tabBarIcon: ({ color, focused }) => (
            <ProfileIcon width={focused ? FOCUSED_ICON_SIZE : SMALL_ICON_SIZE} height={focused ? FOCUSED_ICON_SIZE : SMALL_ICON_SIZE}
              color={color} accessible={false} />
          ),
        }} />
    </Tabs.Navigator>
  );
}

const styles = StyleSheet.create({
  drawerButton: { marginLeft: spaces.L, minWidth: 48, minHeight: 48,
    alignItems: "center", justifyContent: "center" },
  tabButton: { justifyContent: "center" },
  cartContainer: {
    width: 60, height: 60, borderRadius: radius.FULL,
    justifyContent: "center", alignItems: "center",
    transform: [{ translateY: -16 }],
  },
  cartBadge: { backgroundColor: colors.LIGHT, color: colors.BLUE, minWidth: 20,
    transform: [{ translateY: -16 }] },
  activeCart: { backgroundColor: colors.BLUE },
  inactiveCart: { backgroundColor: colors.WHITE },
  safeBottom: { backgroundColor: colors.WHITE },
});
