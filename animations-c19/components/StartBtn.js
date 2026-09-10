import { useEffect, useRef, useState } from "react";
import {
  Animated,
  Easing,
  Pressable,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from "react-native";

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export default function StartBtn({ startGame, availableWidth }) {
  const { width: windowWidth } = useWindowDimensions();
  const width = availableWidth ?? windowWidth;
  const mounted = useRef(false);
  useEffect(() => { mounted.current = true; return () => { mounted.current = false; }; }, []);
  const buttonSize = width / 2;
  const circleSize = buttonSize + 8;
  const animatedScale = useRef(new Animated.Value(1)).current;
  const animatedOpacity = useRef(new Animated.Value(1)).current;
  const animationRef = useRef(null);
  const colorLoopRef = useRef(null);
  const exitAnimationRef = useRef(null);
  const leavingRef = useRef(false);
  const [isLeaving, setIsLeaving] = useState(false);
  const animatedColor = useRef(new Animated.Value(0)).current;
  const animatedTranslate = useRef(new Animated.Value(0)).current;
  const interpolatedColor = animatedColor.interpolate({
    inputRange: [0, 1, 2, 3, 4, 5, 6, 7],
    outputRange: [
      "#c94949", "#c9ba49", "#6fc949", "#49e37c",
      "#6fc949", "#5a49c9", "#ad49c9", "#c94949",
    ],
    extrapolate: "clamp",
  });

  useEffect(() => {
    animatedScale.setValue(1);
    animatedOpacity.setValue(1);
    const animation = Animated.loop(
      Animated.parallel([
        Animated.timing(animatedScale, {
          toValue: 5,
          duration: 3000,
          useNativeDriver: true,
          isInteraction: false,
        }),
        Animated.timing(animatedOpacity, {
          toValue: 0,
          duration: 3000,
          useNativeDriver: true,
          isInteraction: false,
        }),
      ]),
    );
    animationRef.current = animation;
    animation.start();
    return () => {
      animation.stop();
      if (animationRef.current === animation) {
        animationRef.current = null;
      }
    };
  }, [animatedScale, animatedOpacity]);

  useEffect(() => {
    animatedColor.setValue(0);
    const colorLoop = Animated.loop(
      Animated.timing(animatedColor, {
        toValue: 7,
        duration: 14000,
        easing: Easing.linear,
        useNativeDriver: true,
        isInteraction: false,
      }),
    );
    colorLoopRef.current = colorLoop;
    colorLoop.start();
    return () => {
      colorLoop.stop();
      exitAnimationRef.current?.stop();
      if (colorLoopRef.current === colorLoop) colorLoopRef.current = null;
    };
  }, [animatedColor]);

  function onPress() {
    if (leavingRef.current) return;
    leavingRef.current = true;
    setIsLeaving(true);
    animationRef.current?.stop();
    colorLoopRef.current?.stop();
    animatedScale.resetAnimation();
    animatedOpacity.resetAnimation();
    animatedColor.resetAnimation();
    const exitAnimation = Animated.timing(animatedTranslate, {
      toValue: width,
      duration: 1000,
      useNativeDriver: true,
    });
    exitAnimationRef.current = exitAnimation;
    exitAnimation.start(({ finished }) => {
      if (finished && mounted.current && exitAnimationRef.current === exitAnimation) {
        startGame();
      }
    });
  }

  return (
    <Animated.View
      style={[styles.container, { transform: [{ translateX: animatedTranslate }] }]}
    >
      <AnimatedPressable
        accessibilityRole="button"
        accessibilityHint="Déplace le bouton hors de l’écran"
        accessibilityState={{ disabled: isLeaving }}
        disabled={isLeaving}
        onPress={onPress}
        style={[
          styles.btn,
          { width: buttonSize, height: buttonSize, borderRadius: buttonSize / 2, backgroundColor: interpolatedColor },
        ]}
      >
        <Text style={styles.text}>Jouer</Text>
      </AnimatedPressable>
      <Animated.View
        pointerEvents="none"
        accessible={false}
        style={[
          styles.circle,
          {
            width: circleSize,
            height: circleSize,
            borderRadius: circleSize / 2,
            transform: [
              { translateX: -circleSize / 2 },
              { translateY: -circleSize / 2 },
              { scale: animatedScale },
            ],
            opacity: animatedOpacity,
            borderColor: interpolatedColor,
          },
        ]}
      />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center" },
  btn: {
    alignItems: "center",
    justifyContent: "center",
    zIndex: 20,
  },
  text: { color: "white", fontSize: 24, fontWeight: "700" },
  circle: {
    borderWidth: 2,
    position: "absolute",
    top: "50%",
    left: "50%",
  },
});
