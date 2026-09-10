import { useEffect, useRef } from "react";
import { Keyboard, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { Formik } from "formik";
import * as Yup from "yup";
import Input from "../shared/Input";
import ErrorModal from "../shared/ErrorModal";
import CustomBtn from "../modal/CustomBtn";
import { colors } from "../../constants/colors";

export default function AuthForm({ loginScreen = false, navigate, submitFormHandler, isLoading = false, httpError, setHttpError }) {
  const initialValues = loginScreen ? { email: "", password: "" } : { email: "", password: "", confirmPassword: "" };
  const validationSchema = Yup.object({
    email: Yup.string().trim().email("L’email est incorrect").required("L’email est obligatoire"),
    password: Yup.string().min(6, "Le mot de passe doit contenir au moins six caractères").required("Le mot de passe est obligatoire"),
    ...(!loginScreen ? { confirmPassword: Yup.string().oneOf([Yup.ref("password")], "Les mots de passe ne correspondent pas").required("Confirmez le mot de passe") } : {}),
  });
  const pending = useRef(false);
  const mounted = useRef(true);
  useEffect(() => { mounted.current = true; return () => { mounted.current = false; }; }, []);
  async function onSubmit(values, { setStatus }) {
    if (pending.current) return;
    pending.current = true;
    Keyboard.dismiss();
    setStatus(undefined);
    try {
      if (typeof submitFormHandler !== "function") throw new Error("Action indisponible.");
      const message = await submitFormHandler({ email: values.email.trim(), password: values.password });
      if (mounted.current && typeof message === "string") setStatus({ message });
    } catch {
      if (mounted.current) setStatus({ message: "L’opération n’a pas abouti. Réessayez ultérieurement." });
    } finally {
      pending.current = false;
    }
  }
  return (
    <Formik key={loginScreen ? "login" : "signup"} initialValues={initialValues} validationSchema={validationSchema} onSubmit={onSubmit}>
      {(formik) => <AuthFields {...formik} loginScreen={loginScreen} navigate={navigate} isLoading={isLoading} httpError={httpError} setHttpError={setHttpError} />}
    </Formik>
  );
}

function AuthFields({ values, errors, touched, handleChange, handleBlur, handleSubmit, status, setStatus,
  isSubmitting, isValidating, submitCount, loginScreen, navigate, isLoading, httpError, setHttpError }) {
  const handledAttempt = useRef(0);
  useEffect(() => {
    if (submitCount === 0) { handledAttempt.current = 0; return; }
    if (isSubmitting || isValidating || submitCount <= handledAttempt.current) return;
    handledAttempt.current = submitCount;
    if (Object.keys(errors).length) setStatus({ validationError: true });
  }, [submitCount, isSubmitting, isValidating, errors, setStatus]);
  const removeErrors = () => {
    setStatus(undefined);
    setHttpError(undefined);
  };
  const busy = isSubmitting || isLoading;
  const fields = [
    { name: "email", label: "Email", inputMode: "email", autoComplete: "email" },
    { name: "password", label: "Mot de passe", type: "password", autoComplete: loginScreen ? "current-password" : "new-password" },
    ...(!loginScreen ? [{ name: "confirmPassword", label: "Confirmation du mot de passe", type: "password", autoComplete: "new-password" }] : []),
  ];
  return (
    <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === "ios" ? "padding" : "height"}>
      <ScrollView contentContainerStyle={styles.formContainer} keyboardShouldPersistTaps="handled" keyboardDismissMode="on-drag">
        <Text style={styles.title} accessibilityRole="header">{loginScreen ? "Connexion" : "Inscription"}</Text>
        <View>
          {fields.map(({ name, ...props }) => <Input key={name} {...props} maxLength={name === "email" ? 254 : 128}
            value={values[name]} editable={!busy} onChangeText={(value) => { removeErrors(); handleChange(name)(value); }}
            onBlur={handleBlur(name)} error={Boolean(errors[name] && touched[name])} autoCapitalize="none" autoCorrect={false} />)}
          <View style={styles.btnContainer}>
            <CustomBtn text="Valider" color={colors.VIOLET} onPress={() => handleSubmit()} isLoading={busy} disabled={busy} />
          </View>
          {status?.message ? <Text style={styles.switchAuthText} accessibilityRole="alert">{status.message}</Text> : null}
        </View>
        <Pressable disabled={busy || typeof navigate !== "function"} accessibilityRole="button"
          accessibilityState={{ disabled: busy || typeof navigate !== "function" }}
          onPress={() => { if (!busy && typeof navigate === "function") { Keyboard.dismiss(); navigate(); } }}
          style={styles.switchAuthContainer}>
          <Text style={styles.switchAuthText}>{loginScreen ? "Vous n’avez pas encore de compte ? " : "Vous avez déjà un compte ? "}</Text>
          <Text style={[styles.switchAuthText, styles.textBold]}>{loginScreen ? "Inscrivez-vous" : "Connectez-vous"}</Text>
        </Pressable>
      </ScrollView>
      <ErrorModal isModalVisible={Boolean(httpError) || status?.validationError === true} closeModal={removeErrors} errors={httpError || errors} />
    </KeyboardAvoidingView>
  );
}
const styles = StyleSheet.create({
  flex: { flex: 1 },
  formContainer: { flexGrow: 1, width: "100%", maxWidth: 640, alignSelf: "center", padding: 24, backgroundColor: colors.DARK, justifyContent: "space-evenly" },
  title: { color: colors.LIGHT, textAlign: "center", fontWeight: "800", fontSize: 24, marginBottom: 24 },
  btnContainer: { alignItems: "stretch", marginVertical: 16 },
  switchAuthContainer: { flexDirection: "row", flexWrap: "wrap", justifyContent: "center", marginTop: 32, minHeight: 48, alignItems: "center" },
  switchAuthText: { color: colors.LIGHT, textAlign: "center" },
  textBold: { fontWeight: "700" },
});
