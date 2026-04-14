import { Ionicons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useMemo } from "react";
import {
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { CategoryListCard } from "../../components/CategoryListCard";
import { communityApps } from "../../constants/mockCommunity";
import { Colors, Fonts, Radius, Spacing } from "../../constants/theme";

// Spring config — controlled, no bounce
const SPRING = { damping: 24, stiffness: 220, mass: 0.9 };

export default function CategoryScreen() {
  const { name } = useLocalSearchParams<{ name: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const apps = useMemo(
    () => communityApps.filter((a) => a.category === name),
    [name],
  );

  // ── Entry animation ──────────────────────────────────────────────────────
  const headerY = useSharedValue(24);
  const headerOpacity = useSharedValue(0);
  const listOpacity = useSharedValue(0);

  useEffect(() => {
    headerY.value = withSpring(0, SPRING);
    headerOpacity.value = withTiming(1, { duration: 280 });
    listOpacity.value = withTiming(1, { duration: 360 });
  }, []);

  const headerStyle = useAnimatedStyle(() => ({
    opacity: headerOpacity.value,
    transform: [{ translateY: headerY.value }],
  }));

  const listStyle = useAnimatedStyle(() => ({
    opacity: listOpacity.value,
  }));

  return (
    <View style={styles.root}>
      {/* Full-page blur tint so the sheet feels glassy */}
      <BlurView tint="light" intensity={18} style={StyleSheet.absoluteFill} />
      <View style={styles.bg} />

      {/* ── Header ──────────────────────────────────────────────────────── */}
      <Animated.View
        style={[styles.header, { paddingTop: insets.top + 12 }, headerStyle]}
      >
        <BlurView tint="light" intensity={72} style={StyleSheet.absoluteFill} />
        <View style={styles.headerWash} />
        <View style={styles.headerBottomBorder} />

        <View style={styles.headerRow}>
          {/* Back button */}
          <Pressable
            onPress={() => router.back()}
            style={styles.backBtn}
            hitSlop={12}
          >
            <Ionicons name="chevron-back" size={18} color={Colors.text} />
          </Pressable>

          {/* Category title */}
          <Text style={styles.headerTitle}>{name}</Text>

          {/* Right spacer keeps title centred */}
          <View style={styles.backBtn} />
        </View>

        {/* App count sub-label */}
        <Text style={styles.headerSub}>
          {apps.length} app{apps.length !== 1 ? "s" : ""}
        </Text>
      </Animated.View>

      {/* ── App list ────────────────────────────────────────────────────── */}
      <Animated.View style={[styles.listWrap, listStyle]}>
        <FlatList
          data={apps}
          keyExtractor={(item) => item.id}
          contentContainerStyle={[
            styles.list,
            { paddingBottom: insets.bottom + 32 },
          ]}
          showsVerticalScrollIndicator={false}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          renderItem={({ item, index }) => (
            <ItemWrapper index={index}>
              <CategoryListCard app={item} />
            </ItemWrapper>
          )}
        />
      </Animated.View>
    </View>
  );
}

// ── Per-item entrance — each card slides up with a small stagger ─────────────
function ItemWrapper({
  children,
  index,
}: {
  children: React.ReactNode;
  index: number;
}) {
  const translateY = useSharedValue(20);
  const opacity = useSharedValue(0);

  useEffect(() => {
    const delay = 80 + index * 45;
    const timer = setTimeout(() => {
      translateY.value = withSpring(0, SPRING);
      opacity.value = withTiming(1, { duration: 220 });
    }, delay);
    return () => clearTimeout(timer);
  }, []);

  const style = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }));

  return <Animated.View style={style}>{children}</Animated.View>;
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Colors.bg,
  },
  bg: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(245,247,250,0.92)",
  },

  // Header
  header: {
    borderBottomWidth: 0,
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.md,
    overflow: "hidden",
  },
  headerWash: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(255,255,255,0.3)",
  },
  headerBottomBorder: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: "rgba(25,28,31,0.07)",
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: Radius.pill,
    backgroundColor: "rgba(25,28,31,0.06)",
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    fontFamily: Fonts.displayBold,
    fontSize: 20,
    letterSpacing: -0.5,
    color: Colors.text,
  },
  headerSub: {
    fontFamily: Fonts.sansMedium,
    fontSize: 13,
    color: Colors.textMuted,
    letterSpacing: 0.2,
    textAlign: "center",
  },

  // List
  listWrap: {
    flex: 1,
  },
  list: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
  },
  separator: {
    height: Spacing.sm,
  },
});
