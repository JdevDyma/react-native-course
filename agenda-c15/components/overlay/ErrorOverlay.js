import { ScrollView, StyleSheet, Text, View } from "react-native";
import { colors } from "../../constants/colors";
import CustomBtn from "../modal/CustomBtn";

export default function ErrorOverlay({ onDismiss }) {
  return (
    <View style={styles.container} accessibilityViewIsModal>
      <ScrollView contentContainerStyle={styles.content}>
        <Text accessibilityRole="alert" style={styles.text}>
          L’opération n’a pas été confirmée. Le formulaire reste disponible.
          Vérifiez la connexion et la liste distante avant de réessayer.
        </Text>
        <View style={styles.button}>
          <CustomBtn text="Revenir au formulaire" color={colors.VIOLET} onPress={onDismiss} />
        </View>
      </ScrollView>
    </View>
  );
}
const styles = StyleSheet.create({
  container: { ...StyleSheet.absoluteFill, backgroundColor: "rgba(0,0,0,0.8)" },
  content: { flexGrow: 1, justifyContent: "center", padding: 24 },
  text: { color: colors.WHITE, fontSize: 22, fontWeight: "600", textAlign: "center" },
  button: { flexDirection: "row", marginTop: 24 },
});
