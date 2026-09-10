import { useDispatch } from "react-redux";
import { setUserId } from "../../store/slices/userSlice";
import { useEffect, useRef } from "react";
import { useCreateUserMutation } from "../../store/api/userApi";
import AuthForm from "./components/AuthForm";

export default function Signup({ navigation }) {
  const dispatch = useDispatch();
  const [createUser, { isLoading }] = useCreateUserMutation();
  const mounted = useRef(true);
  useEffect(() => { mounted.current = true; return () => { mounted.current = false; }; }, []);
  const navigateToLogin = () => { navigation.replace("Login"); };
  async function submitFormHandler({ email }) {
    const user = await createUser({ email }).unwrap();
    if (!user?.id) throw new Error("Aucun profil correspondant.");
    if (mounted.current) {
      dispatch(setUserId(user.id));
      navigation.replace("DrawerNavigator");
    }
  }
  return <AuthForm navigate={navigateToLogin} submitFormHandler={submitFormHandler} isLoading={isLoading} />;
}
