import { useState } from "react";
import { Keyboard, Platform, Pressable, StyleSheet, Text, View } from "react-native";
import DateTimePickerModal from "react-native-modal-datetime-picker";
import { getFormattedFullDate, getFormattedTime } from "../../utils";
import { colors } from "../../constants/colors";

export default function DateTimePicker({ label, dateTime, setDateTime, error = false }) {
  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);
  const [mode, setMode] = useState("date");
  const year = new Date().getFullYear();

  function showPicker(nextMode) {
    Keyboard.dismiss();
    setMode(nextMode);
    setDatePickerVisibility(true);
  }
  function hideDatePicker() {
    setDatePickerVisibility(false);
  }
  function handleConfirm(date) {
    hideDatePicker();
    setDateTime(date);
  }
  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.dateAndTimeContainer}>
        <Pressable style={[styles.dateTime, styles.dateContainer, error && styles.error]}
          onPress={() => showPicker("date")} accessibilityRole="button"
          accessibilityLabel={`${label}, choisir la date : ${getFormattedFullDate(dateTime)}`}>
          <Text style={styles.value}>{getFormattedFullDate(dateTime)}</Text>
        </Pressable>
        <Pressable style={[styles.dateTime, styles.timeContainer, error && styles.error]}
          onPress={() => showPicker("time")} accessibilityRole="button"
          accessibilityLabel={`${label}, choisir l'heure : ${getFormattedTime(dateTime)}`}>
          <Text style={styles.value}>{getFormattedTime(dateTime)}</Text>
        </Pressable>
      </View>
      <DateTimePickerModal isVisible={isDatePickerVisible} mode={mode}
        date={dateTime} onConfirm={handleConfirm} onCancel={hideDatePicker}
        display={Platform.OS === "ios" ? "spinner" : "default"}
        locale={Platform.OS === "ios" ? "fr-FR" : undefined}
        minuteInterval={Platform.OS === "ios" ? 15 : undefined}
        minimumDate={mode === "date" ? new Date(year - 1, 0, 1) : undefined}
        maximumDate={mode === "date" ? new Date(year + 10, 11, 31) : undefined}
        cancelTextIOS="Annuler" confirmTextIOS="Valider" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flexDirection: "row", flexWrap: "wrap", alignItems: "center", gap: 12, marginTop: 12 },
  label: { color: colors.LIGHT, fontWeight: "600", fontSize: 18, minWidth: 48 },
  dateAndTimeContainer: { flexDirection: "row", flexWrap: "wrap", flex: 1, gap: 12 },
  dateContainer: { flexGrow: 2, flexBasis: 136 },
  timeContainer: { flexGrow: 1, flexBasis: 88 },
  dateTime: { minHeight: 48, borderRadius: 12, backgroundColor: colors.WHITE,
    paddingHorizontal: 12, paddingVertical: 12, justifyContent: "center", alignItems: "center" },
  error: { borderColor: "red", borderWidth: 2 },
  value: { color: colors.DARK, textAlign: "center" },
});
