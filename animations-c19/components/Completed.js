import { useEffect, useRef, useState } from "react";
import { Animated, Easing, Image, Pressable, StyleSheet, Text } from "react-native";

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export default function Completed({ isCompleted, handleRestart, layout }) {
  const animatedScale = useRef(new Animated.Value(0)).current;
  const animatedBtnScale = useRef(new Animated.Value(0)).current;
  const animationRef = useRef(null);
  const currentRef = useRef(false);
  const readyRef = useRef(false);
  const [canRestart, setCanRestart] = useState(false);

  useEffect(() => {
    currentRef.current = true;
    readyRef.current = false;
    setCanRestart(false);
    animatedScale.setValue(0);
    animatedBtnScale.setValue(0);
    let animation;
    if (isCompleted) {
      animation = Animated.sequence([
        Animated.timing(animatedScale, {
          duration: 500, toValue: 1, useNativeDriver: true,
          easing: Easing.elastic(5),
        }),
        Animated.timing(animatedBtnScale, {
          duration: 500, delay: 1000, toValue: 1, useNativeDriver: true,
          easing: Easing.bounce,
        }),
      ]);
      animationRef.current = animation;
      animation.start(({ finished }) => {
        if (finished && currentRef.current && animationRef.current === animation) {
          readyRef.current = true;
          setCanRestart(true);
        }
      });
    }
    return () => {
      currentRef.current = false;
      readyRef.current = false;
      animationRef.current?.stop();
      animationRef.current = null;
    };
  }, [isCompleted, animatedScale, animatedBtnScale]);

  function onPress() {
    if (!isCompleted || !readyRef.current) return;
    readyRef.current = false;
    setCanRestart(false);
    const animation = Animated.sequence([
      Animated.timing(animatedBtnScale, {
        duration: 500, toValue: 0, useNativeDriver: true,
        easing: Easing.back(),
      }),
      Animated.timing(animatedScale, { duration: 500, toValue: 0, useNativeDriver: true }),
    ]);
    animationRef.current = animation;
    animation.start(({ finished }) => {
      if (finished && currentRef.current && animationRef.current === animation) handleRestart();
    });
  }

  return isCompleted ? (
    <Animated.View accessibilityViewIsModal
      style={[styles.container, { transform: [{ scale: animatedScale }] }]}>
      <Image accessible={false} pointerEvents="none" style={styles.image} source={require("../assets/trophy.png")} />
      <AnimatedPressable onPress={onPress} disabled={!canRestart}
        accessibilityRole="button" accessibilityLabel="Rejouer"
        accessibilityState={{ disabled: !canRestart }}
        style={[styles.restartBtn, { width: Math.min(260, layout.width - 32),
          height: Math.min(160, layout.height * 0.25), transform: [{ scale: animatedBtnScale }] }]}>
        <Text style={styles.text}>Rejouer</Text>
      </AnimatedPressable>
    </Animated.View>
  ) : null;
}

const styles = StyleSheet.create({
  container: { ...StyleSheet.absoluteFill, justifyContent: "center", alignItems: "center" },
  image: { width: "100%", height: "100%", resizeMode: "contain", position: "absolute" },
  restartBtn: { padding: 16, backgroundColor: "#5D3FD3", borderRadius: 24,
    justifyContent: "center", alignItems: "center" },
  text: { color: "white", fontSize: 24, fontWeight: "700" },
});
