import { Link, useLocalSearchParams } from "expo-router";
import { StyleSheet, Text, View } from "react-native";

export default function () {
    const {name} = useLocalSearchParams()
    return (
      <View
      style={styles.container}
     
    >
      <Link href="/">
    
        <Text>Hello {name}</Text>
      </Link>
      </View>

    )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
});
