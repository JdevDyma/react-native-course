import { useState } from "react";
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import SearchSection from "./searchSection";
import ListSection from "./listSection";
import NewsSection from "./newsSection";
import { colors } from "../../constants/colors";

export default function HomeScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const [inputValue, setInputValue] = useState("");
  const [selectedBrand, setSelectedBrand] = useState("nike");

  return (
    <View style={[styles.screen, { paddingLeft: insets.left, paddingRight: insets.right }]}>
      <KeyboardAvoidingView
        style={styles.keyboard}
        keyboardVerticalOffset={headerHeight}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          bounces={false}
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
        >
          <SearchSection
            inputValue={inputValue}
            setInputValue={setInputValue}
            selectedBrand={selectedBrand}
            setSelectedBrand={setSelectedBrand}
          />
          <ListSection selectedBrand={selectedBrand} inputValue={inputValue} navigation={navigation} />
          <NewsSection selectedBrand={selectedBrand} />
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.LIGHT },
  keyboard: { flex: 1 },
  content: { flexGrow: 1 },
});
