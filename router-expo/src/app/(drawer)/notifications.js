import { Drawer } from "expo-router/drawer";
import { colors } from "../../constants/colors";
import { CustomLink } from "../../components/CustomButtons";
import { CustomView } from "../../components/CustomView";
import { Title } from "../../components/Title";

export default function NotificationsPage() {
  return (
    <CustomView>
      <Drawer.Screen options={{
        headerTitleStyle: { color: colors.primary },
        title: "Notifications Push",
      }} />
      <Title text="Vos notifications" />
      <CustomLink href="/articles/new-54" text="De nouveaux articles sont disponibles" />
      <CustomLink href="/" text="Revenir à l’accueil" />
    </CustomView>
  );
}
