import { Platform, StyleSheet, Switch, Text, View } from "react-native";
import { colors } from "../../constants/colors";

export default function IsOnline({ isEnabled, setIsEnabled }) {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>En ligne</Text>
      <Switch
        value={isEnabled}
        onValueChange={setIsEnabled}
        accessibilityLabel="Événement en ligne"
        trackColor={{ false: colors.GREY, true: colors.LIGHT }}
        thumbColor={isEnabled ? colors.VIOLET : colors.WHITE}
        ios_backgroundColor={colors.GREY}
        style={styles.switch}
      />
    </View>
  );
}
const styles = StyleSheet.create({
  container: { flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    gap: 12, marginVertical: 24, minHeight: 48 },
  label: { flex: 1, color: colors.LIGHT, fontWeight: "600", fontSize: 18 },
  switch: { transform: [{ scale: Platform.select({ android: 1.2, ios: 1, default: 1 }) }] },
});
