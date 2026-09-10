import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { nanoid } from "@reduxjs/toolkit";
import { addEvent, updateEvent, removeEvent } from "../../store/slices/agendaSlice";
import {
  Keyboard, KeyboardAvoidingView, Modal, Platform, Pressable, ScrollView,
  StyleSheet, Text, TouchableWithoutFeedback, View,
} from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@react-native-vector-icons/ionicons";
import { colors } from "../../constants/colors";
import Input from "./Input";
import DateTimePicker from "./DateTimePicker";
import IsOnline from "./IsOnline";
import CustomBtn from "./CustomBtn";
import ErrorModal from "./ErrorModal";

function createInitialStateWithErrors(event) {
  const values = {
    title: event?.title ?? "", location: event?.location ?? "",
    phoneNumber: event?.phoneNumber ?? "", description: event?.description ?? "",
    startDate: event ? new Date(event.startDate) : new Date(),
    endDate: event ? new Date(event.endDate) : new Date(),
    isOnline: event?.isOnline ?? false,
  };
  return Object.fromEntries(Object.entries(values).map(([key, value]) => [key, { value, error: false }]));
}

function isUrlValid(value) {
  try {
    const url = new URL(value.trim());
    return (url.protocol === "http:" || url.protocol === "https:") && Boolean(url.hostname);
  } catch {
    return false;
  }
}

