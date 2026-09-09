import { useEffect, useMemo, useRef } from "react";
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

import { Formik } from "formik";
import { validationSchema } from "./validationSchema";

function createInitialValues(event) {
  return {
    title: event?.title ?? "", location: event?.location ?? "",
    phoneNumber: event?.phoneNumber ?? "", description: event?.description ?? "",
    startDate: event ? new Date(event.startDate) : new Date(),
    endDate: event ? new Date(event.endDate) : new Date(),
    isOnline: event?.isOnline ?? false,
  };
}

export default function FormWithFormik({ isFormVisible, closeForm, selectedEvent }) {
  const dispatch = useDispatch();
  const event = useSelector((state) => state.agenda.events.find((item) => item.id === selectedEvent));
  const initialValues = useMemo(() => createInitialValues(event), [event, isFormVisible]);
  function handleClose() {
    Keyboard.dismiss();
    closeForm();
  }
  function removeEvt() {
    if (event) dispatch(removeEvent({ id: event.id }));
    handleClose();
  }
  function onSubmit(values, { setSubmitting }) {
    try {
      const data = {
        ...values,
        startDate: values.startDate.toISOString(),
        endDate: values.endDate.toISOString(),
        id: event?.id ?? nanoid(),
      };
      dispatch(event ? updateEvent(data) : addEvent(data));
      handleClose();
    } finally {
      setSubmitting(false);
    }
  }
  if (!isFormVisible) return null;
  return (
    <Formik key={event?.id ?? "new"} initialValues={initialValues}
      enableReinitialize validationSchema={validationSchema} onSubmit={onSubmit}>
      {(formik) => <FormContent {...formik} event={event} handleClose={handleClose} removeEvt={removeEvt} />}
    </Formik>
  );
}

function FormContent({ values, handleChange, handleBlur, handleSubmit, setFieldValue,
  setFieldTouched, errors, touched, status, setStatus, isSubmitting, isValidating,
  submitCount, event, handleClose, removeEvt }) {
  const handledAttempt = useRef(0);
  useEffect(() => {
    if (submitCount === 0) {
      handledAttempt.current = 0;
      return;
    }
    if (isSubmitting || isValidating || submitCount <= handledAttempt.current) return;
    handledAttempt.current = submitCount;
    if (Object.keys(errors).length) setStatus("error");
  }, [submitCount, isSubmitting, isValidating, errors, setStatus]);
  function chooseValue(name, value) {
    setFieldValue(name, value);
    setFieldTouched(name, true, false);
  }
  return (
    <Modal visible presentationStyle="formSheet" animationType="slide"
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
                    <Text style={styles.formTitle} accessibilityRole="header">{event ? "Modifier l’événement" : "Nouvel événement"}</Text>
                    <Pressable onPress={removeEvt} style={styles.iconButton}
                      accessibilityRole="button" accessibilityLabel={event ? "Supprimer cet événement" : "Fermer le formulaire"}>
                      <Ionicons name="trash-outline" size={28} color={colors.LIGHT} accessible={false} />
                    </Pressable>
                  </View>
                  <Input label="Titre" autoCorrect={false} autoCapitalize="sentences" maxLength={40}
                    error={Boolean(errors.title && touched.title)} value={values.title} onChangeText={handleChange("title")} onBlur={handleBlur("title")} />
                  <Input label={values.isOnline ? "Url" : "Lieu"}
                    inputMode={values.isOnline ? "url" : "text"}
                    autoCapitalize={values.isOnline ? "none" : "words"}
                    autoCorrect={false} maxLength={40} error={Boolean(errors.location && touched.location)} value={values.location} onChangeText={handleChange("location")} onBlur={handleBlur("location")} />
                  <Input label="Téléphone" inputMode="tel" maxLength={10}
                    error={Boolean(errors.phoneNumber && touched.phoneNumber)} value={values.phoneNumber} onChangeText={handleChange("phoneNumber")} onBlur={handleBlur("phoneNumber")} />
                  <Input label="Description" multiline maxLength={120}
                    value={values.description} onChangeText={handleChange("description")} onBlur={handleBlur("description")} />
                  <DateTimePicker label="Début" error={Boolean(errors.startDate && touched.startDate)} dateTime={values.startDate} setDateTime={(value) => chooseValue("startDate", value)} />
                  <DateTimePicker label="Fin" error={Boolean(errors.endDate && touched.endDate)} dateTime={values.endDate} setDateTime={(value) => chooseValue("endDate", value)} />
                  <IsOnline isEnabled={values.isOnline} setIsEnabled={(value) => chooseValue("isOnline", value)} />
                  <View style={styles.btnContainer}>
                    <CustomBtn text="Annuler" color={colors.PINK} textColor={colors.DARK} onPress={handleClose} />
                    <CustomBtn text="Valider" color={colors.VIOLET} disabled={isSubmitting} onPress={() => { Keyboard.dismiss(); handleSubmit(); }} />
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
        <ErrorModal isModalVisible={status === "error"} closeModal={() => setStatus(undefined)} errors={errors} />
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
