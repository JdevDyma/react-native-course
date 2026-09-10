import { useEffect, useRef, useState } from "react";
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from "react-native";
import { useSelector, useStore } from "react-redux";
import { SafeAreaView } from "react-native-safe-area-context";
import { useGetUserByIdQuery, updateUserData, isUserWritePending } from "../../store/api/userApi";
import { getProfileKey, isSameProfileSession } from "../../lib/profileSession";
import ProfileForm from "./components/ProfileForm";
import { colors } from "../../constants/colors";
import { spaces } from "../../constants/spaces";

export default function Profile() {
  const store = useStore();
  const auth = useSelector((state) => state.auth);
  const key = getProfileKey(auth);
  const { currentData, isFetching, isUninitialized, error, refetch } = useGetUserByIdQuery(key, { skip: key === null });
  const user = key === null ? undefined : currentData;
  const [isUpdating, setIsUpdating] = useState(false);
  const mounted = useRef(true);
  useEffect(() => { mounted.current = true; return () => { mounted.current = false; }; }, []);
  const retry = () => {
    if (!key || isUninitialized || isFetching || isUpdating || isUserWritePending(store) ||
        !isSameProfileSession(store.getState(), key)) return;
    void refetch();
  };
  async function updateUserProfile({ fullName, location }) {
    if (!key || !user || error || isFetching || isUpdating || !isSameProfileSession(store.getState(), key)) throw new Error("Attendez la lecture du profil.");
    setIsUpdating(true);
    try {
      await updateUserData(store, key, () => ({ fullName, location }));
      if (!mounted.current || !isSameProfileSession(store.getState(), key)) throw new Error("Session remplacée.");
    } finally {
      if (mounted.current) setIsUpdating(false);
    }
  }
  if (!key || !user) {
    return <SafeAreaView edges={["left", "right"]} style={styles.container}>
      {!key ? <Text>Aucune session prête pour lire le profil.</Text> :
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
    <ProfileForm key={`${key.userId}:${key.generation}`} user={user} submitFormHandler={updateUserProfile} isLoading={isFetching || isUpdating} />
  </View>;
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.LIGHT },
  container: { flex: 1, justifyContent: "center", alignItems: "center", padding: spaces.L, backgroundColor: colors.LIGHT },
  banner: { paddingHorizontal: spaces.L, paddingTop: spaces.M },
  retry: { minHeight: 48, justifyContent: "center", alignItems: "center", padding: spaces.S },
});
