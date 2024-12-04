import { Stack, useRouter } from "expo-router"
import AntDesign from "@expo/vector-icons/AntDesign"
import { StyleSheet } from "react-native"
import { colors } from "../../../../constants/colors"

export default function RootLayout() {
  const router = useRouter()
  return (
    <Stack
      screenOptions={{
        contentStyle: {
          backgroundColor: colors.dark,
        },
        headerTintColor: colors.primary,
        headerTitleAlign: "center",
        headerStyle: {
          backgroundColor: colors.dark,
        },
        headerLeft: () => (
          <AntDesign
            name="stepbackward"
            size={24}
            color={colors.primary}
            onPress={() => router.back()}
          />
        ),
        headerShown: false,
      }}
    >
      <Stack.Screen
        name="index"
        options={{
          title: "Articles",
        }}
      />
      <Stack.Screen
        name="favorites/[ids]"
        options={{ title: "Articles favoris" }}
      />
      <Stack.Screen name="[id]" />
    </Stack>
  )
}

export const articeStyles = StyleSheet.create({
  borderTopPage: {
    borderTopWidth: 1,
    borderTopColor: colors.primary,
  },
})
