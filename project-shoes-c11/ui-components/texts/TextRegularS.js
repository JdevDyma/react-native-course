import { StyleSheet, Text } from "react-native";
import React from "react";
import { colors } from "../../constants/colors";
import { textSize } from "../../constants/textSize";

const TextRegularS = ({ children, blue = false, style, ...textProps }) => {
  return (
    <Text style={[styles.txt, { color: blue ? colors.BLUE : colors.DARK }, style]} {...textProps}>
      {children}
    </Text>
  );
};

export default TextRegularS;

const styles = StyleSheet.create({
  txt: {
    fontFamily: "Regular",
    fontSize: textSize.S,
  },
});
