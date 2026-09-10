import { useState } from "react";
import { FlatList, StyleSheet, View, useWindowDimensions } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import useUserProfile from "../../hooks/useUserProfile";
import UserProfileStatus from "../../ui-components/UserProfileStatus";
import { removeCartLine, changeCartQuantity } from "../../lib/cart";
import ListItem from "./components/ListItem";
import SkeletonCartRow from "./components/SkeletonCartRow";
import SkeletonPriceSummary from "./components/SkeletonPriceSummary";
import { spaces } from "../../constants/spaces";
import { colors } from "../../constants/colors";
import { radius } from "../../constants/radius";
import TextBoldL from "../../ui-components/texts/TextBoldL";
import TextBoldXL from "../../ui-components/texts/TextBoldXL";
import PaymentButton from "./components/PaymentButton";
import ItemSeparator from "../../ui-components/separators/ListItemSeparator";

const placeholderList = Array.from({ length: 3 }, (_, index) => ({ id: `loading-${index}` }));

function Separator() {
  return <ItemSeparator height={spaces.L} />;
}

function PriceSummary({ totalAmount, profile, onBusyChange }) {
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
      <PaymentButton profile={profile} onBusyChange={onBusyChange} />
    </View>
  );
}

export default function Cart() {
  const profile = useUserProfile();
  const [paymentBusy, setPaymentBusy] = useState(false);
  const initialLoading = Boolean(profile.userId && profile.user === undefined &&
    profile.isFetching && !profile.message);
  const { shoes, totalAmount } = profile.user?.cart ?? { shoes: [], totalAmount: 0 };
  const removeShoesFromCart = (id) => !paymentBusy && profile.writeProfile((user) => ({ cart: removeCartLine(user.cart, id) }));
  const updateQuantity = (id, increase) => !paymentBusy && profile.writeProfile((user) => ({ cart: changeCartQuantity(user.cart, id, increase) }));
  const insets = useSafeAreaInsets();
  const { width, fontScale } = useWindowDimensions();
  const availableWidth = width - insets.left - insets.right;
  const numColumns = availableWidth >= 900 && fontScale < 1.3 ? 2 : 1;
  return (
    <View style={[styles.container, { paddingLeft: insets.left, paddingRight: insets.right }]}>
      <FlatList
        key={numColumns}
        data={initialLoading ? placeholderList : shoes}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={{ flex: 1 / numColumns }}>
            {initialLoading ? <SkeletonCartRow /> : <ListItem item={item}
              removeShoesFromCart={removeShoesFromCart} updateQuantity={updateQuantity} busy={!profile.canWrite || paymentBusy} />}
          </View>
        )}
        numColumns={numColumns}
        ItemSeparatorComponent={Separator}
        ListHeaderComponent={<UserProfileStatus profile={profile} />}
        ListEmptyComponent={profile.user && !profile.busy && !profile.message ?
          <View style={styles.listEmptyContainer}>
            <TextBoldL style={styles.emptyText}>Votre panier est vide</TextBoldL>
          </View> : null
        }
        ListFooterComponent={initialLoading ? <SkeletonPriceSummary /> :
          profile.user ? <PriceSummary totalAmount={totalAmount} profile={profile} onBusyChange={setPaymentBusy} /> : null}
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
