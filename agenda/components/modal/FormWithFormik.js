import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
  Keyboard,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { colors } from "../../constants/colors";
import Input from "./Input";
import DateTimePicker from "./DateTimePicker";
import { useState, useEffect, useId } from "react";
import { useDispatch, useSelector } from "react-redux";
import IsOnline from "./IsOnline";
import CustomBtn from "./CustomBtn";
import ErrorModal from "./ErrorModal";
import {
  addEvent,
  removeEvent,
  updateEvent,
} from "../../store/slices/agendaSlice";
import { Formik } from "formik";
import * as Yup from "yup";

export default function FormWithFormik({
  isFormVisible,
  closeForm,
  selectedEvent,
}) {
  const closeKeyboardHandler = () => Keyboard.dismiss();
  const event = useSelector((state) =>
    state.agenda.events.find((event) => event.id === selectedEvent)
  );

  const initialState = event
    ? event
    : {
        title: "",
        location: "",
        phoneNumber: "",
        description: "",
        startDate: new Date(),
        endDate: new Date(),
        isOnline: false,
      };

  const validationSchema = Yup.object().shape({
    title: Yup.string().required("Le titre est obligatoire"),
    location: Yup.string().when("isOnline", {
      is: true,
      then: (schema) => schema.url("L'url est invalide").notRequired(),
      otherwise: (schema) => schema.notRequired(),
    }),
    phoneNumber: Yup.string().matches(/^[0-9]\d{9}$/, {
      message: "Le numéro de téléphone est invalide",
    }),
    startDate: Yup.date(),
    endDate: Yup.date().min(
      Yup.ref("startDate"),
      "La fin d l'événement doit être après le début"
    ),
    isOnline: Yup.boolean(),
  });

  const dispatch = useDispatch();

  const onSubmit = (values) => {
    const data = {
      title: values.title,
      location: values.location,
      phoneNumber: values.phoneNumber,
      description: values.description,
      startDate: new Date(values.startDate).toUTCString(),
      endDate: new Date(values.endDate).toUTCString(),
      isOnline: values.isOnline,
    };
    if (event?.id) {
      data.id = event.id;
      dispatch(updateEvent(data));
    } else {
      data.id = Date.now().toString();
      dispatch(addEvent(data));
    }
    closeForm();
  };

  const removeEvt = () => {
    if (event) {
      dispatch(removeEvent({ id: event.id }));
    }
    closeFormHandler();
  };

  const closeFormHandler = () => {
    closeForm();
  };

  return (
    <Modal
      visible={isFormVisible}
      presentationStyle="formSheet"
      animationType="slide"
    >
      <Pressable style={styles.formContainer} onPress={closeKeyboardHandler}>
        <View style={styles.headerContainer}>
          <Text style={styles.formTitle}>Nouvel événement</Text>
          <Feather
            name="trash-2"
            size={28}
            color={colors.LIGHT}
            onPress={removeEvt}
            suppressHighlighting={true}
          />
        </View>
        <Formik
          initialValues={initialState}
          onSubmit={onSubmit}
          validationSchema={validationSchema}
        >
          {({
            values,
            handleChange,
            setFieldValue,
            handleSubmit,
            errors,
            touched,
            status,
            setStatus,
            isSubmitting,
          }) => {
            if (
              isSubmitting &&
              Object.keys(errors).length &&
              status !== "error"
            ) {
              setStatus("error");
            }
            return (
              <>
                <Input
                  label="Titre"
                  autoCorrect={false}
                  maxLength={40}
                  value={values.title}
                  onChangeText={handleChange("title")}
                  error={errors.title && touched.title}
                />
                <Input
                  label={values.isOnline ? "Url" : "Lieu"}
                  inputMode={values.isOnline ? "url" : "text"}
                  autoCorrect={false}
                  maxLength={40}
                  value={values.location}
                  onChangeText={handleChange("location")}
                  error={errors.location && touched.location}
                />
                <Input
                  label="Téléphone"
                  inputMode="tel"
                  maxLength={10}
                  value={values.phoneNumber}
                  onChangeText={handleChange("phoneNumber")}
                  error={errors.phoneNumber && touched.phoneNumber}
                />
                <Input
                  label="Description"
                  multiline
                  maxLength={120}
                  value={values.description}
                  onChangeText={handleChange("description")}
                />
                <DateTimePicker
                  label="Début"
                  dateTime={values.startDate}
                  setDateTime={(date) => setFieldValue("startDate", date)}
                />
                <DateTimePicker
                  label="Fin"
                  dateTime={values.endDate}
                  setDateTime={(date) => setFieldValue("endDate", date)}
                  error={errors.endDate}
                />
                <IsOnline
                  isEnabled={values.isOnline}
                  setIsEnabled={(value) => setFieldValue("isOnline", value)}
                />
                <View style={styles.btnContainer}>
                  <CustomBtn
                    text="Annuler"
                    color={colors.PINK}
                    onPress={closeFormHandler}
                  />
                  <CustomBtn
                    text="Valider"
                    color={colors.VIOLET}
                    onPress={handleSubmit}
                  />
                </View>
                <ErrorModal
                  isModalVisible={status === "error"}
                  closeModal={setStatus}
                  errors={errors}
                />
              </>
            );
          }}
        </Formik>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  formContainer: {
    flex: 1,
    padding: 24,
    backgroundColor: colors.DARK,
  },
  headerContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  formTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: colors.VIOLET,
  },
  btnContainer: {
    flexDirection: "row",
    justifyContent: "space-evenly",
  },
});