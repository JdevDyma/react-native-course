import { getCartImage } from "../../../lib/cart";
import { View, StyleSheet, Image, Pressable, useWindowDimensions } from "react-native";
import { Ionicons } from "@react-native-vector-icons/ionicons";
import TextBoldL from "../../../ui-components/texts/TextBoldL";
import TextBoldXL from "../../../ui-components/texts/TextBoldXL";
import TextBoldM from "../../../ui-components/texts/TextBoldM";
import { ICON_SIZE } from "../../../constants/sizes";
import { colors } from "../../../constants/colors";
import { spaces } from "../../../constants/spaces";
import { radius } from "../../../constants/radius";

export default function ListItem({ item, removeShoesFromCart, updateQuantity, busy = false }) {
  const canDecrease = !busy && item.quantity > 1;
  const image = getCartImage(item);
  const decreaseShoesQuantity = () => { if (canDecrease) void updateQuantity(item.id, false); };
  const increaseShoesQuantity = () => { if (!busy) void updateQuantity(item.id, true); };
  const removeShoes = () => { if (!busy) void removeShoesFromCart(item.id); };
  const { width, fontScale } = useWindowDimensions();
  const compact = width < 360 || fontScale >= 1.5;
  return (
    <View style={[styles.container, compact && styles.compact]}>
      <View style={[styles.leftContainer, compact && styles.compact]}>
        <View style={styles.imageContainer}>
          {image != null ? <Image source={image} style={styles.image} resizeMode="contain"
            accessibilityLabel={`${item.name}, variante choisie`} accessible /> :
            <TextBoldM>Image indisponible</TextBoldM>}
        </View>
        <View style={styles.columnContainer}>
          <TextBoldL>{item.name}</TextBoldL>
          <TextBoldL>{item.price} €</TextBoldL>
          <View style={styles.quantityContainer}>
            <Pressable onPress={decreaseShoesQuantity} disabled={!canDecrease} accessibilityRole="button"
              accessibilityLabel={`Diminuer la quantité de ${item.name}, taille ${item.size}`}
              accessibilityState={{ disabled: !canDecrease }}
              style={[styles.operationSignContainer, styles.subtractSignContainer, !canDecrease && styles.disabled]}>
              <TextBoldXL>-</TextBoldXL>
            </Pressable>
            <TextBoldM accessibilityLabel={`Quantité : ${item.quantity}`}>
              {item.quantity}
            </TextBoldM>
            <Pressable onPress={increaseShoesQuantity} disabled={busy} accessibilityState={{ disabled: busy }} accessibilityRole="button"
              accessibilityLabel={`Augmenter la quantité de ${item.name}, taille ${item.size}`}
              style={[styles.operationSignContainer, styles.addSignContainer]}>
              <TextBoldXL style={styles.plusText}>+</TextBoldXL>
            </Pressable>
          </View>
        </View>
      </View>
      <View style={[styles.rightContainer, compact && styles.compactMeta]}>
        <TextBoldL>Taille {item.size}</TextBoldL>
        <Pressable onPress={removeShoes} disabled={busy} accessibilityState={{ disabled: busy }} accessibilityRole="button"
          accessibilityLabel={`Retirer ${item.name}, taille ${item.size}, du panier`}
          style={styles.operationSignContainer}>
          <Ionicons name="trash-outline" size={ICON_SIZE} color={colors.GREY} accessible={false} />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flexDirection: "row", flexWrap: "wrap", width: "100%", minHeight: 140,
    gap: spaces.S, paddingVertical: spaces.S, paddingHorizontal: spaces.S },
  leftContainer: { flex: 1, flexBasis: 220, flexDirection: "row", gap: spaces.M },
  imageContainer: { width: 88, height: 112, backgroundColor: colors.WHITE,
    borderRadius: radius.REGULAR, overflow: "hidden" },
  image: { width: 88, height: 112,
    transform: [{ rotate: "-20deg" }, { translateX: -spaces.XS }, { translateY: -spaces.XS }] },
  columnContainer: { flex: 1, minWidth: 0, justifyContent: "space-between", gap: spaces.S },
  quantityContainer: { flexDirection: "row", flexWrap: "wrap", alignItems: "center", gap: spaces.S },
  operationSignContainer: { minWidth: 48, minHeight: 48, padding: spaces.XS,
    borderRadius: radius.FULL, justifyContent: "center", alignItems: "center" },
  subtractSignContainer: { backgroundColor: colors.WHITE },
  addSignContainer: { backgroundColor: colors.BLUE },
  plusText: { color: colors.WHITE },
  rightContainer: { justifyContent: "space-between", alignItems: "center", gap: spaces.S },
  compact: { flexDirection: "column", flexBasis: "auto" },
  compactMeta: { flexDirection: "row", justifyContent: "space-between" },
  disabled: { opacity: 0.6 },
});
