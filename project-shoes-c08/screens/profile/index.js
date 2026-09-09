import { ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { colors } from "../../constants/colors";
import { spaces } from "../../constants/spaces";

export default function Profile() {
  const insets = useSafeAreaInsets();
  return (
    <View style={[styles.screen, { paddingLeft: insets.left, paddingRight: insets.right }]}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.text}>Profil</Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.LIGHT },
  content: { flexGrow: 1, justifyContent: "center", alignItems: "center", padding: spaces.L },
  text: { color: colors.DARK },
});
