import { useEffect, useRef, useState } from "react";
import { AccessibilityInfo, Pressable, StyleSheet, Text, View } from "react-native";
import LottieView from "lottie-react-native";
import { colors } from "../../constants/colors";

export default function SplashScreen({ onComplete }) {
  const [motionAllowed, setMotionAllowed] = useState(false);
  const mounted = useRef(true);
  const completed = useRef(false);
  const latest = useRef(onComplete);
  const animation = useRef(null);
  latest.current = onComplete;
  function finish() {
    if (!mounted.current || completed.current) return;
    completed.current = true;
    latest.current?.();
  }
  useEffect(() => {
    mounted.current = true;
    const update = (reduced) => {
      if (!mounted.current) return;
      if (reduced) finish();
      else setMotionAllowed(true);
    };
    const subscription = AccessibilityInfo.addEventListener("reduceMotionChanged", update);
    void AccessibilityInfo.isReduceMotionEnabled().then(update, () => update(true));
    return () => {
      mounted.current = false;
      subscription.remove();
      animation.current?.reset();
    };
  }, []);
  return <View style={styles.container}>
    {motionAllowed && <LottieView ref={animation} autoPlay loop={false} speed={0.5}
      source={require("../../assets/splash/animation.json")}
      style={styles.animation} resizeMode="contain" accessible={false}
      onAnimationFinish={(isCancelled) => { if (isCancelled === false) finish(); }}
      onAnimationFailure={finish} />}
    <Pressable accessibilityRole="button" accessibilityLabel="Passer l’animation de lancement"
      onPress={finish} style={styles.skip}><Text>Continuer</Text></Pressable>
  </View>;
}
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.LIGHT },
  animation: { flex: 1, width: "100%" },
  skip: { minHeight: 48, justifyContent: "center", alignItems: "center", padding: 16 },
});
