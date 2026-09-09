import { StyleSheet } from "react-native";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { Provider } from "react-redux";
import { store } from "./store/store";
import AgendaList from "./components/agenda/AgendaList";
import { colors } from "./constants/colors";

export default function App() {
  return (
    <Provider store={store}>
      <SafeAreaProvider>
        <SafeAreaView style={styles.container}>
          <StatusBar style="light" />
          <AgendaList />
        </SafeAreaView>
      </SafeAreaProvider>
    </Provider>
  );
}
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.DARK },
});
