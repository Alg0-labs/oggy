import React, { useMemo } from 'react'
import {
  Dimensions,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native'
import Animated from 'react-native-reanimated'
import type { AnimatedScrollViewProps } from 'react-native-reanimated'
import { Ionicons } from '@expo/vector-icons'
import { ExpandableCategorySection } from '../ExpandableCategorySection'
import { PopularCard } from '../PopularCard'
import {
  AppCategory,
  communityApps,
  featuredCategories,
} from '../../constants/mockCommunity'
import { Colors, Spacing, Type } from '../../constants/theme'

const SCREEN_WIDTH = Dimensions.get('window').width
const POPULAR_CARD_WIDTH = SCREEN_WIDTH - Spacing.lg * 2

interface DiscoverContentProps {
  topInset?: number
  onScroll?: AnimatedScrollViewProps['onScroll']
}

export function DiscoverContent({ topInset = 0, onScroll }: DiscoverContentProps) {
  const popular = useMemo(
    () => [...communityApps].sort((a, b) => b.likes - a.likes).slice(0, 4),
    [],
  )

  const byCategory = useMemo(() => {
    const map: Partial<Record<AppCategory, typeof communityApps>> = {}
    for (const a of communityApps) {
      if (!map[a.category]) map[a.category] = []
      map[a.category]!.push(a)
    }
    return map
  }, [])

  return (
    <Animated.ScrollView
      contentContainerStyle={[styles.scroll, { paddingTop: topInset + Spacing.md }]}
      showsVerticalScrollIndicator={false}
      onScroll={onScroll}
      scrollEventThrottle={16}
    >
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
        const items = byCategory[cat]
        if (!items.length) return null
        return (
          <ExpandableCategorySection key={cat} title={cat} apps={items} />
        )
      })}
    </Animated.ScrollView>
  )
}

const styles = StyleSheet.create({
  scroll: {
    paddingBottom: 200,
  },
  popularBlock: {
    marginBottom: Spacing.lg,
  },
  sectionHeadRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.md,
  },
  sectionLabel: {
    ...Type.micro,
    color: Colors.textMuted,
    textTransform: 'uppercase',
  },
  popularScroll: {
    paddingHorizontal: Spacing.lg,
    gap: Spacing.md,
  },
})
