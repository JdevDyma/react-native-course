import { Text, StyleSheet } from "react-native";
import { textSize } from "../../constants/textSize";
import { colors } from "../../constants/colors";

const TextMediumM = ({ children, blue = false, style, ...textProps }) => {
  return (
    <Text
      style={[styles.txt, { color: blue ? colors.BLUE : colors.DARK }, style]}
      {...textProps}
    >
      {children}
    </Text>
  );
};

export default TextMediumM;

const styles = StyleSheet.create({
  txt: {
    fontFamily: "Medium",
    fontSize: textSize.M,
  },
});
