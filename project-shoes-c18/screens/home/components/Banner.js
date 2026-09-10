import { View, StyleSheet, TouchableOpacity } from "react-native";
import { spaces } from "../../../constants/spaces";
import TextBoldL from "../../../ui-components/texts/TextBoldL";
import TextMediumM from "../../../ui-components/texts/TextMediumM";

export default function Banner({ text, onPress }) {
  return (
    <View style={styles.container}>
      <View style={styles.title}><TextBoldL>{text}</TextBoldL></View>
      <TouchableOpacity style={styles.action} onPress={onPress} disabled={!onPress}
        accessibilityRole="button" accessibilityState={{ disabled: !onPress }}
        accessibilityLabel={`Voir tout : ${text}`}>
        <TextMediumM blue>Voir tout</TextMediumM>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  action: { minHeight: 48, minWidth: 48, justifyContent: "center" },
  title: { flex: 1, paddingRight: spaces.S },
  container: {
    flexDirection: "row",
    paddingHorizontal: spaces.L,
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spaces.M,
  },
});
