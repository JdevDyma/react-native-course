import { createMaterialTopTabNavigator } from "@react-navigation/material-top-tabs"
import ProfilePage from "."
import SettingsPage from "./settings"
import { withLayoutContext } from "expo-router"
import { colors } from "../../../../constants/colors"

const Tab = createMaterialTopTabNavigator().Navigator

export const TopTabs = withLayoutContext(Tab)

export default function TopTabsLayout() {
  return (
    <TopTabs
      screenOptions={{
        tabBarIndicatorStyle: {
          backgroundColor: colors.primary,
        },
      }}
    >
      <TopTabs.Screen name="index" options={{ title: "Informations" }} />
      <TopTabs.Screen name="settings" options={{ title: "Réglages" }} />
    </TopTabs>
  )
}
