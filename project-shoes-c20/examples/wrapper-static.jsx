import { StyleSheet } from "react-native";
import Animated from "react-native-reanimated";
export default function AnimatedScreenWrapper({ children }) {
  return <Animated.View style={styles.container}>{children}</Animated.View>;
}
const styles = StyleSheet.create({ container: { flex: 1 } });
