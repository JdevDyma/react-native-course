import { Modal, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { colors } from "../../constants/colors";
import CustomBtn from "../modal/CustomBtn";

export default function ErrorModal({ isModalVisible, closeModal, errors }) {
  const messages = Array.isArray(errors) ? errors : Object.values(errors ?? {}).filter((value) => typeof value === "string");
  return (
    <Modal visible={isModalVisible} animationType="slide" transparent onRequestClose={closeModal}>
      <SafeAreaProvider>
        <SafeAreaView style={styles.overlay}>
          <View style={styles.panel} accessibilityViewIsModal>
            <ScrollView contentContainerStyle={styles.content}>
              <Text style={styles.title} accessibilityRole="header">Corrigez le formulaire</Text>
              {messages.map((error) => <Text key={error} style={styles.text}>• {error}</Text>)}
              <View style={styles.buttons}>
                <CustomBtn color={colors.VIOLET} text="OK" onPress={closeModal} />
              </View>
            </ScrollView>
          </View>
        </SafeAreaView>
      </SafeAreaProvider>
    </Modal>
  );
}
const styles = StyleSheet.create({
  overlay: { flex: 1, justifyContent: "flex-end", backgroundColor: "rgba(0,0,0,0.3)" },
  panel: { maxHeight: "85%", width: "100%", maxWidth: 640, alignSelf: "center",
    backgroundColor: colors.WHITE, borderTopLeftRadius: 12, borderTopRightRadius: 12 },
  content: { padding: 24 },
  title: { color: colors.DARK, fontSize: 20, fontWeight: "bold", marginBottom: 12 },
  text: { color: colors.DARK, fontSize: 18, marginBottom: 12 },
  buttons: { flexDirection: "row", marginTop: 12 },
});
