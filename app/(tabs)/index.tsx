import React, { useMemo, useState } from 'react'
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ScrollView,
  Dimensions,
} from 'react-native'
import { useRouter } from 'expo-router'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { useAppStore } from '../../store/appStore'
import { AppCard } from '../../components/AppCard'
import { CommunityCard } from '../../components/CommunityCard'
import { Colors, Spacing, Radius, Type } from '../../constants/theme'
import {
  communityApps,
  communityCategories,
  CommunityApp,
} from '../../constants/mockCommunity'

const CARD_GAP = Spacing.md
const FEATURED_WIDTH = Dimensions.get('window').width - Spacing.lg * 2 - 40

type Tab = 'discover' | 'yours'
type YoursFilter = 'all' | 'public' | 'private'
type Category = CommunityApp['category'] | 'All'

export default function GalleryScreen() {
  const apps = useAppStore((s) => s.apps)
  const deleteApp = useAppStore((s) => s.deleteApp)
  const router = useRouter()
  const insets = useSafeAreaInsets()

  const [tab, setTab] = useState<Tab>('discover')
  const [category, setCategory] = useState<Category>('All')
  const [yoursFilter, setYoursFilter] = useState<YoursFilter>('all')

  const featured = useMemo(
    () => communityApps.filter((a) => a.featured),
    []
  )

  const filteredCommunity = useMemo(() => {
    if (category === 'All') return communityApps
    return communityApps.filter((a) => a.category === category)
  }, [category])

  const sortedYours = useMemo(() => {
    const list = [...apps].sort(
      (a, b) => new Date(b.createdDate).getTime() - new Date(a.createdDate).getTime()
    )
    if (yoursFilter === 'all') return list
    return list.filter((a) => (a.visibility ?? 'private') === yoursFilter)
  }, [apps, yoursFilter])

  const yoursPublicCount = useMemo(
    () => apps.filter((a) => a.visibility === 'public').length,
    [apps]
  )

  const renderDiscoverHeader = () => (
    <View>
      {featured.length > 0 && (
        <View style={styles.featuredBlock}>
          <View style={styles.sectionHeadRow}>
            <Text style={styles.sectionLabel}>Featured this week</Text>
            <Ionicons name="star" size={12} color={Colors.text} />
          </View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.featuredScroll}
            snapToInterval={FEATURED_WIDTH + Spacing.md}
            decelerationRate="fast"
          >
            {featured.map((app) => (
              <TouchableOpacity
                key={app.id}
                style={[styles.featuredCard, { width: FEATURED_WIDTH }]}
                activeOpacity={0.92}
              >
                <View style={styles.featuredTop}>
                  <View style={styles.featuredBadge}>
                    <Ionicons name="star" size={10} color={Colors.textInverse} />
                    <Text style={styles.featuredBadgeText}>Featured</Text>
                  </View>
                  <Text style={styles.featuredCategory}>{app.category.toUpperCase()}</Text>
                </View>
                <Text style={styles.featuredName}>{app.name}</Text>
                <Text style={styles.featuredPrompt} numberOfLines={2}>
                  {app.prompt}
                </Text>
                <View style={styles.featuredFooter}>
                  <View style={styles.featuredAuthor}>
                    <View
                      style={[
                        styles.featuredAvatar,
                        { backgroundColor: app.author.avatarColor },
                      ]}
                    >
                      <Text style={styles.featuredAvatarText}>
                        {app.author.avatarInitials}
                      </Text>
                    </View>
                    <Text style={styles.featuredHandle}>{app.author.handle}</Text>
                  </View>
                  <View style={styles.featuredStat}>
                    <Ionicons name="heart" size={12} color={Colors.textInverse} />
                    <Text style={styles.featuredStatText}>
                      {(app.likes / 1000).toFixed(1)}k
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}

      <View style={styles.categoryBlock}>
        <Text style={styles.sectionLabel}>Browse by category</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoryScroll}
        >
          {(['All', ...communityCategories] as Category[]).map((c) => {
            const active = category === c
            return (
              <TouchableOpacity
                key={c}
                style={[
                  styles.categoryPill,
                  active ? styles.categoryPillActive : styles.categoryPillInactive,
                ]}
                onPress={() => setCategory(c)}
                activeOpacity={0.85}
              >
                <Text
                  style={[
                    styles.categoryText,
                    { color: active ? Colors.textInverse : Colors.text },
                  ]}
                >
                  {c}
                </Text>
              </TouchableOpacity>
            )
          })}
        </ScrollView>
      </View>

      <View style={styles.sectionHeadRow}>
        <Text style={styles.sectionLabel}>
          {category === 'All' ? 'All community apps' : category}
        </Text>
        <Text style={styles.sectionCount}>{filteredCommunity.length}</Text>
      </View>
    </View>
  )

  const renderYoursHeader = () => (
    <View>
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
          <Text style={styles.statValue}>{apps.length - yoursPublicCount}</Text>
          <Text style={styles.statLabel}>Private</Text>
        </View>
      </View>

      <View style={styles.filterRow}>
        {(['all', 'public', 'private'] as YoursFilter[]).map((f) => {
          const active = yoursFilter === f
          return (
            <TouchableOpacity
              key={f}
              style={[
                styles.filterPill,
                active ? styles.filterPillActive : styles.filterPillInactive,
              ]}
              onPress={() => setYoursFilter(f)}
              activeOpacity={0.85}
            >
              {f !== 'all' && (
                <Ionicons
                  name={f === 'public' ? 'globe-outline' : 'lock-closed'}
                  size={12}
                  color={active ? Colors.textInverse : Colors.text}
                />
              )}
              <Text
                style={[
                  styles.filterText,
                  { color: active ? Colors.textInverse : Colors.text },
                ]}
              >
                {f[0].toUpperCase() + f.slice(1)}
              </Text>
            </TouchableOpacity>
          )
        })}
      </View>
    </View>
  )

  const header = (
    <View style={styles.header}>
      <Text style={styles.eyebrow}>The Oggy gallery</Text>
      <Text style={styles.title}>Gallery.</Text>
      <Text style={styles.subtitle}>
        {tab === 'discover'
          ? 'Discover mini-apps built by the Oggy community, or remix them into your own.'
          : `${apps.length} mini-app${apps.length !== 1 ? 's' : ''} you've built. Share the ones you love.`}
      </Text>

      <View style={styles.segment}>
        <TouchableOpacity
          style={[styles.segmentItem, tab === 'discover' && styles.segmentItemActive]}
          onPress={() => setTab('discover')}
          activeOpacity={0.9}
        >
          <Ionicons
            name="compass-outline"
            size={16}
            color={tab === 'discover' ? Colors.textInverse : Colors.text}
          />
          <Text
            style={[
              styles.segmentText,
              { color: tab === 'discover' ? Colors.textInverse : Colors.text },
            ]}
          >
            Discover
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.segmentItem, tab === 'yours' && styles.segmentItemActive]}
          onPress={() => setTab('yours')}
          activeOpacity={0.9}
        >
          <Ionicons
            name="sparkles-outline"
            size={16}
            color={tab === 'yours' ? Colors.textInverse : Colors.text}
          />
          <Text
            style={[
              styles.segmentText,
              { color: tab === 'yours' ? Colors.textInverse : Colors.text },
            ]}
          >
            Yours
          </Text>
          {apps.length > 0 && (
            <View
              style={[
                styles.segmentBadge,
                tab === 'yours' ? styles.segmentBadgeActive : styles.segmentBadgeInactive,
              ]}
            >
              <Text
                style={[
                  styles.segmentBadgeText,
                  { color: tab === 'yours' ? Colors.text : Colors.textInverse },
                ]}
              >
                {apps.length}
              </Text>
            </View>
          )}
        </TouchableOpacity>
      </View>
    </View>
  )

  const listHeader = (
    <View>
      {header}
      {tab === 'discover' ? renderDiscoverHeader() : renderYoursHeader()}
    </View>
  )

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {tab === 'discover' ? (
        <FlatList
          data={filteredCommunity}
          numColumns={2}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.grid}
          columnWrapperStyle={styles.row}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={listHeader}
          renderItem={({ item }) => <CommunityCard app={item} />}
        />
      ) : apps.length === 0 ? (
        <ScrollView
          contentContainerStyle={styles.emptyScroll}
          showsVerticalScrollIndicator={false}
        >
          {listHeader}
          <View style={styles.empty}>
            <View style={styles.emptyIcon}>
              <Ionicons name="sparkles-outline" size={28} color={Colors.text} />
            </View>
            <Text style={styles.emptyTitle}>Nothing here yet</Text>
            <Text style={styles.emptyText}>
              Tap Create new app to describe your first mini-app. It runs natively on this
              device — no webviews.
            </Text>
            <TouchableOpacity
              style={styles.ctaPrimary}
              onPress={() => router.push('/create')}
              activeOpacity={0.85}
            >
              <Text style={styles.ctaPrimaryText}>Create new app</Text>
              <Ionicons name="arrow-forward" size={18} color={Colors.textInverse} />
            </TouchableOpacity>
          </View>
        </ScrollView>
      ) : (
        <FlatList
          data={sortedYours}
          numColumns={2}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.grid}
          columnWrapperStyle={styles.row}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={listHeader}
          renderItem={({ item }) => (
            <AppCard
              app={item}
              onPress={() => router.push(`/preview/${item.id}`)}
              onLongPress={() => deleteApp(item.id)}
            />
          )}
        />
      )}

      <TouchableOpacity
        style={[styles.fab, { bottom: insets.bottom + 104 }]}
        onPress={() => router.push('/create')}
        activeOpacity={0.85}
      >
        <Ionicons name="add" size={26} color={Colors.textInverse} />
      </TouchableOpacity>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.bg,
  },
  header: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.lg,
  },
  eyebrow: {
    ...Type.micro,
    color: Colors.textMuted,
    textTransform: 'uppercase',
    marginBottom: Spacing.sm,
  },
  title: {
    ...Type.displayHero,
    color: Colors.text,
    marginBottom: Spacing.md,
  },
  subtitle: {
    ...Type.bodyLarge,
    color: Colors.textSecondary,
    maxWidth: 340,
    marginBottom: Spacing.lg,
  },
  segment: {
    flexDirection: 'row',
    gap: Spacing.sm,
    padding: 4,
    backgroundColor: Colors.surfaceMuted,
    borderRadius: Radius.pill,
    alignSelf: 'flex-start',
  },
  segmentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: Radius.pill,
  },
  segmentItemActive: {
    backgroundColor: Colors.primary,
  },
  segmentText: {
    ...Type.button,
    fontSize: 14,
  },
  segmentBadge: {
    minWidth: 20,
    height: 20,
    borderRadius: Radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
  },
  segmentBadgeActive: {
    backgroundColor: Colors.textInverse,
  },
  segmentBadgeInactive: {
    backgroundColor: Colors.primary,
  },
  segmentBadgeText: {
    fontSize: 11,
    fontWeight: '700',
  },

  featuredBlock: {
    marginBottom: Spacing.xl,
  },
  sectionHeadRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.md,
  },
  sectionLabel: {
    ...Type.micro,
    color: Colors.textMuted,
    textTransform: 'uppercase',
  },
  sectionCount: {
    ...Type.micro,
    color: Colors.text,
  },
  featuredScroll: {
    paddingHorizontal: Spacing.lg,
    gap: Spacing.md,
  },
  featuredCard: {
    backgroundColor: Colors.bgDark,
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    minHeight: 200,
    justifyContent: 'space-between',
  },
  featuredTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.md,
  },
  featuredBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: Radius.pill,
    backgroundColor: Colors.ghostOnDark,
    borderWidth: 1,
    borderColor: 'rgba(244,244,244,0.3)',
  },
  featuredBadgeText: {
    ...Type.micro,
    color: Colors.textInverse,
    fontSize: 10,
    letterSpacing: 0.8,
  },
  featuredCategory: {
    ...Type.micro,
    color: 'rgba(244,244,244,0.6)',
    fontSize: 10,
  },
  featuredName: {
    ...Type.heading2,
    color: Colors.textInverse,
    marginBottom: Spacing.sm,
  },
  featuredPrompt: {
    ...Type.body,
    color: 'rgba(244,244,244,0.7)',
    marginBottom: Spacing.md,
  },
  featuredFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  featuredAuthor: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  featuredAvatar: {
    width: 24,
    height: 24,
    borderRadius: Radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  featuredAvatarText: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.textInverse,
  },
  featuredHandle: {
    ...Type.bodySemibold,
    fontSize: 13,
    color: Colors.textInverse,
  },
  featuredStat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  featuredStatText: {
    ...Type.bodySmall,
    fontSize: 12,
    color: Colors.textInverse,
    fontWeight: '600',
  },

  categoryBlock: {
    marginBottom: Spacing.xl,
  },
  categoryScroll: {
    paddingHorizontal: Spacing.lg,
    gap: Spacing.sm,
  },
  categoryPill: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: Radius.pill,
    borderWidth: 2,
  },
  categoryPillActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  categoryPillInactive: {
    backgroundColor: 'transparent',
    borderColor: Colors.primary,
  },
  categoryText: {
    ...Type.button,
    fontSize: 14,
  },

  statsRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    paddingHorizontal: Spacing.lg,
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
    textTransform: 'uppercase',
  },
  filterRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.md,
  },
  filterPill: {
    flexDirection: 'row',
    alignItems: 'center',
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
    backgroundColor: 'transparent',
    borderColor: Colors.primary,
  },
  filterText: {
    ...Type.button,
    fontSize: 13,
  },

  grid: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: 180,
  },
  row: {
    gap: CARD_GAP,
  },
  emptyScroll: {
    paddingBottom: 200,
  },
  empty: {
    alignItems: 'flex-start',
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.xl,
  },
  emptyIcon: {
    width: 56,
    height: 56,
    borderRadius: Radius.pill,
    backgroundColor: Colors.surfaceMuted,
    alignItems: 'center',
    justifyContent: 'center',
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
    flexDirection: 'row',
    alignItems: 'center',
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
    position: 'absolute',
    right: Spacing.lg,
    width: 64,
    height: 64,
    borderRadius: Radius.pill,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
})