export default function Form({ isFormVisible, closeForm, selectedEvent }) {
  const dispatch = useDispatch();
  const event = useSelector((state) =>
    state.agenda.events.find((item) => item.id === selectedEvent)
  );
  const [formData, setFormData] = useState(() => createInitialStateWithErrors());
  const [errorMessages, setErrorMessages] = useState([]);
  const [isErrorModalVisible, setIsErrorModalVisible] = useState(false);
  const closeErrorModal = () => setIsErrorModalVisible(false);
  useEffect(() => {
    if (!isFormVisible) return;
    setFormData(createInitialStateWithErrors(event));
    setErrorMessages([]);
    setIsErrorModalVisible(false);
  }, [event, isFormVisible]);
  function onFormChange(key, value) {
    setFormData((previous) => ({
      ...previous,
      [key]: { ...previous[key], value, error: false },
      ...(key === "isOnline" && !value ? { location: { ...previous.location, error: false } } : {}),
    }));
  }
  function handleClose() {
    Keyboard.dismiss();
    setFormData(createInitialStateWithErrors());
    setErrorMessages([]);
    setIsErrorModalVisible(false);
    closeForm();
  }
  function onSubmit() {
    const values = Object.fromEntries(Object.entries(formData).map(([key, field]) => [key, field.value]));
    const data = {
      ...values,
      startDate: values.startDate.toISOString(),
      endDate: values.endDate.toISOString(),
      id: event?.id ?? nanoid(),
    };
    dispatch(event ? updateEvent(data) : addEvent(data));
    handleClose();
  }
  function removeEvt() {
    if (event) dispatch(removeEvent({ id: event.id }));
    handleClose();
  }
  function validateBeforeSubmit() {
    Keyboard.dismiss();
    const next = Object.fromEntries(Object.entries(formData).map(([key, field]) =>
      [key, { ...field, error: false }]));
    const messages = [];
    function formErrorsHandler(key, message) {
      next[key].error = true;
      messages.push(message);
    }
    if (!formData.title.value.trim()) formErrorsHandler("title", "Le titre est obligatoire.");
    if (formData.isOnline.value && !isUrlValid(formData.location.value)) {
      formErrorsHandler("location", "Une adresse http ou https valide est obligatoire en ligne.");
    }
    const phone = formData.phoneNumber.value;
    if (phone !== "" && !/^[0-9]{10}$/.test(phone)) {
      formErrorsHandler("phoneNumber", "Le téléphone doit contenir exactement dix chiffres.");
    }
    const start = formData.startDate.value.getTime();
    const end = formData.endDate.value.getTime();
    if (!Number.isFinite(start)) formErrorsHandler("startDate", "La date de début est invalide.");
    if (!Number.isFinite(end) || !Number.isFinite(start) || end <= start) {
      formErrorsHandler("endDate", "La fin de l’événement doit être une date valide après le début.");
    }
    setFormData(next);
    setErrorMessages(messages);
    if (messages.length) setIsErrorModalVisible(true);
    else {
      setIsErrorModalVisible(false);
      onSubmit();
    }
  }
  return (
    <Modal visible={isFormVisible} presentationStyle="formSheet" animationType="slide"
      onRequestClose={handleClose} allowSwipeDismissal>
      <SafeAreaProvider>
        <SafeAreaView style={styles.screen}>
          <KeyboardAvoidingView style={styles.flex}
            behavior={Platform.OS === "ios" ? "padding" : "height"}>
            <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
              <View style={styles.flex}>
                <ScrollView contentContainerStyle={styles.formContainer}
                  keyboardShouldPersistTaps="handled" keyboardDismissMode="on-drag">
                  <View style={styles.headerContainer}>
                    <Text style={styles.formTitle} accessibilityRole="header">Nouvel événement</Text>
                    <Pressable onPress={removeEvt} style={styles.iconButton}
                      accessibilityRole="button" accessibilityLabel={event ? "Supprimer cet événement" : "Fermer le formulaire"}>
                      <Ionicons name="trash-outline" size={28} color={colors.LIGHT} accessible={false} />
                    </Pressable>
                  </View>
                  <Input label="Titre" autoCorrect={false} autoCapitalize="sentences" maxLength={40}
                    error={formData.title.error} value={formData.title.value} onChangeText={onFormChange.bind(null, "title")} />
                  <Input label={formData.isOnline.value ? "Url" : "Lieu"}
                    inputMode={formData.isOnline.value ? "url" : "text"}
                    autoCapitalize={formData.isOnline.value ? "none" : "words"}
                    autoCorrect={false} maxLength={40} error={formData.location.error} value={formData.location.value} onChangeText={onFormChange.bind(null, "location")} />
                  <Input label="Téléphone" inputMode="tel" maxLength={10}
                    error={formData.phoneNumber.error} value={formData.phoneNumber.value} onChangeText={onFormChange.bind(null, "phoneNumber")} />
                  <Input label="Description" multiline maxLength={120}
                    value={formData.description.value} onChangeText={onFormChange.bind(null, "description")} />
                  <DateTimePicker label="Début" error={formData.startDate.error} dateTime={formData.startDate.value} setDateTime={onFormChange.bind(null, "startDate")} />
                  <DateTimePicker label="Fin" error={formData.endDate.error} dateTime={formData.endDate.value} setDateTime={onFormChange.bind(null, "endDate")} />
                  <IsOnline isEnabled={formData.isOnline.value} setIsEnabled={onFormChange.bind(null, "isOnline")} />
                  <View style={styles.btnContainer}>
                    <CustomBtn text="Annuler" color={colors.PINK} textColor={colors.DARK} onPress={handleClose} />
                    <CustomBtn text="Valider" color={colors.VIOLET} onPress={validateBeforeSubmit} />
                  </View>
                  <Pressable onPress={Keyboard.dismiss} style={styles.keyboardButton}
                    accessibilityRole="button" accessibilityLabel="Masquer le clavier">
                    <Text style={styles.keyboardButtonText}>Masquer le clavier</Text>
                  </Pressable>
                </ScrollView>
              </View>
            </TouchableWithoutFeedback>
          </KeyboardAvoidingView>
        </SafeAreaView>
        <ErrorModal isModalVisible={isErrorModalVisible} closeModal={closeErrorModal} errors={errorMessages} />
      </SafeAreaProvider>
    </Modal>
  );
}

const styles = StyleSheet.create({
  btnContainer: { flexDirection: "row", flexWrap: "wrap", gap: 12, marginBottom: 16 },
  flex: { flex: 1 },
  screen: { flex: 1, backgroundColor: colors.DARK },
  formContainer: { flexGrow: 1, width: "100%", maxWidth: 640, alignSelf: "center", padding: 24 },
  headerContainer: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 16 },
  formTitle: { flex: 1, fontSize: 24, fontWeight: "bold", color: colors.PINK },
  iconButton: { minWidth: 48, minHeight: 48, alignItems: "center", justifyContent: "center" },
  keyboardButton: { alignSelf: "flex-start", minHeight: 48, justifyContent: "center", paddingVertical: 8 },
  keyboardButtonText: { color: colors.LIGHT, fontSize: 16, textDecorationLine: "underline" },
});
