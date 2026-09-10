import { useEffect, useMemo, useRef, useState } from "react";
import {
  useGetAllEventsQuery, useCreateEventMutation, useUpdateEventMutation, useDeleteEventMutation,
} from "../../store/api/agendaApi";
import {
  ActivityIndicator, Keyboard, KeyboardAvoidingView, Modal, Platform, Pressable, ScrollView,
  StyleSheet, Text, TouchableWithoutFeedback, View,
} from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@react-native-vector-icons/ionicons";
import { colors } from "../../constants/colors";
import Input from "../shared/Input";
import DateTimePicker from "./DateTimePicker";
import IsOnline from "./IsOnline";
import CustomBtn from "./CustomBtn";
import ErrorModal from "../shared/ErrorModal";
import LoadingOverlay from "../overlay/LoadingOverlay";
import ErrorOverlay from "../overlay/ErrorOverlay";

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
  const { event, isFetching, isError, refetch } = useGetAllEventsQuery(undefined, {
    skip: !selectedEvent || !isFormVisible,
    selectFromResult: ({ data, isFetching, isError }) => ({
      event: data?.find((item) => item.id === selectedEvent), isFetching, isError,
    }),
  });
  const [createEvent, createState] = useCreateEventMutation();
  const [updateEvent, updateState] = useUpdateEventMutation();
  const [deleteEvent, deleteState] = useDeleteEventMutation();
  const mutationBusy = createState.isLoading || updateState.isLoading || deleteState.isLoading;

  const requestPending = useRef(false);
  const [httpError, setHttpError] = useState(false);
  const mounted = useRef(true);
  useEffect(() => {
    mounted.current = true;
    return () => { mounted.current = false; };
  }, []);
  const initialValues = useMemo(() => createInitialValues(event), [event, isFormVisible]);
  function handleClose() {
    if (requestPending.current || !mounted.current) return;
    setHttpError(false);
    Keyboard.dismiss();
    closeForm();
  }
  async function httpEventHandler(data, trigger) {
    if (requestPending.current) return;
    requestPending.current = true;
    setHttpError(false);
    let succeeded = false;
    try {
      await trigger(data).unwrap();
      succeeded = true;
    } catch {
      if (mounted.current) setHttpError(true);
    } finally {
      requestPending.current = false;
    }
    if (succeeded && mounted.current) {
      handleClose();
    }
  }
  async function removeEvt() {
    if (requestPending.current) return;
    if (!event) { handleClose(); return; }
    await httpEventHandler({ id: event.id }, deleteEvent);
  }
  async function onSubmit(values, { setSubmitting, setStatus }) {
    if (requestPending.current) return;
    setStatus(undefined);
    const data = {
      ...values,
      startDate: values.startDate.toISOString(),
      endDate: values.endDate.toISOString(),
      ...(event ? { id: event.id } : {}),
    };
    try {
      await httpEventHandler(data, event ? updateEvent : createEvent);
    } finally {
      if (mounted.current) setSubmitting(false);
    }
  }
  if (!isFormVisible) return null;
  if (selectedEvent && !event) {
    return (
      <Modal visible presentationStyle="formSheet" animationType="slide" onRequestClose={handleClose}>
        <SafeAreaProvider>
          <SafeAreaView style={styles.screen}>
            <ScrollView contentContainerStyle={styles.formContainer}>
              {isFetching ? <ActivityIndicator color={colors.LIGHT} accessibilityLabel="Chargement de l’événement" /> :
                <Text style={styles.keyboardButtonText} accessibilityRole="alert">
                  {isError ? "Impossible de charger cet événement." : "Cet événement n’est plus disponible."}
                </Text>}
              <CustomBtn text="Réessayer" color={colors.VIOLET} disabled={isFetching}
                onPress={() => { refetch(); }} />
              <CustomBtn text="Fermer" color={colors.PINK} textColor={colors.DARK} onPress={handleClose} />
            </ScrollView>
          </SafeAreaView>
        </SafeAreaProvider>
      </Modal>
    );
  }
  return (
    <Formik key={event?.id ?? "new"} initialValues={initialValues}
      validationSchema={validationSchema} onSubmit={onSubmit}>
      {(formik) => <FormContent {...formik} event={event} handleClose={handleClose} removeEvt={removeEvt}
        isRemoveLoading={deleteState.isLoading} mutationBusy={mutationBusy}
        readError={isError} isFetching={isFetching} retryRead={() => { refetch(); }} httpError={httpError} dismissHttpError={() => setHttpError(false)} />}
    </Formik>
  );
}

