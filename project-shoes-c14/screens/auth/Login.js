import { useDispatch } from "react-redux";
import { setUserId } from "../../store/slices/userSlice";
import { useEffect, useRef } from "react";
import { useLazyGetUserQuery } from "../../store/api/userApi";
import AuthForm from "./components/AuthForm";

export default function Login({ navigation }) {
  const dispatch = useDispatch();
  const [getUser, { isFetching }] = useLazyGetUserQuery();
  const mounted = useRef(true);
  useEffect(() => { mounted.current = true; return () => { mounted.current = false; }; }, []);
  const navigateToSignup = () => { navigation.replace("Signup"); };
  async function submitFormHandler({ email }) {
    const user = await getUser({ email }).unwrap();
    if (!user?.id) throw new Error("Aucun profil correspondant.");
    if (mounted.current) {
      dispatch(setUserId(user.id));
      navigation.replace("DrawerNavigator");
    }
  }
  return <AuthForm loginScreen navigate={navigateToSignup} submitFormHandler={submitFormHandler} isLoading={isFetching} />;
}
