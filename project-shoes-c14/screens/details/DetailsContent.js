import { useState } from "react";
import useUserProfile from "../../hooks/useUserProfile";
import UserProfileStatus from "../../ui-components/UserProfileStatus";
import { nanoid } from "@reduxjs/toolkit";
import { buildCart, createCartLine } from "../../lib/cart";
import { shoes } from "../../data/shoes";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import DetailsImage from "./components/DetailsImage";
import DetailsDescription from "./components/DetailsDescription";
import Gallery from "./components/Gallery";
import Sizes from "./components/Sizes";
import CustomButton from "../../ui-components/buttons/CustomButton";
import { colors } from "../../constants/colors";
import { spaces } from "../../constants/spaces";

export default function DetailsContent({ data }) {
  const profile = useUserProfile();
  const insets = useSafeAreaInsets();
  const items = Array.isArray(data?.items) ? data.items : [];
  const [selectedVariantIndex, setSelectedVariantIndex] = useState(0);
  const [requestedSize, setSelectedSize] = useState(null);
  const selectedVariant = items[selectedVariantIndex];
  const selectedImage = selectedVariant?.image;
  const sizes = Array.isArray(selectedVariant?.sizes) ? selectedVariant.sizes : [];
  const selectedSize = sizes.includes(requestedSize) ? requestedSize : (sizes[0] ?? null);
  const images = items.map((item) => item.image);
  const brand = shoes.find((group) => group.stock.some((shoe) => shoe.id === data?.id))?.brand ?? "";
  const canAddToCart = typeof data?.id === "string" && typeof data?.name === "string"
    && brand.length > 0 && selectedImage != null && selectedSize != null
    && sizes.includes(selectedSize) && Number.isFinite(data?.price) && data.price >= 0;

  async function addToCart() {
    if (!canAddToCart || !profile.canWrite) return;
    await profile.writeProfile((user) => {
      const line = createCartLine({ id: nanoid(), shoeId: data.id,
        variantIndex: selectedVariantIndex, size: selectedSize });
      return { cart: buildCart([...user.cart.shoes, line]) };
    });
  }

  function selectVariant(index) {
    if (!Number.isInteger(index) || !items[index] || index === selectedVariantIndex) return;
    setSelectedVariantIndex(index);
    setSelectedSize(null);
  }

  return (
    <View style={[styles.screen, { paddingLeft: insets.left, paddingRight: insets.right }]}>
      <ScrollView contentContainerStyle={[styles.content, { paddingBottom: spaces.L + insets.bottom }]}>
        {data ? (
          <>
            <DetailsImage source={selectedImage} name={data.name} />
            <DetailsDescription id={data.id} name={data.name} price={data.price} description={data.description} />
            <Gallery images={images} selectedIndex={selectedVariantIndex} onSelect={selectVariant} />
            <Sizes sizes={sizes} selectedSize={selectedSize} setSelectedSize={setSelectedSize} />
            {!canAddToCart && <Text style={styles.message}>Cette variante n’est pas disponible à l’ajout.</Text>}
            <View style={styles.btnContainer}>
              <CustomButton text="Ajouter au panier"
                onPress={addToCart} disabled={!canAddToCart || !profile.canWrite} isLoading={profile.isWriting} />
              <UserProfileStatus profile={profile} />
            </View>
          </>
        ) : (
          <Text style={styles.message}>Aucune chaussure à présenter.</Text>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.WHITE },
  content: { flexGrow: 1, paddingBottom: spaces.L },
  btnContainer: { width: "80%", maxWidth: 400, alignSelf: "center", marginVertical: spaces.XL },
  message: { padding: spaces.L, color: colors.DARK },
});