function FormContent({ values, handleChange, handleBlur, handleSubmit, setFieldValue,
  setFieldTouched, errors, touched, status, setStatus, isSubmitting, isValidating,
  submitCount, event, handleClose, removeEvt, isRemoveLoading, mutationBusy, readError, isFetching, retryRead, httpError, dismissHttpError }) {
  const mutating = isSubmitting || mutationBusy;
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
    if (mutating) return;
    setFieldValue(name, value);
    setFieldTouched(name, true, false);
  }
  return (
    <Modal visible presentationStyle="formSheet" animationType="slide"
      onRequestClose={handleClose} allowSwipeDismissal={!mutating}>
      <SafeAreaProvider>
        <SafeAreaView style={styles.screen}>
          <KeyboardAvoidingView style={styles.flex}
            behavior={Platform.OS === "ios" ? "padding" : "height"}>
            <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
              <View style={styles.flex}
                pointerEvents={mutating || httpError ? "none" : "auto"}
                accessibilityElementsHidden={mutating || httpError}
                importantForAccessibility={mutating || httpError ? "no-hide-descendants" : "auto"}>
                <ScrollView contentContainerStyle={styles.formContainer}
                  keyboardShouldPersistTaps="handled" keyboardDismissMode="on-drag">
                  <View style={styles.headerContainer}>
                    <Text style={styles.formTitle} accessibilityRole="header">{event ? "Modifier l’événement" : "Nouvel événement"}</Text>
                    <Pressable onPress={removeEvt} disabled={mutating} accessibilityState={{ disabled: mutating, busy: isRemoveLoading }} style={styles.iconButton}
                      accessibilityRole="button" accessibilityLabel={event ? "Supprimer cet événement" : "Fermer le formulaire"}>
                      {isRemoveLoading ? <ActivityIndicator color={colors.LIGHT} /> : <Ionicons name="trash-outline" size={28} color={colors.LIGHT} accessible={false} />}
                    </Pressable>
                  </View>
                  {readError ? <View>
                    <Text style={styles.keyboardButtonText} accessibilityRole="alert">
                      La dernière lecture a échoué. Votre saisie est conservée.
                    </Text>
                    <CustomBtn text="Réessayer la lecture" color={colors.VIOLET}
                      disabled={mutating || isFetching} onPress={retryRead} />
                  </View> : null}
                  <Input editable={!mutating} label="Titre" autoCorrect={false} autoCapitalize="sentences" maxLength={40}
                    error={Boolean(errors.title && touched.title)} value={values.title} onChangeText={handleChange("title")} onBlur={handleBlur("title")} />
                  <Input editable={!mutating} label={values.isOnline ? "Url" : "Lieu"}
                    inputMode={values.isOnline ? "url" : "text"}
                    autoCapitalize={values.isOnline ? "none" : "words"}
                    autoCorrect={false} maxLength={40} error={Boolean(errors.location && touched.location)} value={values.location} onChangeText={handleChange("location")} onBlur={handleBlur("location")} />
                  <Input editable={!mutating} label="Téléphone" inputMode="tel" maxLength={10}
                    error={Boolean(errors.phoneNumber && touched.phoneNumber)} value={values.phoneNumber} onChangeText={handleChange("phoneNumber")} onBlur={handleBlur("phoneNumber")} />
                  <Input editable={!mutating} label="Description" multiline maxLength={120}
                    value={values.description} onChangeText={handleChange("description")} onBlur={handleBlur("description")} />
                  <DateTimePicker label="Début" error={Boolean(errors.startDate && touched.startDate)} dateTime={values.startDate} setDateTime={(value) => chooseValue("startDate", value)} />
                  <DateTimePicker label="Fin" error={Boolean(errors.endDate && touched.endDate)} dateTime={values.endDate} setDateTime={(value) => chooseValue("endDate", value)} />
                  <IsOnline isEnabled={values.isOnline} setIsEnabled={(value) => chooseValue("isOnline", value)} />
                  <View style={styles.btnContainer}>
                    <CustomBtn disabled={mutating} text="Annuler" color={colors.PINK} textColor={colors.DARK} onPress={handleClose} />
                    <CustomBtn text="Valider" color={colors.VIOLET} isLoading={isSubmitting || (mutationBusy && !isRemoveLoading)} disabled={isRemoveLoading} onPress={() => { Keyboard.dismiss(); handleSubmit(); }} />
                  </View>
                  <Pressable onPress={Keyboard.dismiss} style={styles.keyboardButton}
                    accessibilityRole="button" accessibilityLabel="Masquer le clavier">
                    <Text style={styles.keyboardButtonText}>Masquer le clavier</Text>
                  </Pressable>
                </ScrollView>
              </View>
            </TouchableWithoutFeedback>
          </KeyboardAvoidingView>
          {mutating ? <LoadingOverlay /> : null}
          {httpError ? <ErrorOverlay onDismiss={dismissHttpError} /> : null}
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
