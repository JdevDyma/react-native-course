import { useEffect, useState } from "react";
import { AccessibilityInfo } from "react-native";
import { Skeleton as MotiSkeleton } from "moti/skeleton";
import { radius } from "../../constants/radius";

export const SkeletonProps = { colorMode: "light", radius: radius.REGULAR };
const STILL = {
  translateX: { type: "timing", loop: false, delay: 0, duration: 0 },
  opacity: { type: "timing", delay: 0, duration: 0 },
};

export function Skeleton(props) {
  const [reducedMotion, setReducedMotion] = useState(true);
  useEffect(() => {
    let active = true;
    let receivedChange = false;
    const subscription = AccessibilityInfo.addEventListener("reduceMotionChanged", (value) => {
      receivedChange = true;
      if (active) setReducedMotion(value);
    });
    void AccessibilityInfo.isReduceMotionEnabled().then((value) => {
      if (active && !receivedChange) setReducedMotion(value);
    }, () => {});
    return () => { active = false; subscription.remove(); };
  }, []);
  return <MotiSkeleton key={reducedMotion ? "still" : "moving"}
    {...props} disableExitAnimation transition={reducedMotion ? STILL : undefined} />;
}
Skeleton.Group = MotiSkeleton.Group;
