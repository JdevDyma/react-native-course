import { Link, useLocalSearchParams } from "expo-router";
import { StyleSheet, Text, Touchable, View } from "react-native";
import { useRouter } from 'expo-router';

export default function () {

    const goBack = () => {
        router.goBack()
      };
    return (
      <View
      style={styles.container}
     
    >
      <Touchable onPre>
        <Text>Profile </Text>
      </Touchable>
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
