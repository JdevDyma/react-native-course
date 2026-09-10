import { useEffect, useRef, useState } from "react";
import { Animated, Image, Pressable, StyleSheet } from "react-native";
import { getCardPosition } from "../layout";

export default function Card({ index, layout, shouldDistribute, card, onPressCard,
  isFlipped = false, isCleared = false, disabled = false, restartFromLeft = false }) {
  const animatedLeft = useRef(new Animated.Value(layout.centerX)).current;
  const animatedTop = useRef(new Animated.Value(layout.centerY)).current;
  const animatedRotation = useRef(new Animated.Value(0)).current;
  const animatedOpacity = useRef(new Animated.Value(1)).current;
  const [distributed, setDistributed] = useState(false);
  useEffect(() => {
    let current = true;
    setDistributed(false);
    animatedLeft.setValue(restartFromLeft ? -layout.cardWidth : layout.centerX);
    animatedTop.setValue(layout.centerY);
    if (!shouldDistribute) return () => { current = false; };
    const target = getCardPosition(index, layout);
    const animation = Animated.parallel([
      Animated.timing(animatedLeft, { toValue: target.x, duration: 1000, delay: index * 100, useNativeDriver: true }),
      Animated.timing(animatedTop, { toValue: target.y, duration: 1000, delay: index * 100, useNativeDriver: true }),
    ]);
    animation.start(({ finished }) => { if (finished && current) setDistributed(true); });
    return () => { current = false; animation.stop(); };
  }, [index, layout, shouldDistribute, restartFromLeft, animatedLeft, animatedTop]);
  useEffect(() => {
    const animation = Animated.parallel([
      Animated.timing(animatedRotation, { toValue: isFlipped || isCleared ? 1 : 0, duration: 500, useNativeDriver: true }),
      Animated.timing(animatedOpacity, { toValue: isCleared ? 0 : 1, duration: 500, useNativeDriver: true }),
    ]);
    animation.start();
    return () => animation.stop();
  }, [isFlipped, isCleared, animatedRotation, animatedOpacity]);
  const spin = animatedRotation.interpolate({ inputRange: [0, 1], outputRange: ["0deg", "180deg"] });
  const reversedSpin = animatedRotation.interpolate({ inputRange: [0, 1], outputRange: ["180deg", "0deg"] });
  const blocked = disabled || !distributed || isFlipped || isCleared;
  return (
    <Animated.View style={[styles.container, { width: layout.cardWidth, height: layout.cardHeight,
      opacity: animatedOpacity, transform: [{ translateX: animatedLeft }, { translateY: animatedTop }] }]}>
      <Pressable style={styles.cardContainer} disabled={blocked}
        onPress={() => { if (!blocked) onPressCard(card); }} accessibilityRole="button"
        accessibilityLabel={isFlipped ? `Carte ${index + 1}, ${card.type}` : `Carte ${index + 1}, face cachée`}
        accessibilityState={{ disabled: blocked }} accessible={!isCleared}
        importantForAccessibility={isCleared ? "no-hide-descendants" : "auto"}>
        <Animated.View pointerEvents="none" style={[styles.card, styles.backCard,
          { transform: [{ perspective: 1000 }, { rotateY: spin }] }]}>
          <Image accessible={false} source={require("../assets/pokeball.png")} style={styles.image} />
        </Animated.View>
        <Animated.View pointerEvents="none" style={[styles.card, styles.frontCard,
          { transform: [{ perspective: 1000 }, { rotateY: reversedSpin }] }]}>
          <Image accessible={false} source={card.source} style={styles.image} />
        </Animated.View>
      </Pressable>
    </Animated.View>
  );
}
const styles = StyleSheet.create({
  container: { position: "absolute", left: 0, top: 0 },
  cardContainer: { width: "100%", height: "100%" },
  card: { position: "absolute", width: "100%", height: "100%", borderRadius: 8, backfaceVisibility: "hidden" },
  frontCard: { backgroundColor: "coral" },
  backCard: { backgroundColor: "powderblue" },
  image: { width: "100%", height: "100%", resizeMode: "contain" },
});
