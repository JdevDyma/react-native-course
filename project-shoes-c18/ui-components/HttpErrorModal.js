import { Modal, ScrollView, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useDispatch, useSelector } from "react-redux";
import { clearHttpError } from "../store/slices/errorSlice";
import CustomButton from "./buttons/CustomButton";
import TextBoldL from "./texts/TextBoldL";
import TextRegularM from "./texts/TextRegularM";
import { colors } from "../constants/colors";
import { spaces } from "../constants/spaces";

export default function HttpErrorModal() {
  const dispatch = useDispatch();
  const { httpError, httpErrorMessage } = useSelector((state) => state.error);
  const close = () => dispatch(clearHttpError());
  return <Modal visible={httpError} transparent animationType="fade" onRequestClose={close}>
    <SafeAreaView style={styles.backdrop}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <View accessibilityViewIsModal style={styles.card}>
          <TextBoldL accessibilityRole="header">L’opération n’a pas abouti</TextBoldL>
          <TextRegularM accessibilityRole="alert" style={styles.message}>{httpErrorMessage}</TextRegularM>
          <CustomButton text="Fermer" onPress={close} />
        </View>
      </ScrollView>
    </SafeAreaView>
  </Modal>;
}
const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: "rgba(0,0,0,0.6)" },
  scroll: { flexGrow: 1, justifyContent: "center", padding: spaces.L },
  card: { backgroundColor: colors.LIGHT, padding: spaces.L, width: "100%", maxWidth: 640, alignSelf: "center" },
  message: { marginVertical: spaces.L },
});
