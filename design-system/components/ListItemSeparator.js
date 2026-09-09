import { View, StyleSheet } from "react-native";
import { margin } from "../constants/margin";

export default function ListItemSeparator() {
  return <View style={styles.separator} />;
}

const styles = StyleSheet.create({
  separator: { marginVertical: margin.VERTICAL_SEPARATOR },
});
