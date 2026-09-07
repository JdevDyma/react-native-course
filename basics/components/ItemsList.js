import { View, FlatList, Text, StyleSheet } from "react-native";

export default function ItemsList({ data }) {
  return (
    <View style={styles.resultContainer}>
      <FlatList
        style={styles.list}
        showsVerticalScrollIndicator={false}
        data={data}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.itemContainer}>
            <Text style={styles.item}>{item.text}</Text>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  resultContainer: {
    flex: 1,
    width: "100%",
    padding: 8,
  },
  list: {
    flex: 1,
    width: "100%",
  },
  itemContainer: {
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
    minHeight: 38,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginVertical: 12,
    borderRadius: 8,
    backgroundColor: "rgba(0,0,0,0.75)",
  },
  item: {
    color: "white",
    fontSize: 20,
  },
});
