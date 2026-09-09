import { TouchableOpacity } from "react-native";

export default function Touchable({ style, children, onPress, disabled = false, accessibilityLabel }) {
  const isDisabled = disabled || typeof onPress !== "function";
  return (
    <TouchableOpacity
      activeOpacity={0.7}
      style={style}
      onPress={onPress}
      disabled={isDisabled}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      accessibilityState={{ disabled: isDisabled }}
    >
      {children}
    </TouchableOpacity>
  );
}
