import AuthForm from "./components/AuthForm";
import useAuthenticateWithProfile from "../../hooks/useAuthenticateWithProfile";

export default function Login({ navigation }) {
  const flow = useAuthenticateWithProfile("signInWithPassword", () => navigation.replace("Login"));
  return <AuthForm loginScreen navigate={() => navigation.replace("Signup")} {...flow} />;
}
