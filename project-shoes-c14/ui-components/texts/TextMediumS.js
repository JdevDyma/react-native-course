import { Text, StyleSheet } from "react-native";
import { textSize } from "../../constants/textSize";
import { colors } from "../../constants/colors";

const TextMediumS = ({ children, blue = false, style }) => {
  return (
    <Text
      style={[styles.txt, { color: blue ? colors.BLUE : colors.DARK }, style]}
    >
      {children}
    </Text>
  );
};

export default TextMediumS;

const styles = StyleSheet.create({
  txt: {
    fontFamily: "Medium",
    fontSize: textSize.S,
  },
});
