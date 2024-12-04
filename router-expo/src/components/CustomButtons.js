import { Link } from "expo-router"
import { StyleSheet, Text, TouchableOpacity } from "react-native"
import { colors } from "../constants/colors"

export const CustomLink = ({ href, text }) => {
  return (
    <Link href={href} style={styles.link}>
      <Text style={styles.text}>{text}</Text>
    </Link>
  )
}

export const CustomButton = ({ onPress, text }) => {
  return (
    <TouchableOpacity onPress={onPress} style={styles.link}>
      <Text style={styles.text}>{text}</Text>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  link: {
    padding: 16,
    backgroundColor: colors.dark,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 12,
  },
  text: {
    color: colors.light,
    fontSize: 20,
    textAlign: "center",
  },
})
