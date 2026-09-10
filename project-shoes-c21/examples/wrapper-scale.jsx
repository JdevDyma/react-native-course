import { useDrawerProgress } from "@react-navigation/drawer";
import Animated, { Extrapolation, interpolate, useAnimatedStyle } from "react-native-reanimated";
export default function AnimatedScreenWrapper({ children }) {
  const progress = useDrawerProgress();
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: interpolate(progress.value, [0, 1], [1, 0.7], Extrapolation.CLAMP) }],
  }));
  return <Animated.View style={[{ flex: 1 }, animatedStyle]}>{children}</Animated.View>;
}
