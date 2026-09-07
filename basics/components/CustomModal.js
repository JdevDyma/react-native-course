import {
  Modal, KeyboardAvoidingView, Platform, View, Image,
  TextInput, StyleSheet,
} from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import CustomBtn from "./UI/CustomBtn";

export default function CustomModal({
  isModalVisible,
  inputValue,
  setInputValue,
  onCreateItem,
  onCloseModal,
}) {
  return (
    <Modal
      visible={isModalVisible}
      animationType="slide"
      onRequestClose={onCloseModal}
    >
      <SafeAreaProvider>
        <KeyboardAvoidingView
          style={styles.keyboardView}
          behavior={Platform.OS === "ios" ? "padding" : "height"}
        >
          <SafeAreaView style={styles.modalView}>
            <Image
              source={require("../assets/logo-react-native.png")}
              style={styles.image}
              resizeMode="contain"
              alt="Logo React Native"
            />
            <View style={styles.formContainer}>
              <TextInput
                accessibilityLabel="Texte du nouvel élément"
                value={inputValue}
                onChangeText={setInputValue}
                style={styles.input}
              />
              <View style={styles.modalBtnContainer}>
                <CustomBtn text="Créer" onPress={onCreateItem} color="blue" />
                <CustomBtn text="Fermer" onPress={onCloseModal} color="black" />
              </View>
            </View>
          </SafeAreaView>
        </KeyboardAvoidingView>
      </SafeAreaProvider>
    </Modal>
  );
}

const styles = StyleSheet.create({
  keyboardView: {
    flex: 1,
  },
  modalView: {
    flex: 1,
    backgroundColor: "grey",
    justifyContent: "space-evenly",
    alignItems: "center",
    paddingHorizontal: 24,
  },
  image: {
    width: 260,
    height: 260,
    maxWidth: "100%",
    flexShrink: 1,
    borderRadius: 12,
  },
  formContainer: {
    width: "100%",
  },
  input: {
    width: "100%",
    minHeight: 44,
    backgroundColor: "white",
    color: "black",
    borderWidth: 1,
    borderColor: "grey",
    borderRadius: 8,
    fontSize: 20,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  modalBtnContainer: {
    flexDirection: "row",
    width: "100%",
    justifyContent: "space-between",
  },
});
