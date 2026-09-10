import { useEffect, useRef } from "react";
import { Keyboard, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import { Formik } from "formik";
import * as Yup from "yup";
import { colors } from "../../../constants/colors";
import { spaces } from "../../../constants/spaces";
import Input from "../../../ui-components/inputs/Input";
import CustomButton from "../../../ui-components/buttons/CustomButton";
import TextMediumM from "../../../ui-components/texts/TextMediumM";
import TextBoldM from "../../../ui-components/texts/TextBoldM";

export default function AuthForm({ loginScreen = false, navigate, submitFormHandler, isLoading = false, profileStep = null, retryProfile, cancelProfile }) {
  const initialValues = loginScreen
    ? { email: "", password: "" }
    : { email: "", password: "", confirmPassword: "" };
  const confirmPasswordRule = loginScreen ? {} : {
    confirmPassword: Yup.string().oneOf([Yup.ref("password")], "Les mots de passe ne correspondent pas").required("Confirmez le mot de passe"),
  };
  const validationSchema = Yup.object({
    email: Yup.string().trim().email("L’email est incorrect").required("L’email est obligatoire"),
    password: Yup.string().min(6, "Le mot de passe doit contenir au moins six caractères").required("Le mot de passe est obligatoire"),
    ...confirmPasswordRule,
  });
  const fields = [
    { name: "email", label: "Email", inputMode: "email", autoComplete: "email" },
    { name: "password", label: "Mot de passe", type: "password", autoComplete: loginScreen ? "current-password" : "new-password" },
    ...(!loginScreen ? [{ name: "confirmPassword", label: "Confirmation du mot de passe", type: "password", autoComplete: "new-password" }] : []),
  ];
  const headerHeight = useHeaderHeight();
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
      await submitFormHandler({ email: values.email.trim(), password: values.password });
    } catch {
      if (mounted.current) setStatus("L’authentification n’a pas été confirmée. Vérifiez vos identifiants et la connexion avant de réessayer.");
    } finally {
      pending.current = false;
    }
  }
  return (
    <SafeAreaView edges={["left", "right", "bottom"]} style={styles.screen}>
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? headerHeight : 0}>
        <ScrollView contentContainerStyle={styles.formContainer} keyboardShouldPersistTaps="handled" keyboardDismissMode="on-drag">
          {profileStep ? <View>
            <TextBoldM>{profileStep === "reauthenticate" ? "Reconnectez-vous pour terminer le profil." :
              profileStep === "storage" ? "Le profil est confirmé. Terminez l’enregistrement local de la session." :
              "L’authentification a réussi. Confirmez maintenant le profil."}</TextBoldM>
            <CustomButton text={profileStep === "reauthenticate" ? "Se reconnecter" : profileStep === "storage" ? "Réessayer l’enregistrement local" : "Reprendre la confirmation du profil"}
              isLoading={isLoading} disabled={isLoading} onPress={retryProfile} />
            <CustomButton text="Annuler" disabled={isLoading} onPress={cancelProfile} />
          </View> : <Formik key={loginScreen ? "login" : "signup"} initialValues={initialValues} validationSchema={validationSchema} onSubmit={onSubmit}>
            {({ values, handleChange, handleBlur, handleSubmit, errors, touched, isSubmitting, status, setStatus }) => (
              <>
                {fields.map(({ name, ...props }) => <Input key={name} {...props}
                  maxLength={name === "email" ? 254 : 128} value={values[name]}
                  onChangeText={(value) => { setStatus(undefined); handleChange(name)(value); }}
                  onBlur={handleBlur(name)} error={Boolean(errors[name] && touched[name])}
                  errorText={errors[name]} editable={!isSubmitting && !isLoading}
                  autoCapitalize="none" autoCorrect={false} />)}
                <CustomButton text="Valider" isLoading={isSubmitting || isLoading} disabled={isSubmitting || isLoading} onPress={() => handleSubmit()} />
                {status ? <TextMediumM accessibilityRole="alert" style={styles.status}>{status}</TextMediumM> : null}
                <Pressable disabled={isSubmitting || isLoading || typeof navigate !== "function"}
                  accessibilityRole="button" accessibilityState={{ disabled: isSubmitting || isLoading || typeof navigate !== "function" }}
                  onPress={() => { if (!isSubmitting && !isLoading && typeof navigate === "function") { Keyboard.dismiss(); navigate(); } }}
                  style={styles.switchAuthContainer}>
                  <TextMediumM>{loginScreen ? "Vous n’avez pas encore de compte ? " : "Vous avez déjà un compte ? "}</TextMediumM>
                  <TextBoldM>{loginScreen ? "Inscrivez-vous" : "Connectez-vous"}</TextBoldM>
                </Pressable>
              </>
            )}
          </Formik>}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
const styles = StyleSheet.create({
  flex: { flex: 1 },
  screen: { flex: 1, backgroundColor: colors.LIGHT },
  formContainer: { flexGrow: 1, justifyContent: "center", padding: spaces.L, width: "100%", maxWidth: 640, alignSelf: "center" },
  switchAuthContainer: { flexDirection: "row", flexWrap: "wrap", justifyContent: "center", marginTop: spaces.XL, minHeight: 48 },
  status: { marginTop: spaces.M, color: colors.DARK },
});
