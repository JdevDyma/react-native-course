import { useState } from "react";
import { FlatList, Pressable, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@react-native-vector-icons/ionicons";
import { useSelector } from "react-redux";
import { colors } from "../../constants/colors";
import ListItem from "./ListItem";
import FormWithFormik from "../modal/FormWithFormik";

function Header({ openForm }) {
  return (
    <View style={styles.headerContainer}>
      <View style={styles.headerSpacer} />
      <Text style={styles.title} accessibilityRole="header">AGENDA</Text>
      <Pressable onPress={openForm} accessibilityRole="button" accessibilityLabel="Ajouter un événement"
        style={styles.addButton}>
        <Ionicons name="add-circle" size={32} color={colors.PINK} accessible={false} />
      </Pressable>
    </View>
  );
}
const Separator = () => <View style={styles.separator} />;

export default function AgendaList() {
  const agendaItems = useSelector((state) => state.agenda.events);
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState();
  const openFormHandler = () => {
    setSelectedEvent(undefined);
    setIsFormVisible(true);
  };
  const closeFormHandler = () => {
    setIsFormVisible(false);
    setSelectedEvent(undefined);
  };
  const selectEvent = (id) => {
    setSelectedEvent(id);
    setIsFormVisible(true);
  };
  return (
    <>
    <FlatList
      data={[...agendaItems].sort((a, b) => new Date(a.startDate) - new Date(b.startDate))}
      keyExtractor={({ id }) => id}
      ItemSeparatorComponent={Separator}
      style={styles.listContainer}
      contentContainerStyle={styles.content}
      renderItem={({ item }) => <ListItem item={item} selectItem={selectEvent} />}
      ListHeaderComponent={<Header openForm={openFormHandler} />}
      ListEmptyComponent={<Text style={styles.empty}>Aucun événement pour le moment.</Text>}
    />
    <FormWithFormik isFormVisible={isFormVisible} closeForm={closeFormHandler} selectedEvent={selectedEvent} />
    </>
  );
}
const styles = StyleSheet.create({
  listContainer: { flex: 1 },
  content: { paddingHorizontal: 16, paddingBottom: 24, flexGrow: 1 },
  separator: { height: 24 },
  headerContainer: { flexDirection: "row", alignItems: "center", minHeight: 80, gap: 8 },
  headerSpacer: { width: 48 },
  title: { flex: 1, textAlign: "center", fontSize: 24, fontWeight: "bold", color: colors.PINK },
  addButton: { minWidth: 48, minHeight: 48, alignItems: "center", justifyContent: "center" },
  empty: { color: colors.WHITE, textAlign: "center", paddingVertical: 24 },
});
