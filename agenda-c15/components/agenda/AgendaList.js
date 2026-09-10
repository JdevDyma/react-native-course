import { useState } from "react";
import { useStore } from "react-redux";
import { endStoredSession, retrySessionDeletion } from "../../store/authSession";
import { useGetAllEventsQuery } from "../../store/api/agendaApi";
import { Alert, ActivityIndicator, FlatList, Pressable, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@react-native-vector-icons/ionicons";
import { colors } from "../../constants/colors";
import ListItem from "./ListItem";
import FormWithFormik from "../modal/FormWithFormik";

function Header({ openForm, disabled, logout }) {
  return (
    <View style={styles.headerContainer}>
      <Pressable onPress={logout} accessibilityRole="button" accessibilityLabel="Se déconnecter" style={styles.addButton}>
        <Ionicons name="log-out-outline" size={28} color={colors.PINK} accessible={false} />
      </Pressable>
      <Text style={styles.title} accessibilityRole="header">AGENDA</Text>
      <Pressable disabled={disabled} accessibilityState={{ disabled }} onPress={openForm} accessibilityRole="button" accessibilityLabel="Ajouter un événement"
        style={styles.addButton}>
        <Ionicons name="add-circle" size={32} color={colors.PINK} accessible={false} />
      </Pressable>
    </View>
  );
}
const Separator = () => <View style={styles.separator} />;

function ListEmptyComponent({ isLoading, error, retry }) {
  return (
    <View style={styles.listEmptyContainer}>
      {isLoading ? <ActivityIndicator color={colors.WHITE} size="large" accessibilityLabel="Chargement des événements" /> :
        error ? <>
          <Text accessibilityRole="alert" style={styles.errorText}>{error}</Text>
          <Pressable accessibilityRole="button" onPress={retry} style={styles.retryButton}>
            <Text style={styles.empty}>Réessayer</Text>
          </Pressable>
        </> : <Text style={styles.empty}>Aucun événement pour le moment.</Text>}
    </View>
  );
}

export default function AgendaList() {
  const store = useStore();
  const showDeletionError = (generation) => {
    if (store.getState().auth.generation !== generation) return;
    Alert.alert("Stockage de session", "La session locale est fermée, mais son effacement du stockage n’a pas été confirmé. Elle pourrait être restaurée au redémarrage.", [
      { text: "Fermer", style: "cancel" },
      { text: "Réessayer", onPress: () => {
        void retrySessionDeletion(store, generation).catch(() => showDeletionError(generation));
      } },
    ]);
  };
  const logout = () => {
    const operation = endStoredSession(store);
    const generation = store.getState().auth.generation;
    void operation.catch(() => showDeletionError(generation));
  };
  const { data: agendaItems = [], isLoading, isFetching, error, refetch } = useGetAllEventsQuery();
  const httpError = error ? (typeof error === "string" ? error : "Impossible de charger les événements.") : "";
  const busy = isLoading || isFetching;
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
  const selectEvent = (event) => {
    if (busy || httpError) return;
    setSelectedEvent(event.id);
    setIsFormVisible(true);
  };
  const refreshList = () => { refetch(); };
  return (
    <>
    <FlatList
      data={agendaItems}
      keyExtractor={({ id }) => id}
      ItemSeparatorComponent={Separator}
      style={styles.listContainer}
      contentContainerStyle={styles.content}
      renderItem={({ item }) => <ListItem item={item} selectItem={() => selectEvent(item)} />}
      ListHeaderComponent={<>
        <Header openForm={openFormHandler} disabled={busy || Boolean(httpError)} logout={logout} />
        {agendaItems.length > 0 && isFetching ? <ActivityIndicator color={colors.WHITE} accessibilityLabel="Réactualisation des événements" /> : null}
        {agendaItems.length > 0 && httpError && !isFetching ? <View>
          <Text accessibilityRole="alert" style={styles.errorText}>{httpError} La liste précédente reste affichée.</Text>
          <Pressable accessibilityRole="button" onPress={refreshList} style={styles.retryButton}>
            <Text style={styles.empty}>Réessayer la lecture</Text>
          </Pressable>
        </View> : null}
      </>}
      ListEmptyComponent={<ListEmptyComponent isLoading={busy} error={httpError} retry={refreshList} />}
    />
    {isFormVisible ? <FormWithFormik key={selectedEvent ?? "new"}
      isFormVisible={isFormVisible} closeForm={closeFormHandler} selectedEvent={selectedEvent} /> : null}
    </>
  );
}
const styles = StyleSheet.create({
  listEmptyContainer: { flex: 1, minHeight: 240, alignItems: "center", justifyContent: "center", padding: 16 },
  errorText: { color: colors.WHITE, fontSize: 22, fontWeight: "700", textAlign: "center" },
  retryButton: { minHeight: 48, justifyContent: "center" },
  listContainer: { flex: 1 },
  content: { paddingHorizontal: 16, paddingBottom: 24, flexGrow: 1 },
  separator: { height: 24 },
  headerContainer: { flexDirection: "row", alignItems: "center", minHeight: 80, gap: 8 },
  title: { flex: 1, textAlign: "center", fontSize: 24, fontWeight: "bold", color: colors.PINK },
  addButton: { minWidth: 48, minHeight: 48, alignItems: "center", justifyContent: "center" },
  empty: { color: colors.WHITE, textAlign: "center", paddingVertical: 24 },
});
