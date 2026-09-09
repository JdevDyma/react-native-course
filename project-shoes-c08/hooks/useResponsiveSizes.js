import { useWindowDimensions } from "react-native";
import { SMALL_WINDOW_WIDTH, LARGE_WINDOW_WIDTH } from "../constants/sizes";

export default function useResponsiveSizes() {
  const { width, height, scale, fontScale } = useWindowDimensions();
  return {
    width, height, scale, fontScale,
    isSmallWindow: width <= SMALL_WINDOW_WIDTH,
    isLargeWindow: width >= LARGE_WINDOW_WIDTH,
  };
}
