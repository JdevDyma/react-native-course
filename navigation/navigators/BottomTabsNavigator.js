import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { AntDesign } from "@react-native-vector-icons/ant-design";
import { Ionicons } from "@react-native-vector-icons/ionicons";
import TopTabsNavigator from "./TopTabsNavigator";
import { Feather } from "@react-native-vector-icons/feather";
import { TouchableOpacity } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import StackNavigator from "./StackNavigator";
import Screen3 from "../screens/Screen3";

const Tab = createBottomTabNavigator();

export default function BottomTabsNavigator() {
  const insets = useSafeAreaInsets();
  return (
    <Tab.Navigator screenOptions={{
      headerShown: false,
      headerShadowVisible: false,
      headerTitleAlign: "center",
      headerStyle: { backgroundColor: "#e6e8f5" },
      headerTitleStyle: { color: "blue" },
      tabBarActiveTintColor: "blue",
      tabBarInactiveTintColor: "grey",
      tabBarActiveBackgroundColor: "#e6e8f5",
      tabBarShowLabel: false,
      tabBarStyle: { height: 80 + insets.bottom, paddingBottom: insets.bottom },
      tabBarButton: (props) => <TouchableOpacity {...props} activeOpacity={0.7} />,
    }}>
      <Tab.Screen name="Home" component={StackNavigator}
        options={{
          headerShown: false,
          tabBarAccessibilityLabel: "Accueil",
          tabBarIcon: ({ color, size }) => <AntDesign name="home" color={color} size={size} accessible={false} />,
        }}
      />
      <Tab.Screen name="Settings" component={Screen3} initialParams={{ name: "David" }}
        options={{
          tabBarAccessibilityLabel: "Réglages",
          tabBarIcon: ({ color, size }) => <Feather name="settings" color={color} size={size} accessible={false} />,
        }}
      />
      <Tab.Screen name="Articles" component={TopTabsNavigator}
        options={{
          tabBarAccessibilityLabel: "Articles",
          tabBarIcon: ({ color, size }) => <Ionicons name="journal-sharp" color={color} size={size} accessible={false} />,
        }}
      />
    </Tab.Navigator>
  );
}
