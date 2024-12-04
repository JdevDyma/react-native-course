import {
  Link,
  useLocalSearchParams,
  useNavigation,
  useRouter,
} from "expo-router"
import { StyleSheet, Text, TouchableOpacity, View } from "react-native"
import { articeStyles } from "../_layout"
import { colors } from "../../../../../constants/colors"
import { useEffect } from "react"

export default function FavoritesPage() {
  const params = useLocalSearchParams()
  const ids = JSON.parse(params.ids)

  const router = useRouter()
  const navigation = useNavigation()

  useEffect(() => {
    navigation.getParent().setOptions({
      title: "Articles favoris",
      tabBarLabel: "Articles",
    })
    return () => {
      navigation.getParent().setOptions({
        title: "Articles",
        tabBarLabel: "Articles",
      })
    }
  }, [navigation])
  return (
    <View style={[styles.container, articeStyles.borderTopPage]}>
      <Text style={styles.title}>Les articles favoris</Text>
      {ids.map((id) => (
        <Text style={styles.idsText} key={id}>
          {id}
        </Text>
      ))}
      <TouchableOpacity style={styles.link} onPress={() => router.back()}>
        <Text style={styles.text}>Revenir à tous les articles</Text>
      </TouchableOpacity>
      <Link href="/" style={styles.link}>
        <Text style={styles.text}>Revenir sur l'écran de bienvenue</Text>
      </Link>
      <Link
        href={{
          pathname: "/articles/[id]",
          params: { id: "6534", dismissCount: 2 },
        }}
        style={styles.link}
      >
        <Text style={styles.text}>Lire l'article</Text>
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
    color: colors.light,
  },
  link: {
    padding: 16,
    backgroundColor: colors.primary,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 12,
  },
  text: {
    color: colors.dark,
    fontSize: 20,
  },
  idsText: {
    color: colors.light,
    fontSize: 18,
  },
})
