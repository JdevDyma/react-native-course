import { ActivityIndicator, Pressable, Text, View } from "react-native";
import { colors } from "../constants/colors";
import { spaces } from "../constants/spaces";

export default function UserProfileStatus({ profile }) {
  if (!profile.busy && !profile.message) return null;
  return <View style={{ padding: spaces.L }}>
    {profile.busy ? <ActivityIndicator color={colors.DARK}
      accessibilityLabel={profile.isWriting ? "Enregistrement du profil" : "Lecture du profil"} /> : null}
    {profile.message ? <>
      <Text accessibilityRole="alert">{profile.message}</Text>
      {profile.userId ? <Pressable onPress={profile.retry} disabled={!profile.canRetry}
        accessibilityRole="button" accessibilityState={{ disabled: !profile.canRetry }}
        style={{ minHeight: 48, justifyContent: "center" }}><Text>Relire le profil</Text></Pressable> : null}
    </> : null}
  </View>;
}
