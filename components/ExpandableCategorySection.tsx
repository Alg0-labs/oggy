import { Ionicons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import { useRouter } from "expo-router";
import React, { useCallback } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import Animated, {
  Extrapolation,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import type { CommunityApp } from "../constants/mockCommunity";
import { Colors, Fonts, Radius, Spacing } from "../constants/theme";
import { CategoryListCard } from "./CategoryListCard";

// ─── Spring config ─────────────────────────────────────────────────────────────
const SPRING = { damping: 22, stiffness: 240, mass: 0.8 };

// ─── Preview list — first 3 apps shown below the header ──────────────────────
function PreviewList({ apps }: { apps: CommunityApp[] }) {
  return (
    <View style={styles.previewList}>
      {apps.slice(0, 3).map((app, i) => (
        <View
          key={app.id}
          style={[styles.previewItem, i < 2 && styles.previewItemBorder]}
        >
          <CategoryListCard app={app} />
        </View>
      ))}
    </View>
  );
}

// ─── Main component ────────────────────────────────────────────────────────────
interface ExpandableCategorySectionProps {
  title: string
  apps: CommunityApp[]
}

export function ExpandableCategorySection({
  title,
  apps,
}: ExpandableCategorySectionProps) {
  const router = useRouter();

  // Press-feedback animation: section lifts slightly then springs back
  // before navigating, giving a satisfying "launch" feel.
  const scale = useSharedValue(1);
  const translateY = useSharedValue(0);
  const shadowOpacity = useSharedValue(0.06);

  const navigate = useCallback(() => {
    router.push(`/category/${encodeURIComponent(title)}`);
  }, [title, router]);

  const handlePress = useCallback(() => {
    // 1. Trigger lift animation
    scale.value = withSequence(
      withSpring(0.975, { damping: 18, stiffness: 300 }),
      withSpring(1, SPRING),
    );
    translateY.value = withSequence(
      withTiming(-4, { duration: 100 }),
      withSpring(0, SPRING),
    );
    shadowOpacity.value = withSequence(
      withTiming(0.18, { duration: 100 }),
      withTiming(0.06, { duration: 300 }),
    );

    // 2. Navigate after a short delay so the lift is visible before transition
    setTimeout(navigate, 80);
  }, [navigate]);

  const sectionStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: scale.value },
      { translateY: translateY.value },
    ],
    shadowOpacity: shadowOpacity.value,
  }));

  // Arrow rotates slightly on press for tactile feedback
  const arrowScale = useSharedValue(1);
  const arrowStyle = useAnimatedStyle(() => ({
    transform: [{ scale: arrowScale.value }],
  }));

  const handlePressIn = () => {
    arrowScale.value = withSpring(0.85, { damping: 15, stiffness: 400 });
  };
  const handlePressOut = () => {
    arrowScale.value = withSpring(1, SPRING);
  };

  // Count badge — shows how many apps are in the category
  const countStyle = useAnimatedStyle(() => ({
    opacity: interpolate(scale.value, [0.975, 1], [0.6, 1], Extrapolation.CLAMP),
  }));

  return (
    <Animated.View style={[styles.wrapper, sectionStyle]}>
      {/* ── Glass card ─────────────────────────────────────────────────── */}
      <View style={styles.card}>
        <BlurView tint="light" intensity={72} style={StyleSheet.absoluteFill} />
        <View style={styles.cardWash} />
        <View style={styles.cardTopHighlight} />

        {/* Header row */}
        <View style={styles.headerRow}>
          <View style={styles.titleGroup}>
            <Text style={styles.title}>{title}</Text>
            <Animated.Text style={[styles.countBadge, countStyle]}>
              {apps.length} apps
            </Animated.Text>
          </View>

          {/* Arrow — only this triggers navigation */}
          <Pressable
            onPress={handlePress}
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
            hitSlop={12}
          >
            <Animated.View style={[styles.arrowWrap, arrowStyle]}>
              <Ionicons name="chevron-forward" size={14} color={Colors.text} />
            </Animated.View>
          </Pressable>
        </View>

        {/* ── Preview of first 3 apps ──────────────────────────────────── */}
        <View style={styles.divider} />
        <PreviewList apps={apps} />
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: Spacing.lg,
    paddingHorizontal: Spacing.lg,
    shadowColor: "#90a0b4",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.06,
    shadowRadius: 20,
    elevation: 4,
  },
  // Glass card container
  card: {
    borderRadius: Radius.xl,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.7)",
    backgroundColor: "rgba(255,255,255,0.5)",
  },
  cardWash: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(255,255,255,0.22)",
  },
  cardTopHighlight: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 1.5,
    backgroundColor: "rgba(255,255,255,0.95)",
    zIndex: 1,
  },

  // Header row inside the card
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.sm,
  },
  titleGroup: {
    gap: 2,
  },
  title: {
    fontFamily: Fonts.displayBold,
    fontSize: 19,
    lineHeight: 23,
    letterSpacing: -0.45,
    color: Colors.text,
  },
  countBadge: {
    fontFamily: Fonts.sansMedium,
    fontSize: 12,
    color: Colors.textMuted,
    letterSpacing: 0.1,
  },
  arrowWrap: {
    width: 30,
    height: 30,
    borderRadius: Radius.pill,
    borderWidth: 1.5,
    borderColor: "rgba(25,28,31,0.14)",
    backgroundColor: "rgba(255,255,255,0.55)",
    alignItems: "center",
    justifyContent: "center",
  },

  // Divider between header and preview list
  divider: {
    height: 1,
    marginHorizontal: Spacing.md,
    backgroundColor: "rgba(25,28,31,0.06)",
  },

  // Preview list
  previewList: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.sm,
  },
  previewItem: {
    // no extra margin — CategoryListCard already has its own spacing
  },
  previewItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: "rgba(25,28,31,0.05)",
    marginBottom: 6,
    paddingBottom: 6,
  },
});
