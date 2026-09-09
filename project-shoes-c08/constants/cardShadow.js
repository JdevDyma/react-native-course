import { Platform } from "react-native";
import { colors } from "./colors";

export const cardShadow = Platform.select({
  android: { elevation: 4, shadowColor: colors.DARK },
  ios: {
    shadowColor: colors.DARK,
    shadowOpacity: 0.5,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 2,
  },
  default: {},
});
