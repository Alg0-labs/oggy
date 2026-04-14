import React, { useEffect, useMemo, useState } from 'react'
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native'
import { useRouter } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { useSharedValue, withSpring } from 'react-native-reanimated'
import { AppCard } from '../AppCard'
import { GlassNavbar } from '../glass-nav/GlassNavbar'
import type { TabConfig } from '../glass-nav/types'
import { useAppStore } from '../../store/appStore'
import { Colors, Radius, Spacing, Type } from '../../constants/theme'

type YoursFilter = 'all' | 'public' | 'private'

const FILTER_BAR_WIDTH = 300
const FILTERS: { key: YoursFilter; tab: TabConfig }[] = [
  {
    key: 'all',
    tab: { key: 'all', label: 'All', icon: 'albums-outline', iconActive: 'albums' },
  },
  {
    key: 'public',
    tab: { key: 'public', label: 'Public', icon: 'globe-outline', iconActive: 'globe' },
  },
  {
    key: 'private',
    tab: {
      key: 'private',
      label: 'Private',
      icon: 'lock-closed-outline',
      iconActive: 'lock-closed',
    },
  },
]

export function YourAppsContent() {
  const router = useRouter()
  const apps = useAppStore((s) => s.apps)
  const deleteApp = useAppStore((s) => s.deleteApp)
  const [filterIndex, setFilterIndex] = useState(0)
  const filterPosition = useSharedValue(0)

  useEffect(() => {
    filterPosition.value = withSpring(filterIndex, {
      damping: 18,
      stiffness: 180,
      mass: 0.9,
    })
  }, [filterIndex]) // eslint-disable-line react-hooks/exhaustive-deps

  const filter = FILTERS[filterIndex].key

  const sorted = useMemo(() => {
    const list = [...apps].sort(
      (a, b) =>
        new Date(b.createdDate).getTime() - new Date(a.createdDate).getTime(),
    )
    if (filter === 'all') return list
    return list.filter((a) => (a.visibility ?? 'private') === filter)
  }, [apps, filter])

  return (
    <ScrollView
      contentContainerStyle={styles.scroll}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.filterBar}>
        <GlassNavbar
          tabs={FILTERS.map((f) => f.tab)}
          barWidth={FILTER_BAR_WIDTH}
          pageWidth={1}
          scrollX={filterPosition}
          onTabPress={setFilterIndex}
        />
      </View>

      {sorted.length === 0 ? (
        <View style={styles.empty}>
          <View style={styles.emptyIcon}>
            <Ionicons name="sparkles-outline" size={24} color={Colors.text} />
          </View>
          <Text style={styles.emptyTitle}>
            {filter === 'all' ? 'Nothing here yet' : `No ${filter} apps`}
          </Text>
          <Text style={styles.emptyText}>
            Describe your first mini-app. It runs natively on this device — no
            webviews.
          </Text>
          <TouchableOpacity
            style={styles.cta}
            onPress={() => router.push('/create')}
            activeOpacity={0.85}
          >
            <Text style={styles.ctaText}>Create new app</Text>
            <Ionicons name="arrow-forward" size={16} color={Colors.textInverse} />
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.grid}>
          {sorted.map((item) => (
            <View key={item.id} style={styles.gridItem}>
              <AppCard
                app={item}
                onPress={() => router.push(`/preview/${item.id}`)}
                onLongPress={() => deleteApp(item.id)}
              />
            </View>
          ))}
        </View>
      )}
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  scroll: {
    paddingTop: Spacing.md,
    paddingBottom: 200,
  },
  filterBar: {
    width: FILTER_BAR_WIDTH,
    alignSelf: 'center',
    marginBottom: Spacing.md,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.md,
    paddingHorizontal: Spacing.lg,
  },
  gridItem: {
    width: '48%',
  },
  empty: {
    alignItems: 'flex-start',
    backgroundColor: Colors.surfaceMuted,
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    marginHorizontal: Spacing.lg,
  },
  emptyIcon: {
    width: 48,
    height: 48,
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
    marginBottom: Spacing.md,
  },
  cta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    backgroundColor: Colors.primary,
    paddingVertical: 12,
    paddingHorizontal: 22,
    borderRadius: Radius.pill,
  },
  ctaText: {
    ...Type.button,
    fontSize: 14,
    color: Colors.textInverse,
  },
})
