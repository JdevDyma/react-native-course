import { Slot } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

export default function HomeLayout() {
  return( <View style={styles.layoutContainer}><Slot /></View>)
}

const styles = StyleSheet.create({
    layoutContainer: {
        backgroundColor: "salmon",
        flex:1
    }
})
