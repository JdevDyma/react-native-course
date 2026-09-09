import { FlatList, StyleSheet, View, useWindowDimensions } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useSelector } from "react-redux";
import ListItem from "./components/ListItem";
import { spaces } from "../../constants/spaces";
import { colors } from "../../constants/colors";
import { radius } from "../../constants/radius";
import TextBoldL from "../../ui-components/texts/TextBoldL";
import TextBoldXL from "../../ui-components/texts/TextBoldXL";
import CustomButton from "../../ui-components/buttons/CustomButton";
import ItemSeparator from "../../ui-components/separators/ListItemSeparator";

function Separator() {
  return <ItemSeparator height={spaces.L} />;
}

function PriceSummary({ totalAmount }) {
  const shippingCost = Math.floor(totalAmount / 15);
  const grandTotal = totalAmount + shippingCost;
  return (
    <View style={styles.priceContainer}>
      <View style={styles.rowContainer}>
        <TextBoldXL>Sous-total</TextBoldXL>
        <TextBoldXL>{totalAmount} €</TextBoldXL>
      </View>
      <View style={styles.rowContainer}>
        <TextBoldXL>Frais de port</TextBoldXL>
        <TextBoldXL>{shippingCost} €</TextBoldXL>
      </View>
      <View style={styles.dashedLine} />
      <View style={styles.rowContainer}>
        <TextBoldXL>Total</TextBoldXL>
        <TextBoldXL>{grandTotal} €</TextBoldXL>
      </View>
      <CustomButton text="Passer la commande" disabled />
    </View>
  );
}

export default function Cart() {
  const { shoes, totalAmount } = useSelector((state) => state.cart);
  const insets = useSafeAreaInsets();
  const { width, fontScale } = useWindowDimensions();
  const availableWidth = width - insets.left - insets.right;
  const numColumns = availableWidth >= 900 && fontScale < 1.3 ? 2 : 1;
  return (
    <View style={[styles.container, { paddingLeft: insets.left, paddingRight: insets.right }]}>
      <FlatList
        key={numColumns}
        data={shoes}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={{ flex: 1 / numColumns }}><ListItem item={item} /></View>
        )}
        numColumns={numColumns}
        ItemSeparatorComponent={Separator}
        ListEmptyComponent={
          <View style={styles.listEmptyContainer}>
            <TextBoldL style={styles.emptyText}>Votre panier est vide</TextBoldL>
          </View>
        }
        ListFooterComponent={<PriceSummary totalAmount={totalAmount} />}
        ListFooterComponentStyle={styles.footer}
        contentContainerStyle={[styles.content, { paddingBottom: spaces.L + insets.bottom }]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.LIGHT },
  content: { flexGrow: 1, paddingTop: spaces.M, paddingBottom: spaces.L },
  listEmptyContainer: { minHeight: 200, justifyContent: "center", alignItems: "center", padding: spaces.L },
  emptyText: { textAlign: "center" },
  footer: { marginTop: "auto", paddingTop: spaces.L },
  priceContainer: { backgroundColor: colors.WHITE, borderTopLeftRadius: radius.REGULAR,
    borderTopRightRadius: radius.REGULAR, padding: spaces.L },
  rowContainer: { flexDirection: "row", flexWrap: "wrap", alignItems: "center",
    justifyContent: "space-between", gap: spaces.S, marginBottom: spaces.M },
  dashedLine: { borderStyle: "dashed", borderWidth: 1, borderColor: colors.GREY, marginBottom: spaces.M },
});
