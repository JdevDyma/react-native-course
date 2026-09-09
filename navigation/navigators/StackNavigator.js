import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { Pressable, StyleSheet } from "react-native";
import { AntDesign } from "@react-native-vector-icons/ant-design";
import Screen1 from "../screens/Screen1";
import Screen2 from "../screens/Screen2";
const Stack = createNativeStackNavigator();

export default function StackNavigator() {
  return (
    <Stack.Navigator
      initialRouteName="Screen1"
      screenOptions={{
        headerShown: false,
        statusBarStyle: "dark",
        headerShadowVisible: false,
        headerTitleAlign: "center",
        headerStyle: { backgroundColor: "#e6e8f5" },
        headerTitleStyle: { color: "blue" },
      }}
    >
      <Stack.Screen name="Screen1" component={Screen1}
        options={({ navigation }) => ({
          title: "Home",
          headerRight: () => (
            <Pressable style={styles.headerButton} accessibilityRole="button"
              accessibilityLabel="Ouvrir le profil de John"
              onPress={() => navigation.navigate("Screen2", { name: "john" })}>
              <AntDesign name="user" size={24} color="black" accessible={false} />
            </Pressable>
          ),
        })}
      />
      <Stack.Screen name="Screen2" component={Screen2}
        options={({ navigation }) => ({
          title: "Profile",
          headerLeft: ({ canGoBack }) => canGoBack ? (
            <Pressable style={styles.headerButton} accessibilityRole="button"
              accessibilityLabel="Revenir à l’écran précédent"
              onPress={() => navigation.goBack()}>
              <AntDesign name="left-circle" size={24} color="black" accessible={false} />
            </Pressable>
          ) : null,
        })}
      />
    </Stack.Navigator>
  );
}
const styles = StyleSheet.create({
  headerButton: { minWidth: 48, minHeight: 48, justifyContent: "center", alignItems: "center" },
});
