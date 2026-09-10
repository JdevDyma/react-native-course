import ProfilePicture from "./ProfilePicture";
import { useEffect, useRef } from "react";
import { Keyboard, KeyboardAvoidingView, Platform, ScrollView, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import { Formik } from "formik";
import * as Yup from "yup";
import CustomButton from "../../../ui-components/buttons/CustomButton";
import Input from "../../../ui-components/inputs/Input";
import TextMediumM from "../../../ui-components/texts/TextMediumM";
import { spaces } from "../../../constants/spaces";
import { colors } from "../../../constants/colors";

const validationSchema = Yup.object({
  fullName: Yup.string().trim().max(60, "Le nom est trop long").required("Le nom est obligatoire"),
  location: Yup.object({
    street: Yup.string().trim().max(120, "L’adresse est trop longue").required("L’adresse est obligatoire"),
    postalCode: Yup.string().matches(/^[0-9]{5}$/, "Saisissez cinq chiffres").required("Le code postal est obligatoire"),
    city: Yup.string().trim().max(90, "La ville est trop longue").required("La ville est obligatoire"),
  }),
});

export default function ProfileForm({ user, submitFormHandler, image, setImage, isLoading = false }) {
  const headerHeight = useHeaderHeight();
  const mounted = useRef(true);
  const pending = useRef(false);
  useEffect(() => { mounted.current = true; return () => { mounted.current = false; }; }, []);
  const initialValues = {
    email: user.email ?? "",
    fullName: user.fullName ?? "",
    location: {
      street: user.location?.street ?? "",
      postalCode: user.location?.postalCode ?? "",
      city: user.location?.city ?? "",
    },
  };
  async function onSubmit(values, { setStatus, resetForm }) {
    if (pending.current) return;
    pending.current = true;
    Keyboard.dismiss();
    setStatus(undefined);
    const patch = {
      fullName: values.fullName.trim(),
      location: {
        street: values.location.street.trim(),
        postalCode: values.location.postalCode,
        city: values.location.city.trim(),
      },
    };
    try {
      await submitFormHandler(patch);
      if (mounted.current) {
        resetForm({ values: { email: values.email, ...patch } });
        setStatus("Le profil de démonstration a été enregistré.");
      }
    } catch {
      if (mounted.current) setStatus("L’enregistrement n’a pas été confirmé. Votre saisie est conservée.");
    } finally {
      pending.current = false;
    }
  }
  return (
    <SafeAreaView edges={["left", "right"]} style={styles.screen}>
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? headerHeight : 0}>
        <ScrollView contentContainerStyle={styles.formContainer}
          keyboardShouldPersistTaps="handled" keyboardDismissMode="on-drag">
          <Formik initialValues={initialValues} validationSchema={validationSchema} onSubmit={onSubmit}>
            {({ values, errors, touched, handleChange, handleBlur, handleSubmit, isSubmitting, status, setStatus }) => {
              const blocked = isLoading || isSubmitting;
              const change = (name) => (value) => { setStatus(undefined); handleChange(name)(value); };
              return <>
                <ProfilePicture image={image} setImage={setImage} disabled={blocked} />
                <Input label="Nom complet" maxLength={60} value={values.fullName}
                  onChangeText={change("fullName")} onBlur={handleBlur("fullName")}
                  error={Boolean(errors.fullName && touched.fullName)} errorText={errors.fullName}
                  autoCapitalize="words" editable={!blocked} />
                <Input label="Email" value={values.email} readOnly />
                <Input label="Numéro et nom de rue" maxLength={120} value={values.location.street}
                  onChangeText={change("location.street")} onBlur={handleBlur("location.street")}
                  error={Boolean(errors.location?.street && touched.location?.street)} errorText={errors.location?.street}
                  autoCapitalize="words" editable={!blocked} />
                <Input label="Code postal" maxLength={5} value={values.location.postalCode}
                  onChangeText={change("location.postalCode")} onBlur={handleBlur("location.postalCode")}
                  error={Boolean(errors.location?.postalCode && touched.location?.postalCode)} errorText={errors.location?.postalCode}
                  inputMode="numeric" editable={!blocked} />
                <Input label="Ville" maxLength={90} value={values.location.city}
                  onChangeText={change("location.city")} onBlur={handleBlur("location.city")}
                  error={Boolean(errors.location?.city && touched.location?.city)} errorText={errors.location?.city}
                  autoCapitalize="words" editable={!blocked} />
                <CustomButton text="Valider" onPress={() => handleSubmit()} isLoading={blocked} disabled={blocked} />
                {status ? <TextMediumM accessibilityRole="alert" style={styles.status}>{status}</TextMediumM> : null}
              </>;
            }}
          </Formik>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.LIGHT },
  flex: { flex: 1 },
  formContainer: { flexGrow: 1, paddingHorizontal: spaces.L, paddingVertical: spaces.XL,
    width: "100%", maxWidth: 640, alignSelf: "center", backgroundColor: colors.LIGHT },
  status: { marginTop: spaces.M, color: colors.DARK },
});
