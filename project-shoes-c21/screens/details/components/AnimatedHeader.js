import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { StyleSheet, View, useWindowDimensions } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useStore } from "react-redux";
import Animated, { cancelAnimation, ReduceMotion, useAnimatedStyle,
  useSharedValue, withRepeat, withSpring, withTiming } from "react-native-reanimated";
import { scheduleOnRN } from "react-native-worklets";
import CartIcon from "../../../assets/images/navigation/cart.svg";
import { ICON_SIZE, SMALL_ICON_SIZE } from "../../../constants/sizes";
import { colors } from "../../../constants/colors";
import { radius } from "../../../constants/radius";
import TextBoldM from "../../../ui-components/texts/TextBoldM";
import { isSameProfileSession } from "../../../lib/profileSession";

const MAIN_WIDTH = 80;

export default function AnimatedHeader({ confirmation, sessionKey, initialCount = 0 }) {
  const navigation = useNavigation();
  const store = useStore();
  const { width } = useWindowDimensions();
  const headerWidth = Math.min(MAIN_WIDTH, Math.max(40, width / 3));
  const translate = useSharedValue(headerWidth);
  const scale = useSharedValue(1);
  const [count, setCount] = useState(initialCount);
  const sequence = useRef(0);
  const handled = useRef(null);
  const containerStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translate.value }],
  }));
  const badgeStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <View pointerEvents="none" style={[styles.viewport, { width: headerWidth }]}>
          <Animated.View style={[styles.container, { width: headerWidth }, containerStyle]}>
            <CartIcon width={ICON_SIZE} height={ICON_SIZE} color={colors.WHITE} />
            <Animated.View style={[styles.badge, badgeStyle]}>
              <TextBoldM blue>{count}</TextBoldM>
            </Animated.View>
          </Animated.View>
        </View>
      ),
    });
  }, [navigation, headerWidth, count, containerStyle, badgeStyle]);

  useLayoutEffect(() => () => {
    // Ce composant est l’unique propriétaire de headerRight sur cet écran.
    navigation.setOptions({ headerRight: undefined });
  }, [navigation]);

  useEffect(() => {
    const run = ++sequence.current;
    let active = true;
    cancelAnimation(translate);
    cancelAnimation(scale);
    translate.value = headerWidth;
    scale.value = 1;

    function isCurrent(value) {
      return active && value === sequence.current &&
        isSameProfileSession(store.getState(), confirmation?.sessionKey);
    }
    function afterBadge(value) {
      if (!isCurrent(value)) return;
      translate.value = withTiming(headerWidth, {
        duration: 400, reduceMotion: ReduceMotion.System,
      });
    }
    function afterEnter(value, nextCount) {
      if (!isCurrent(value)) return;
      setCount(nextCount);
      scale.value = withRepeat(
        withSpring(1.5, { damping: 14, stiffness: 180, reduceMotion: ReduceMotion.System }),
        2,
        true,
        (finished) => { if (finished) scheduleOnRN(afterBadge, value); },
        ReduceMotion.System,
      );
    }
    if (confirmation && confirmation.id !== handled.current &&
        Number.isSafeInteger(confirmation.count) && confirmation.count >= 0 &&
        confirmation.sessionKey?.userId === sessionKey?.userId &&
        confirmation.sessionKey?.generation === sessionKey?.generation && isCurrent(run)) {
      handled.current = confirmation.id;
      translate.value = withTiming(0, {
        duration: 400, reduceMotion: ReduceMotion.System,
      }, (finished) => {
        if (finished) scheduleOnRN(afterEnter, run, confirmation.count);
      });
    }
    return () => {
      active = false;
      sequence.current += 1;
      cancelAnimation(translate);
      cancelAnimation(scale);
    };
  }, [confirmation, sessionKey?.userId, sessionKey?.generation, headerWidth, store, translate, scale]);

  return null;
}

const styles = StyleSheet.create({
  viewport: { height: 40, overflow: "hidden" },
  container: { height: 40, justifyContent: "center", alignItems: "flex-start",
    paddingLeft: 8, backgroundColor: colors.BLUE,
    borderTopLeftRadius: radius.REGULAR, borderBottomLeftRadius: radius.REGULAR },
  badge: { width: SMALL_ICON_SIZE, height: SMALL_ICON_SIZE,
    position: "absolute", right: 6, top: (40 - SMALL_ICON_SIZE) / 2,
    justifyContent: "center", alignItems: "center",
    backgroundColor: colors.WHITE, borderRadius: radius.FULL },
});
