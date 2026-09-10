import { useEffect, useRef, useState } from "react";
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from "react-native";
import { useSelector, useStore } from "react-redux";
import { SafeAreaView } from "react-native-safe-area-context";
import { useGetUserByIdQuery, updateUserData, isUserWritePending } from "../../store/api/userApi";
import ProfileForm from "./components/ProfileForm";
import { colors } from "../../constants/colors";
import { spaces } from "../../constants/spaces";

export default function Profile() {
  const store = useStore();
  const userId = useSelector((state) => state.user.id);
  const { currentData: user, isFetching, error, refetch } = useGetUserByIdQuery(userId, { skip: !userId });
  const [isUpdating, setIsUpdating] = useState(false);
  const mounted = useRef(true);
  useEffect(() => { mounted.current = true; return () => { mounted.current = false; }; }, []);
  const retry = () => {
    if (!userId || isFetching || isUserWritePending(store)) return;
    refetch();
  };
  async function updateUserProfile({ fullName, location }) {
    if (!userId || !user || isFetching || isUpdating) throw new Error("Attendez la lecture du profil.");
    setIsUpdating(true);
    try {
      await updateUserData(store, userId, () => ({ fullName, location }));
    } finally {
      if (mounted.current) setIsUpdating(false);
    }
  }
  if (!userId || !user) {
    return <SafeAreaView edges={["left", "right"]} style={styles.container}>
      {!userId ? <Text>Aucun profil de démonstration sélectionné.</Text> :
        isFetching ? <ActivityIndicator size="large" color={colors.DARK} accessibilityLabel="Lecture du profil" /> :
        error ? <>
          <Text accessibilityRole="alert">Impossible de lire le profil.</Text>
          <Pressable accessibilityRole="button" style={styles.retry} onPress={retry}><Text>Réessayer</Text></Pressable>
        </> : <Text>Ce profil n’existe plus.</Text>}
    </SafeAreaView>;
  }
  return <View style={styles.screen}>
    {error ? <View style={styles.banner}>
      <Text accessibilityRole="alert">La dernière lecture a échoué. La saisie reste affichée.</Text>
      <Pressable accessibilityRole="button" style={styles.retry} onPress={retry}
        disabled={isFetching || isUpdating} accessibilityState={{ disabled: isFetching || isUpdating }}><Text>Relire le profil</Text></Pressable>
    </View> : null}
    <ProfileForm key={user.id} user={user} submitFormHandler={updateUserProfile} isLoading={isFetching || isUpdating} />
  </View>;
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.LIGHT },
  container: { flex: 1, justifyContent: "center", alignItems: "center", padding: spaces.L, backgroundColor: colors.LIGHT },
  banner: { paddingHorizontal: spaces.L, paddingTop: spaces.M },
  retry: { minHeight: 48, justifyContent: "center", alignItems: "center", padding: spaces.S },
});
