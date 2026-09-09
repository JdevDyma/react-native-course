import { useState } from "react";
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
  const insets = useSafeAreaInsets();
  const items = (Array.isArray(data?.items) ? data.items : []).filter((item) => item?.image != null);
  const [selectedVariantIndex, setSelectedVariantIndex] = useState(0);
  const [selectedSize, setSelectedSize] = useState(null);
  const selectedVariant = items[selectedVariantIndex];
  const selectedImage = selectedVariant?.image;
  const sizes = Array.isArray(selectedVariant?.sizes) ? selectedVariant.sizes : [];
  const images = items.map((item) => item.image);

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
            <DetailsDescription name={data.name} price={data.price} description={data.description} />
            <Gallery images={images} selectedIndex={selectedVariantIndex} onSelect={selectVariant} />
            <Sizes sizes={sizes} selectedSize={selectedSize} setSelectedSize={setSelectedSize} />
            <View style={styles.btnContainer}>
              <CustomButton text="Ajouter au panier"
                onPress={() => console.log("ajouter au panier")} />
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
