import { Tabs } from "expo-router"
import { colors } from "../../../constants/colors"
import FontAwesome from "@expo/vector-icons/FontAwesome"
import AntDesign from "@expo/vector-icons/AntDesign"

export default function MainLayout() {
  return (
    <Tabs
      screenOptions={({ navigation }) => ({
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.light,
        tabBarStyle: {
          backgroundColor: colors.dark,
          height: 80,
          paddingTop: 12,
          borderTopLeftRadius: 16,
          borderTopRightRadius: 16,
        },
        headerTintColor: colors.light,
        headerTitleAlign: "center",
        headerStyle: {
          backgroundColor: colors.dark,
        },
        headerLeft: () => (
          <AntDesign
            name="menuunfold"
            size={24}
            color={colors.light}
            style={{ marginLeft: 16 }}
            onPress={() => navigation.getParent().openDrawer()}
          />
        ),
      })}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Accueil",
          tabBarIcon: ({ color }) => (
            <FontAwesome size={28} name="home" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="articles"
        options={{
          popToTopOnBlur: true,
          title: "Accueil",
          tabBarIcon: ({ color }) => (
            <FontAwesome size={28} name="book" color={color} />
          ),
          tabBarActiveTintColor: colors.dark,
          tabBarStyle: {
            backgroundColor: colors.primary,
            height: 80,
            paddingTop: 12,
            borderTopLeftRadius: 16,
            borderTopRightRadius: 16,
            position: "absolute",
          },
          lazy: false,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profil",
          tabBarIcon: ({ color }) => (
            <FontAwesome size={28} name="user" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="about"
        options={{
          title: "À propos",
          tabBarIcon: ({ color }) => (
            <FontAwesome size={28} name="question" color={color} />
          ),
        }}
      />
    </Tabs>
  )
}
