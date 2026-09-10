import AuthForm from "./components/AuthForm";
import useAuthenticateWithProfile from "../../hooks/useAuthenticateWithProfile";

export default function Signup({ navigation }) {
  const flow = useAuthenticateWithProfile("signUp", () => navigation.replace("Login"));
  return <AuthForm navigate={() => navigation.replace("Login")} {...flow} />;
}
