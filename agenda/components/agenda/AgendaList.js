import { FlatList, View, StyleSheet, Text } from "react-native";
import { useSelector } from "react-redux";
import ListItem from "./ListItem";
import { AntDesign } from "@expo/vector-icons";
import { colors } from "../../constants/colors";
import Form from "../modal/Form";
import { useState } from "react";
import FormWithFormik from "../modal/FormWithFormik";

const Header = ({ openForm }) => (
  <View style={styles.headerContainer}>
    <View />
    <Text style={styles.title}>AGENDA</Text>
    <AntDesign
      name="pluscircle"
      size={32}
      color={colors.PINK}
      suppressHighlighting={true}
      onPress={openForm}
    />
  </View>
);

export default function AgendaList() {
  const agendaItems = useSelector((state) => state.agenda.events);

  const [isFormVisible, setIsFormVisible] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState();
  const openFormHandler = () => setIsFormVisible(true);
  const closeFormHandler = () => {
    setIsFormVisible(false);
    setSelectedEvent();
  };

  const selectEvent = (id) => {
    setSelectedEvent(id);
    setIsFormVisible(true);
  };

  return (
    <>
      <FlatList
        data={[...agendaItems].sort(
          (a, b) => new Date(a.startDate) - new Date(b.startDate)
        )}
        keyExtractor={({ id }) => id}
        ItemSeparatorComponent={<View style={{ height: 24 }} />}
        style={styles.listContainer}
        renderItem={({ item }) => (
          <ListItem item={item} selectItem={selectEvent} />
        )}
        ListHeaderComponent={<Header openForm={openFormHandler} />}
      />
      <FormWithFormik
        isFormVisible={isFormVisible}
        closeForm={closeFormHandler}
        selectedEvent={selectedEvent}
      />
    </>
  );
}
const styles = StyleSheet.create({
  listContainer: {
    paddingHorizontal: 16,
  },
  headerContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    height: 80,
    paddingHorizontal: 16,
    backgroundColor: colors.DARK,
  },
  title: {
    textAlign: "center",
    fontSize: 24,
    fontWeight: "bold",
    color: colors.VIOLET,
  },
});