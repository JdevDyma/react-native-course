import { Slot, Stack } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

export default function UserLayout() {
  return( <View style={styles.layoutContainer}><Stack /></View>)
}

const styles = StyleSheet.create({
    layoutContainer: {
        backgroundColor: "#a2d9ce",
        flex:1
    }
})
