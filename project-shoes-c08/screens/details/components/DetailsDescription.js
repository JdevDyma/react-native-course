import { StyleSheet, View } from "react-native";
import TextMediumM from "../../../ui-components/texts/TextMediumM";
import TextBoldXL from "../../../ui-components/texts/TextBoldXL";
import TextBoldL from "../../../ui-components/texts/TextBoldL";
import { spaces } from "../../../constants/spaces";
import { colors } from "../../../constants/colors";

export default function DetailsDescription({ name, price, description }) {
  return (
    <View style={styles.container}>
      <TextMediumM blue style={styles.spacing}>MEILLEUR CHOIX</TextMediumM>
      <TextBoldXL style={styles.spacing}>{name}</TextBoldXL>
      <TextBoldL style={styles.spacing}>{price} €</TextBoldL>
      <TextMediumM style={styles.description}>{description}</TextMediumM>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { paddingHorizontal: spaces.L },
  spacing: { marginBottom: spaces.S },
  description: { color: colors.GREY },
});
