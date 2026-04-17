import { BlurView } from "expo-blur";
import React, { useMemo } from "react";
import { Platform, StyleSheet, View } from "react-native";
import Animated, {
  interpolate,
  SharedValue,
  useAnimatedStyle,
  useDerivedValue,
  withSpring,
} from "react-native-reanimated";

interface AnimatedIndicatorProps {
  scrollX: SharedValue<number>;
  pageWidth: number;
  tabCount: number;
  tabWidth: number;
  indicatorWidth: number;
  height: number;
}

/**
 * Liquid-glass pill that tracks the active tab.
 *
 * Driven entirely by `scrollX` (px) from the pager — tap and swipe both
 * write to the same ScrollView offset, so the indicator responds identically.
 *
 * Liquid feel: coupled scaleX bulge + scaleY compress (squash-and-stretch)
 * with a velocity-driven wobble tail. A glow layer brightens mid-transition,
 * making the pill feel like it catches light while in motion.
 */
export function AnimatedIndicator({
  scrollX,
  pageWidth,
  tabCount,
  tabWidth,
  indicatorWidth,
  height,
}: AnimatedIndicatorProps) {
  // Pre-computed outside the worklet — Array.from is not available in the
  // Reanimated worklet runtime (stripped-down Hermes context).
  const inputRange = useMemo(
    () => Array.from({ length: tabCount }, (_, i) => i),
    [tabCount],
  );
  const centerRange = useMemo(
    () =>
      inputRange.map((i) => i * tabWidth + tabWidth / 2 - indicatorWidth / 2),
    [inputRange, tabWidth, indicatorWidth],
  );

  const progress = useDerivedValue(() => scrollX.value / pageWidth);

  // Spring-damped shadow of raw progress — the lag between raw and spring
  // drives the velocity-wobble so the pill keeps morphing after release.
  const springy = useDerivedValue(() =>
    withSpring(progress.value, {
      damping: 16,
      stiffness: 160,
      mass: 0.8,
    }),
  );

  const style = useAnimatedStyle(() => {
    const p = progress.value;

    const translateX = interpolate(p, inputRange, centerRange);

    // Fractional distance from nearest tab (0 settled, ~0.5 mid-swipe).
    const fractional = p - Math.floor(p);
    const bulge = Math.sin(fractional * Math.PI);

    const velocityWobble = Math.min(Math.abs(p - springy.value) * 2.5, 0.18);

    return {
      transform: [
        { translateX },
        { scaleX: 1 + bulge * 0.32 + velocityWobble },
        { scaleY: 1 - bulge * 0.07 - velocityWobble * 0.5 },
      ],
    };
  });

  // Glow peaks during transitions — the pill "catches light" while moving.
  const glowStyle = useAnimatedStyle(() => {
    const p = progress.value;
    const fractional = p - Math.floor(p);
    const bulge = Math.sin(fractional * Math.PI);
    const velocityGlow = Math.min(Math.abs(p - springy.value) * 3, 0.2);
    return { opacity: bulge * 0.2 + velocityGlow };
  });

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        styles.indicator,
        { width: indicatorWidth, height, borderRadius: height / 2 },
        style,
      ]}
    >
      <BlurView
        intensity={Platform.OS === "ios" ? 50 : 30}
        tint="light"
        style={StyleSheet.absoluteFill}
      />
      <View style={styles.fill} />
      <Animated.View style={[styles.glow, glowStyle]} />
      <View style={styles.innerBorder} />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  indicator: {
    position: "absolute",
    top: 0,
    left: 0,
    overflow: "hidden",
  },
  fill: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(255,255,255,0.55)",
  },
  glow: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "#fff",
  },
  innerBorder: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 999,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "rgba(255,255,255,0.7)",
  },
});
