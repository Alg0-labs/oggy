import { Ionicons } from '@expo/vector-icons'
import { useRouter } from 'expo-router'
import React, { useMemo, useState } from 'react'
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { AppCard } from '../components/AppCard'
import { IconButton, ScreenHeader, PillButton } from '../components/ui'
import { mockProfile } from '../constants/mockProfile'
import { Colors, Radius, Spacing, Type, ACTIVE_OPACITY } from '../constants/theme'
import { useAppStore } from '../store/appStore'

type AppsFilter = 'public' | 'private'

function formatCount(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`
  return `${n}`
}

export default function ProfileScreen() {
  const insets = useSafeAreaInsets()
  const router = useRouter()
  const apps = useAppStore((s) => s.apps)
  const [filter, setFilter] = useState<AppsFilter>('public')

  // TODO: swap mockProfile for backend-fetched user. Shape: UserProfile in constants/mockProfile.ts
  const profile = mockProfile

  const publicApps = useMemo(
    () => apps.filter((a) => (a.visibility ?? 'private') === 'public'),
    [apps],
  )
  const privateApps = useMemo(
    () => apps.filter((a) => (a.visibility ?? 'private') === 'private'),
    [apps],
  )
  const visibleApps = filter === 'public' ? publicApps : privateApps

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <ScreenHeader
        left={<IconButton icon="chevron-back" onPress={() => router.back()} />}
        right={
          <>
            <IconButton icon="share-outline" onPress={() => {}} />
            <IconButton icon="settings-outline" onPress={() => router.push('/settings')} />
          </>
        }
      />

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        {/* Identity row — avatar + name/handle */}
        <View style={styles.identityRow}>
          <View style={[styles.avatar, { backgroundColor: profile.avatarColor }]}>
            <Text style={styles.avatarInitials}>{profile.avatarInitials}</Text>
          </View>
          <View style={styles.identityText}>
            <Text style={styles.name} numberOfLines={1}>
              {profile.name}
            </Text>
            <Text style={styles.handle} numberOfLines={1}>
              {profile.handle}
            </Text>
          </View>
        </View>

        {/* Bio */}
        {!!profile.bio && <Text style={styles.bio}>{profile.bio}</Text>}

        {/* Meta */}
        <View style={styles.metaRow}>
          <View style={styles.metaItem}>
            <Ionicons name="location-outline" size={13} color={Colors.textMuted} />
            <Text style={styles.metaText}>{profile.location}</Text>
          </View>
          <View style={styles.metaItem}>
            <Ionicons name="link-outline" size={13} color={Colors.textMuted} />
            <Text style={styles.metaText}>{profile.website}</Text>
          </View>
        </View>

        {/* Stats — no card, just numbers */}
        <View style={styles.statsRow}>
          <TouchableOpacity style={styles.statCell} activeOpacity={0.7}>
            <Text style={styles.statValue}>
              {apps.length || profile.stats.appsCreated}
            </Text>
            <Text style={styles.statLabel}>Apps</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.statCell} activeOpacity={0.7}>
            <Text style={styles.statValue}>
              {formatCount(profile.stats.followers)}
            </Text>
            <Text style={styles.statLabel}>Followers</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.statCell} activeOpacity={0.7}>
            <Text style={styles.statValue}>
              {formatCount(profile.stats.following)}
            </Text>
            <Text style={styles.statLabel}>Following</Text>
          </TouchableOpacity>
        </View>

        {/* Your apps */}
        <View style={styles.appsHeader}>
          <Text style={styles.sectionTitle}>Your apps</Text>
          <Text style={styles.sectionCount}>{visibleApps.length}</Text>
        </View>

        <View style={styles.filterRow}>
          {(['public', 'private'] as const).map((key) => (
            <PillButton
              key={key}
              label={key === 'public' ? 'Public' : 'Private'}
              icon={key === 'public' ? 'globe-outline' : 'lock-closed-outline'}
              variant="outline"
              size="sm"
              active={filter === key}
              onPress={() => setFilter(key)}
            />
          ))}
        </View>

        {visibleApps.length === 0 ? (
          <View style={styles.empty}>
            <View style={styles.emptyIcon}>
              <Ionicons
                name={filter === 'public' ? 'globe-outline' : 'lock-closed-outline'}
                size={22}
                color={Colors.text}
              />
            </View>
            <Text style={styles.emptyTitle}>
              No {filter} apps yet
            </Text>
            <Text style={styles.emptyText}>
              {filter === 'public'
                ? 'Publish an app to share it with the community.'
                : 'Private apps are only visible to you.'}
            </Text>
          </View>
        ) : (
          <View style={styles.grid}>
            {visibleApps.map((item) => (
              <View key={item.id} style={styles.gridItem}>
                <AppCard
                  app={item}
                  onPress={() => router.push(`/preview/${item.id}`)}
                />
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.bg,
  },
  scroll: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: 200,
  },
  identityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    marginTop: Spacing.md,
  },
  avatar: {
    width: 76,
    height: 76,
    borderRadius: Radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInitials: {
    ...Type.heading2,
    color: Colors.textInverse,
    letterSpacing: -0.5,
  },
  identityText: {
    flex: 1,
    minWidth: 0,
  },
  name: {
    ...Type.heading1,
    color: Colors.text,
    fontSize: 28,
    lineHeight: 32,
  },
  handle: {
    ...Type.body,
    color: Colors.textMuted,
    marginTop: 2,
  },
  bio: {
    ...Type.body,
    color: Colors.textSecondary,
    marginTop: Spacing.md,
  },
  metaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.md,
    marginTop: Spacing.sm,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    ...Type.bodySmall,
    color: Colors.textMuted,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: Spacing.lg,
  },
  statCell: {
    alignItems: 'center',
    paddingHorizontal: Spacing.xs,
  },
  statValue: {
    ...Type.heading2,
    color: Colors.text,
    fontSize: 22,
    lineHeight: 26,
  },
  statLabel: {
    ...Type.bodySmall,
    color: Colors.textSecondary,
    fontSize: 13,
    marginTop: 2,
  },
  appsHeader: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    marginTop: Spacing.xl,
    marginBottom: Spacing.sm,
  },
  sectionTitle: {
    ...Type.heading2,
    color: Colors.text,
  },
  sectionCount: {
    ...Type.bodySmall,
    color: Colors.textMuted,
  },
  filterRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.md,
  },
  gridItem: {
    width: '48%',
  },
  empty: {
    alignItems: 'flex-start',
    backgroundColor: Colors.surfaceMuted,
    borderRadius: Radius.lg,
    padding: Spacing.lg,
  },
  emptyIcon: {
    width: 44,
    height: 44,
    borderRadius: Radius.pill,
    backgroundColor: Colors.bg,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
  },
  emptyTitle: {
    ...Type.heading3,
    color: Colors.text,
    marginBottom: Spacing.xs,
  },
  emptyText: {
    ...Type.bodySmall,
    color: Colors.textSecondary,
    maxWidth: 320,
  },
})
