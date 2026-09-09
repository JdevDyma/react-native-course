import { Stack } from "expo-router";
import { colors } from "../../../../constants/colors";

export default function ArticlesLayout() {
  return (
    <Stack screenOptions={{
      headerShown: false,
      contentStyle: { backgroundColor: colors.dark },
    }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="[id]" />
      <Stack.Screen name="favorites/[ids]" />
    </Stack>
  );
}
