import { Pressable, StyleSheet } from "react-native";
import AntDesign from "@expo/vector-icons/AntDesign";
import { Tabs, useNavigation } from "expo-router";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { colors } from "../../../constants/colors";

export default function TabsLayout() {
  const insets = useSafeAreaInsets();
  const drawerNavigation = useNavigation();
  return (
    <Tabs
      initialRouteName="index"
      screenOptions={{
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.light,
        tabBarStyle: {
          backgroundColor: colors.dark,
          height: 80 + insets.bottom,
          paddingTop: 12,
          paddingBottom: insets.bottom,
          borderTopLeftRadius: 16,
          borderTopRightRadius: 16,
        },
        headerLeft: () => (
          <Pressable style={styles.menuButton} accessibilityRole="button"
            accessibilityLabel="Ouvrir le menu de navigation"
            onPress={() => drawerNavigation.openDrawer()}>
            <AntDesign name="menu-unfold" size={24} color={colors.light} accessible={false} />
          </Pressable>
        ),
        headerTintColor: colors.light,
        headerTitleAlign: "center",
        headerStyle: { backgroundColor: colors.dark },
      }}
    >
      <Tabs.Screen name="index" options={{
        title: "Accueil",
        tabBarIcon: ({ color }) => <FontAwesome size={28} name="home" color={color} accessible={false} />,
      }} />
      <Tabs.Screen name="articles" options={{
        title: "Articles",
        tabBarLabel: "Articles",
        popToTopOnBlur: true,
        tabBarIcon: ({ color }) => <FontAwesome size={28} name="book" color={color} accessible={false} />,
        tabBarActiveTintColor: colors.dark,
        tabBarStyle: {
          backgroundColor: colors.primary,
          height: 80 + insets.bottom,
          paddingTop: 12,
          paddingBottom: insets.bottom,
          borderTopLeftRadius: 16,
          borderTopRightRadius: 16,
          position: "absolute",
        },
      }} />
      <Tabs.Screen name="profile" options={{
        title: "Profil",
        tabBarIcon: ({ color }) => <FontAwesome size={28} name="user" color={color} accessible={false} />,
      }} />
      <Tabs.Screen name="about" options={{
        title: "À propos",
        tabBarIcon: ({ color }) => <FontAwesome size={28} name="question" color={color} accessible={false} />,
      }} />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  menuButton: { minWidth: 48, minHeight: 48, marginLeft: 4, alignItems: "center", justifyContent: "center" },
});
