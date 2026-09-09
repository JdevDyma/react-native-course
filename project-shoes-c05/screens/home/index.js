import { useState } from "react";
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import SearchSection from "./searchSection";
import ListSection from "./listSection";
import NewsSection from "./newsSection";
import { colors } from "../../constants/colors";

export default function HomeScreen() {
  const [inputValue, setInputValue] = useState("");
  const [selectedBrand, setSelectedBrand] = useState("nike");

  return (
    <SafeAreaView style={styles.screen}>
      <KeyboardAvoidingView
        style={styles.keyboard}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
        >
          <View style={styles.header} />
          <SearchSection
            inputValue={inputValue}
            setInputValue={setInputValue}
            selectedBrand={selectedBrand}
            setSelectedBrand={setSelectedBrand}
          />
          <ListSection selectedBrand={selectedBrand} inputValue={inputValue} />
          <NewsSection selectedBrand={selectedBrand} />
          <View style={styles.footer} />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.LIGHT },
  keyboard: { flex: 1 },
  content: { flexGrow: 1 },
  header: { height: 60, backgroundColor: "black" },
  footer: { height: 106, backgroundColor: "black" },
});
