import { createMaterialTopTabNavigator } from "@react-navigation/material-top-tabs";
import { StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Screen4 from "../screens/Screen4";
import Screen5 from "../screens/Screen5";
import Screen6 from "../screens/Screen6";

const Tabs = createMaterialTopTabNavigator();

export default function TopTabsNavigator() {
  const insets = useSafeAreaInsets();
  return (
    <View style={[styles.container, {
      paddingLeft: insets.left,
      paddingRight: insets.right,
    }]}>
      <Tabs.Navigator initialRouteName="Article 1" screenOptions={{
        tabBarAndroidRipple: { borderless: false },
        tabBarPressColor: "violet",
        tabBarIndicatorStyle: { backgroundColor: "violet" },
        tabBarInactiveTintColor: "grey",
        tabBarActiveTintColor: "blue",
        tabBarScrollEnabled: true,
        tabBarItemStyle: { width: "auto", minWidth: 120 },
        tabBarAllowFontScaling: true,
        swipeEnabled: false,
        lazy: true,
        lazyPreloadDistance: 1,
      }}>
        <Tabs.Screen name="Article 1" component={Screen4} />
        <Tabs.Screen name="Article 2" component={Screen5} initialParams={{ name: "Bob" }} />
        <Tabs.Screen name="Article 3" component={Screen6} />
      </Tabs.Navigator>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
});
