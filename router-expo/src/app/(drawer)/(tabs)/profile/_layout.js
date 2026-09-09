import { createMaterialTopTabNavigator } from "expo-router/js-top-tabs";
import { withLayoutContext } from "expo-router";
import { colors } from "../../../../constants/colors";

const Navigator = createMaterialTopTabNavigator().Navigator;
const TopTabs = withLayoutContext(Navigator);

export default function TopTabsLayout() {
  return (
    <TopTabs initialRouteName="index" screenOptions={{
      tabBarIndicatorStyle: { backgroundColor: colors.primary },
      tabBarActiveTintColor: colors.dark,
      tabBarInactiveTintColor: colors.dark,
      tabBarStyle: { backgroundColor: colors.light },
    }}>
      <TopTabs.Screen name="index" options={{ title: "Informations" }} />
      <TopTabs.Screen name="settings" options={{ title: "Réglages" }} />
    </TopTabs>
  );
}
