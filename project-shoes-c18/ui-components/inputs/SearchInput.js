import useResponsiveSizes from "../../hooks/useResponsiveSizes";
import { Platform, StyleSheet, TextInput, View } from "react-native";
import { EvilIcons } from "@react-native-vector-icons/evil-icons";
import { colors } from "../../constants/colors";
import { spaces } from "../../constants/spaces";
import { radius } from "../../constants/radius";
import { textSize } from "../../constants/textSize";

export default function SearchInput({ placeholder, value, onChangeText }) {
  const { isSmallWindow } = useResponsiveSizes();
  return (
    <View style={[styles.inputContainer, { minHeight: isSmallWindow ? 44 : 50 }]}>
      <EvilIcons
        name="search"
        size={32}
        color={colors.GREY}
        style={styles.searchIcon}
        accessible={false}
      />
      <TextInput
        accessibilityLabel="Rechercher des chaussures"
        placeholder={placeholder}
        placeholderTextColor={colors.GREY}
        value={value}
        onChangeText={onChangeText}
        autoCapitalize="none"
        autoCorrect={false}
        underlineColorAndroid="transparent"
        style={styles.input}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.WHITE,
    width: "100%",
    maxWidth: 460,
    borderRadius: radius.FULL,
    minHeight: 50,
  },
  searchIcon: {
    marginHorizontal: spaces.M,
    marginBottom: Platform.select({ android: spaces.XS, default: 0 }),
  },
  input: {
    flex: 1,
    paddingVertical: spaces.S,
    paddingRight: spaces.S,
    color: colors.GREY,
    fontFamily: "Regular",
    fontSize: textSize.M,
  },
});
