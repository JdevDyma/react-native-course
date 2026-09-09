import { createNativeStackNavigator } from "@react-navigation/native-stack";
import Pictures from "../screens/Pictures";
import PictureDetails from "../screens/PictureDetails";

const Stack = createNativeStackNavigator();

export default function StackNavigator() {
  return (
    <Stack.Navigator initialRouteName="Pictures">
      <Stack.Screen component={Pictures} name="Pictures" />
      <Stack.Screen component={PictureDetails} name="Picture" />
    </Stack.Navigator>
  );
}
