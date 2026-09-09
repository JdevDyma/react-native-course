import { Stack } from "expo-router";

export default function RootLayout() {
  return (
    <Stack initialRouteName="(drawer)">
      <Stack.Screen name="(drawer)" options={{ headerShown: false }} />
    </Stack>
  );
}
