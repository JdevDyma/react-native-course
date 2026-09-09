import { TouchableNativeFeedback, View } from "react-native";
import { colors } from "../../constants/colors";

export default function Touchable({ style, children, onPress, disabled = false, accessibilityLabel }) {
  const isDisabled = disabled || typeof onPress !== "function";
  return (
    <TouchableNativeFeedback
      onPress={onPress}
      disabled={isDisabled}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      accessibilityState={{ disabled: isDisabled }}
      background={TouchableNativeFeedback.Ripple(colors.LIGHT, false)}
      useForeground={TouchableNativeFeedback.canUseNativeForeground()}
    >
      <View style={style}>{children}</View>
    </TouchableNativeFeedback>
  );
}
