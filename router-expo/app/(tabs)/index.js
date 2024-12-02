import { Link } from "expo-router"
import { StyleSheet, Text, View } from "react-native"
import { colors } from "../../constants/colors"

export default function HomePage() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Bienvenue sur l'écran d'accueil</Text>
      <Link href="/settings" style={styles.link}>
        <Text style={styles.text}>Aller sur les réglages</Text>
      </Link>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },

  title: {
    fontSize: 32,
    fontWeight: "bold",
    textAlign: "center",
  },
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
  },
})
