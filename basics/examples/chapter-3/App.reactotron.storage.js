import { useRef, useState } from "react";
import { Button, StyleSheet } from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import CustomModal from "../../components/CustomModal";
import ItemsList from "../../components/ItemsList";
import ModalOpener from "../../components/ModalOpener";

if (__DEV__) {
  require("./ReactotronConfig.storage");
}

export default function App() {
  const [inputValue, setInputValue] = useState("");
  const [inputResult, setInputResult] = useState([]);
  const [isModalVisible, setModalVisible] = useState(false);
  const nextId = useRef(1);

  const onOpenModal = () => {
    if (__DEV__) {
      console.log("Ouverture du formulaire");
      const Reactotron = require("reactotron-react-native").default;
      Reactotron.log("Message réservé à Reactotron");
    }
    setModalVisible(true);
  };

  const onCloseModal = () => {
    setModalVisible(false);
  };

  const onCreateItem = () => {
    const text = inputValue.trim();
    if (text.length === 0) return;

    const newItem = { id: String(nextId.current), text };
    nextId.current += 1;
    setInputResult((prev) => [...prev, newItem]);
    setInputValue("");
    setModalVisible(false);
  };

  const onTestRequest = async () => {
    if (!__DEV__) return;

    try {
      const response = await fetch("https://jsonplaceholder.typicode.com/todos/1");
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      const data = await response.json();
      console.log("Réponse reçue", data);
    } catch (error) {
      console.warn("La requête a échoué", error.message);
    }
  };

  const onTestStorage = async () => {
    if (!__DEV__) return;
    const Reactotron = require("reactotron-react-native").default;
    try {
      const AsyncStorage = require("@react-native-async-storage/async-storage").default;
      await AsyncStorage.setItem("debug.preference", "compact");
      Reactotron.display({
        name: "STORAGE",
        preview: "Préférence enregistrée",
        value: { key: "debug.preference" },
      });
    } catch {
      console.warn("L’écriture de la préférence n’a pas été confirmée.");
    }
  };

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.container}>
        <ModalOpener onOpenModal={onOpenModal} />
        {__DEV__ && (
          <Button title="Tester la requête" onPress={onTestRequest} />
        )}
        {__DEV__ && <Button title="Tester le stockage" onPress={onTestStorage} />}
        <ItemsList data={inputResult} />
      </SafeAreaView>
      <CustomModal
        isModalVisible={isModalVisible}
        inputValue={inputValue}
        setInputValue={setInputValue}
        onCreateItem={onCreateItem}
        onCloseModal={onCloseModal}
      />
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    backgroundColor: "white",
  },
});
