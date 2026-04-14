import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useMemo, useState } from "react";
import {
  Dimensions,
  FlatList,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { AppCard } from "../../components/AppCard";
import { ExpandableCategorySection } from "../../components/ExpandableCategorySection";
import { PopularCard } from "../../components/PopularCard";
import {
  BAR_HEIGHT,
  SwipeableTabs,
} from "../../components/glass-nav/SwipeableTabs";
import type { TabConfig } from "../../components/glass-nav/types";
import {
  AppCategory,
  communityApps,
  featuredCategories,
} from "../../constants/mockCommunity";
import { Colors, Radius, Spacing, Type } from "../../constants/theme";
import { useAppStore } from "../../store/appStore";

const SCREEN_WIDTH = Dimensions.get("window").width;
const POPULAR_CARD_WIDTH = SCREEN_WIDTH - Spacing.lg * 2;
const NAV_TOP_OFFSET = 8;

type YoursFilter = "all" | "public" | "private";

export default function GalleryScreen() {
  const apps = useAppStore((s) => s.apps);
  const deleteApp = useAppStore((s) => s.deleteApp);
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [yoursFilter, setYoursFilter] = useState<YoursFilter>("all");

  const navClearance = insets.top + NAV_TOP_OFFSET + BAR_HEIGHT + 12;

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

  const sortedYours = useMemo(() => {
    const list = [...apps].sort(
      (a, b) =>
        new Date(b.createdDate).getTime() - new Date(a.createdDate).getTime(),
    );
    if (yoursFilter === "all") return list;
    return list.filter((a) => (a.visibility ?? "private") === yoursFilter);
  }, [apps, yoursFilter]);

  const yoursPublicCount = useMemo(
    () => apps.filter((a) => a.visibility === "public").length,
    [apps],
  );

  const tabs: TabConfig[] = [
    {
      key: "discover",
      label: "Discover",
      icon: "compass-outline",
      iconActive: "compass",
      render: () => (
        <ScrollView
          style={styles.page}
          contentContainerStyle={{
            paddingTop: navClearance,
            paddingBottom: 200,
          }}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.sectionPad}>
            <Text style={styles.pageTitle}>Discover</Text>
          </View>

          <View style={styles.popularBlock}>
            <View style={[styles.sectionHeadRow, styles.sectionPad]}>
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
              <ExpandableCategorySection
                key={cat}
                title={cat}
                apps={items}
              />
            );
          })}
        </ScrollView>
      ),
    },
    {
      key: "yours",
      label: "Yours",
      icon: "sparkles-outline",
      iconActive: "sparkles",
      badge: apps.length > 0 ? apps.length : undefined,
      render: () =>
        apps.length === 0 ? (
          <ScrollView
            style={styles.page}
            contentContainerStyle={{
              paddingTop: navClearance,
              paddingBottom: 200,
            }}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.sectionPad}>
              <Text style={styles.pageTitle}>Gallery.</Text>
            </View>
            <View style={styles.empty}>
              <View style={styles.emptyIcon}>
                <Ionicons
                  name="sparkles-outline"
                  size={28}
                  color={Colors.text}
                />
              </View>
              <Text style={styles.emptyTitle}>Nothing here yet</Text>
              <Text style={styles.emptyText}>
                Tap Create new app to describe your first mini-app. It runs
                natively on this device — no webviews.
              </Text>
              <TouchableOpacity
                style={styles.ctaPrimary}
                onPress={() => router.push("/create")}
                activeOpacity={0.85}
              >
                <Text style={styles.ctaPrimaryText}>Create new app</Text>
                <Ionicons
                  name="arrow-forward"
                  size={18}
                  color={Colors.textInverse}
                />
              </TouchableOpacity>
            </View>
          </ScrollView>
        ) : (
          <FlatList
            style={styles.page}
            data={sortedYours}
            numColumns={2}
            keyExtractor={(item) => item.id}
            contentContainerStyle={{
              paddingTop: navClearance,
              paddingHorizontal: Spacing.lg,
              paddingBottom: 180,
            }}
            columnWrapperStyle={styles.gridRow}
            showsVerticalScrollIndicator={false}
            ListHeaderComponent={
              <View style={styles.yoursHeader}>
                <Text style={styles.pageTitle}>Gallery.</Text>
                <View style={styles.statsRow}>
                  <View style={styles.statCard}>
                    <Text style={styles.statValue}>{apps.length}</Text>
                    <Text style={styles.statLabel}>Built</Text>
                  </View>
                  <View style={styles.statCard}>
                    <Text style={styles.statValue}>{yoursPublicCount}</Text>
                    <Text style={styles.statLabel}>Public</Text>
                  </View>
                  <View style={styles.statCard}>
                    <Text style={styles.statValue}>
                      {apps.length - yoursPublicCount}
                    </Text>
                    <Text style={styles.statLabel}>Private</Text>
                  </View>
                </View>
                <View style={styles.filterRow}>
                  {(["all", "public", "private"] as YoursFilter[]).map((f) => {
                    const active = yoursFilter === f;
                    return (
                      <TouchableOpacity
                        key={f}
                        style={[
                          styles.filterPill,
                          active
                            ? styles.filterPillActive
                            : styles.filterPillInactive,
                        ]}
                        onPress={() => setYoursFilter(f)}
                        activeOpacity={0.85}
                      >
                        {f !== "all" && (
                          <Ionicons
                            name={
                              f === "public" ? "globe-outline" : "lock-closed"
                            }
                            size={12}
                            color={active ? Colors.textInverse : Colors.text}
                          />
                        )}
                        <Text
                          style={[
                            styles.filterText,
                            {
                              color: active ? Colors.textInverse : Colors.text,
                            },
                          ]}
                        >
                          {f[0].toUpperCase() + f.slice(1)}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>
            }
            renderItem={({ item }) => (
              <AppCard
                app={item}
                onPress={() => router.push(`/preview/${item.id}`)}
                onLongPress={() => deleteApp(item.id)}
              />
            )}
          />
        ),
    },
  ];

  return (
    <View style={styles.container}>
      <SwipeableTabs tabs={tabs} barInset={50} barTopOffset={NAV_TOP_OFFSET} />
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
  page: {
    flex: 1,
  },
  sectionPad: {
    paddingHorizontal: Spacing.lg,
  },
  pageTitle: {
    ...Type.displayHero,
    color: Colors.text,
    marginBottom: Spacing.lg,
  },

  popularBlock: {
    marginBottom: Spacing.lg,
  },
  popularScroll: {
    paddingHorizontal: Spacing.lg,
    gap: Spacing.md,
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
  yoursHeader: {
    marginBottom: Spacing.md,
  },
  statsRow: {
    flexDirection: "row",
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  statCard: {
    flex: 1,
    backgroundColor: Colors.surfaceMuted,
    borderRadius: Radius.lg,
    padding: Spacing.md,
  },
  statValue: {
    ...Type.heading1,
    color: Colors.text,
    marginBottom: 2,
  },
  statLabel: {
    ...Type.micro,
    color: Colors.textMuted,
    textTransform: "uppercase",
  },
  filterRow: {
    flexDirection: "row",
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  filterPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: Radius.pill,
    borderWidth: 2,
  },
  filterPillActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  filterPillInactive: {
    backgroundColor: "transparent",
    borderColor: Colors.primary,
  },
  filterText: {
    ...Type.button,
    fontSize: 13,
  },
  gridRow: {
    gap: Spacing.md,
  },

  empty: {
    alignItems: "flex-start",
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.xl,
  },
  emptyIcon: {
    width: 56,
    height: 56,
    borderRadius: Radius.pill,
    backgroundColor: Colors.surfaceMuted,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing.md,
  },
  emptyTitle: {
    ...Type.heading2,
    color: Colors.text,
    marginBottom: Spacing.sm,
  },
  emptyText: {
    ...Type.body,
    color: Colors.textSecondary,
    maxWidth: 320,
    marginBottom: Spacing.lg,
  },
  ctaPrimary: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    backgroundColor: Colors.primary,
    paddingVertical: 14,
    paddingHorizontal: 28,
    borderRadius: Radius.pill,
  },
  ctaPrimaryText: {
    ...Type.button,
    color: Colors.textInverse,
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
