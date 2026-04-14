import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import React, { useMemo } from "react";
import {
  Dimensions,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ExpandableCategorySection } from "../../components/ExpandableCategorySection";
import { PopularCard } from "../../components/PopularCard";
import {
  AppCategory,
  communityApps,
  featuredCategories,
} from "../../constants/mockCommunity";
import { mockProfile } from "../../constants/mockProfile";
import { Colors, Fonts, Radius, Spacing, Type } from "../../constants/theme";

const SCREEN_WIDTH = Dimensions.get("window").width;
const POPULAR_CARD_WIDTH = SCREEN_WIDTH - Spacing.lg * 2;

export default function DiscoverScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const popular = useMemo(
    () => [...communityApps].sort((a, b) => b.likes - a.likes).slice(0, 4),
    [],
  );

  const byCategory = useMemo(() => {
    const map: Record<AppCategory, typeof communityApps> = {
      Productivity: [],
      Games: [],
      Entertainment: [],
      Finance: [],
      Health: [],
      Creative: [],
    };
    for (const a of communityApps) map[a.category].push(a);
    return map;
  }, []);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.topBar}>
          <Text style={styles.title}>Discover.</Text>
          <TouchableOpacity
            activeOpacity={0.8}
            hitSlop={8}
            onPress={() => {
              Haptics.selectionAsync();
              router.push("/settings");
            }}
            style={[
              styles.profileAvatar,
              { backgroundColor: mockProfile.avatarColor },
            ]}
          >
            <Text style={styles.profileInitials}>
              {mockProfile.avatarInitials}
            </Text>
          </TouchableOpacity>
        </View>
        <View style={styles.header}>
          <Text style={styles.subtitle}>
            Hand-picked builds from the community.
          </Text>
        </View>

        <View style={styles.popularBlock}>
          <View style={styles.sectionHeadRow}>
            <Text style={styles.sectionLabel}>Popular this week</Text>
            <Ionicons name="flame" size={12} color={Colors.pink} />
          </View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            snapToInterval={POPULAR_CARD_WIDTH + Spacing.md}
            decelerationRate="fast"
            contentContainerStyle={styles.popularScroll}
          >
            {popular.map((app) => (
              <PopularCard
                key={app.id}
                app={app}
                cardWidth={POPULAR_CARD_WIDTH}
                cardHeight={360}
              />
            ))}
          </ScrollView>
        </View>

        {featuredCategories.map((cat) => {
          const items = byCategory[cat];
          if (!items.length) return null;
          return (
            <ExpandableCategorySection key={cat} title={cat} apps={items} />
          );
        })}
      </ScrollView>

      <TouchableOpacity
        style={[styles.fab, { bottom: insets.bottom + 104 }]}
        onPress={() => router.push("/create")}
        activeOpacity={0.85}
      >
        <Ionicons name="add" size={26} color={Colors.textInverse} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.bg,
  },
  scroll: {
    paddingBottom: 200,
  },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.xs,
  },
  header: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.lg,
  },
  title: {
    ...Type.heading2,
    color: Colors.text,
    letterSpacing: -0.8,
  },
  profileAvatar: {
    width: 36,
    height: 36,
    borderRadius: Radius.pill,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: Colors.bg,
  },
  profileInitials: {
    fontFamily: Fonts.sansBold,
    fontSize: 13,
    color: Colors.textInverse,
    letterSpacing: 0.2,
  },
  subtitle: {
    ...Type.bodyLarge,
    color: Colors.textSecondary,
    maxWidth: 340,
  },

  popularBlock: {
    marginBottom: Spacing.lg,
  },
  sectionHeadRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.md,
  },
  sectionLabel: {
    ...Type.micro,
    color: Colors.textMuted,
    textTransform: "uppercase",
  },
  popularScroll: {
    paddingHorizontal: Spacing.lg,
    gap: Spacing.md,
  },

  fab: {
    position: "absolute",
    right: Spacing.lg,
    width: 64,
    height: 64,
    borderRadius: Radius.pill,
    backgroundColor: Colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
});
