import { View, TouchableOpacity, Text, StyleSheet } from "react-native";

export default function ModalOpener({ onOpenModal }) {
  return (
    <View style={styles.btnContainer}>
      <TouchableOpacity
        accessibilityRole="button"
        activeOpacity={0.9}
        style={styles.btn}
        onPress={onOpenModal}
      >
        <Text style={styles.btnText}>Ajouter un élément</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  btnContainer: {
    flexDirection: "row",
    width: "100%",
    paddingHorizontal: 12,
  },
  btn: {
    width: "100%",
    minHeight: 50,
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "violet",
    marginTop: 12,
  },
  btnText: {
    color: "black",
    fontSize: 20,
  },
});
