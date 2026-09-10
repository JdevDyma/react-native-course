import { Modal, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Ionicons from "@expo/vector-icons/Ionicons";
import { ICON_SIZE } from "../../../constants/sizes";
import { colors } from "../../../constants/colors";
import { spaces } from "../../../constants/spaces";
import { radius } from "../../../constants/radius";
import TextBoldM from "../../../ui-components/texts/TextBoldM";
import CustomButton from "../../../ui-components/buttons/CustomButton";

export default function PaymentSuccess({ onPress, busy, message }) {
  return (
    <Modal transparent visible animationType="fade" onRequestClose={() => { if (!busy) onPress(); }}>
      <SafeAreaView style={styles.container}>
        <ScrollView contentContainerStyle={styles.content}>
          <View style={styles.card} accessibilityViewIsModal>
            <Ionicons name="checkmark-done-circle-sharp" size={ICON_SIZE} color={colors.BLUE}
              accessible={false} />
            <TextBoldM style={styles.text}>Merci pour votre commande !</TextBoldM>
            <Text style={styles.description}>Votre paiement est confirmé.</Text>
            {!!message && <Text style={styles.message} accessibilityLiveRegion="polite">{message}</Text>}
            <CustomButton text="OK" onPress={onPress} isLoading={busy} />
          </View>
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "rgba(0,0,0,0.25)" },
  content: { flexGrow: 1, justifyContent: "center", alignItems: "center", padding: spaces.L },
  card: { width: "100%", maxWidth: 420, minHeight: 160, padding: spaces.L,
    borderRadius: radius.REGULAR, borderWidth: 1, borderColor: colors.BLUE,
    backgroundColor: colors.WHITE, alignItems: "center" },
  text: { marginVertical: spaces.XL, textAlign: "center" },
  description: { color: colors.DARK, marginBottom: spaces.L, textAlign: "center" },
  message: { color: colors.DARK, marginBottom: spaces.L, textAlign: "center" },
});
