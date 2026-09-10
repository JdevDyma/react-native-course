import { Modal, ScrollView, StyleSheet, View, useWindowDimensions } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { radius } from "../../constants/radius";
import { spaces } from "../../constants/spaces";
import { colors } from "../../constants/colors";
import CustomButton from "../buttons/CustomButton";
import TextBoldL from "../texts/TextBoldL";

export default function HttpErrorModal({ isModalVisible, closeModal }) {
  const { height } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  return (
    <Modal visible={isModalVisible} animationType="slide" transparent
      onRequestClose={closeModal}>
      <View style={styles.overlay}>
        <ScrollView style={[styles.panel, { maxHeight: height * 0.8 }]}
          contentContainerStyle={[styles.content, {
            minHeight: height / 2.5,
            paddingBottom: spaces.L + insets.bottom,
          }]}>
          <TextBoldL style={styles.text} accessibilityRole="alert">
            Une erreur est survenue. Veuillez réessayer ultérieurement.
          </TextBoldL>
          <CustomButton onPress={closeModal} text="OK" />
        </ScrollView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, justifyContent: "flex-end" },
  panel: {
    flexGrow: 0, width: "100%", backgroundColor: colors.GREY,
    borderTopLeftRadius: radius.REGULAR,
    borderTopRightRadius: radius.REGULAR,
  },
  content: {
    padding: spaces.L, gap: spaces.L,
    justifyContent: "space-evenly", alignItems: "center",
  },
  text: { textAlign: "center", color: colors.LIGHT },
});
