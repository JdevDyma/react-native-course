import { TouchableOpacity, Text, StyleSheet } from "react-native";

export default function CustomBtn({ text, onPress, color }) {
  return (
    <TouchableOpacity
      accessibilityRole="button"
      style={[styles.modalBtns, { backgroundColor: color }]}
      onPress={onPress}
    >
      <Text style={styles.modalBtnText}>{text}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  modalBtns: {
    width: "40%",
    minHeight: 50,
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 16,
  },
  modalBtnText: {
    color: "white",
    fontSize: 20,
  },
});
