import { useDrawerProgress } from "@react-navigation/drawer";
import { Platform, StyleSheet, useWindowDimensions } from "react-native";
import Animated, { Extrapolation, interpolate, useAnimatedStyle, useReducedMotion } from "react-native-reanimated";
import { radius } from "../../constants/radius";

export default function AnimatedScreenWrapper({ children }) {
  const progress = useDrawerProgress();
  const reducedMotion = useReducedMotion();
  const { width } = useWindowDimensions();
  const targetX = Platform.OS === "android" ? Math.max(0, width - 40) : -20;
  const animatedStyle = useAnimatedStyle(() => {
    const value = reducedMotion ? 0 : progress.value;
    return {
      transform: [
        { scale: interpolate(value, [0, 1], [1, 0.7], Extrapolation.CLAMP) },
        { rotate: `${interpolate(value, [0, 1], [0, -5], Extrapolation.CLAMP)}deg` },
        { translateX: interpolate(value, [0, 1], [0, targetX], Extrapolation.CLAMP) },
      ],
      borderRadius: interpolate(value, [0, 1], [0, radius.REGULAR], Extrapolation.CLAMP),
    };
  });
  return <Animated.View style={[styles.container, animatedStyle]}>{children}</Animated.View>;
}
const styles = StyleSheet.create({ container: { flex: 1, overflow: "hidden" } });
