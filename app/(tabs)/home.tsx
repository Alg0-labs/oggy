import * as Haptics from 'expo-haptics'
import { BlurView } from 'expo-blur'
import { useRouter } from 'expo-router'
import React, { useCallback, useEffect, useState } from 'react'
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import Animated, {
  interpolate,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated'
import { DiscoverContent } from '../../components/home/DiscoverContent'
import { FollowingContent } from '../../components/home/FollowingContent'
import { GlassNavbar, BAR_HEIGHT } from '../../components/glass-nav/GlassNavbar'
import type { TabConfig } from '../../components/glass-nav/types'
import { mockProfile } from '../../constants/mockProfile'
import { Colors, Fonts, Radius, Spacing, Type } from '../../constants/theme'

type HomeTab = 'discover' | 'following'

const TOP_BAR_WIDTH = 240
const TOP_TABS: TabConfig[] = [
  {
    key: 'discover',
    label: 'Discover',
    icon: 'compass-outline',
    iconActive: 'compass',
  },
  {
    key: 'following',
    label: 'Following',
    icon: 'people-outline',
    iconActive: 'people',
  },
]

const BRAND_ROW_HEIGHT = 44
const NAV_TOP_GAP = Spacing.sm

// Minimum scroll delta before we commit to showing/hiding
const SCROLL_THRESHOLD = 8

export default function HomeScreen() {
  const insets = useSafeAreaInsets()
  const router = useRouter()
  const [tabIndex, setTabIndex] = useState(1)
  const tabPosition = useSharedValue(1)

  useEffect(() => {
    tabPosition.value = withSpring(tabIndex, {
      damping: 18,
      stiffness: 180,
      mass: 0.9,
    })
  }, [tabIndex]) // eslint-disable-line react-hooks/exhaustive-deps

  const onPressProfile = () => {
    Haptics.selectionAsync()
    router.push('/settings')
  }

  const onSelectTab = useCallback((index: number) => {
    setTabIndex(index)
  }, [])

  const currentTab: HomeTab = TOP_TABS[tabIndex]?.key as HomeTab

  // Total header height for translateY calculation
  const headerHeight = insets.top + BRAND_ROW_HEIGHT + NAV_TOP_GAP + BAR_HEIGHT + Spacing.sm
  const topClearance = headerHeight

  // ── Scroll-direction tracking ──────────────────────────────────────────────
  // 0 = fully visible, 1 = fully hidden
  const headerHidden = useSharedValue(0)
  const lastScrollY = useSharedValue(0)
  const scrollDirection = useSharedValue(0) // cumulative delta

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (e) => {
      const y = e.contentOffset.y
      const delta = y - lastScrollY.value
      lastScrollY.value = y

      // Near the top — always show
      if (y < 10) {
        headerHidden.value = withTiming(0, { duration: 220 })
        scrollDirection.value = 0
        return
      }

      scrollDirection.value += delta

      if (scrollDirection.value > SCROLL_THRESHOLD) {
        // Scrolling down past threshold — hide
        headerHidden.value = withTiming(1, { duration: 260 })
        scrollDirection.value = 0
      } else if (scrollDirection.value < -SCROLL_THRESHOLD) {
        // Scrolling up past threshold — show
        headerHidden.value = withTiming(0, { duration: 220 })
        scrollDirection.value = 0
      }
    },
  })

  // Only the segment pill hides — slides up behind the brand bar and fades
  const segmentAnimStyle = useAnimatedStyle(() => ({
    transform: [
      {
        translateY: interpolate(
          headerHidden.value,
          [0, 1],
          [0, -(BAR_HEIGHT + NAV_TOP_GAP + Spacing.sm)],
        ),
      },
    ],
    opacity: interpolate(headerHidden.value, [0, 0.6], [1, 0]),
  }))

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        {currentTab === 'discover' && (
          <DiscoverContent topInset={topClearance} onScroll={scrollHandler} />
        )}
        {currentTab === 'following' && (
          <FollowingContent topInset={topClearance} onScroll={scrollHandler} />
        )}
      </View>

      {/* Floating header */}
      <View
        pointerEvents="box-none"
        style={styles.headerFloat}
      >
        {/* Brand row — always visible */}
        <View style={[styles.topBar, { paddingTop: insets.top }]}>
          <BlurView tint="light" intensity={80} style={StyleSheet.absoluteFill} />
          <View style={styles.brandWash} />
          <Text style={styles.brand}>oggy.</Text>
          <TouchableOpacity
            activeOpacity={0.8}
            hitSlop={8}
            onPress={onPressProfile}
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

        {/* Segment pill — slides up on scroll down */}
        <Animated.View style={[styles.segmentWrap, segmentAnimStyle]} pointerEvents="box-none">
          <GlassNavbar
            tabs={TOP_TABS}
            barWidth={TOP_BAR_WIDTH}
            pageWidth={1}
            scrollX={tabPosition}
            onTabPress={onSelectTab}
          />
        </Animated.View>
      </View>

    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.bg,
  },
  content: {
    flex: 1,
  },
  headerFloat: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.sm,
    overflow: 'hidden',
  },
  brandWash: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255,255,255,0.45)',
  },
  brand: {
    ...Type.heading2,
    color: Colors.text,
    letterSpacing: -0.8,
  },
  profileAvatar: {
    width: 36,
    height: 36,
    borderRadius: Radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: Colors.bg,
  },
  profileInitials: {
    fontFamily: Fonts.sansBold,
    fontSize: 13,
    color: Colors.textInverse,
    letterSpacing: 0.2,
  },
  segmentWrap: {
    paddingLeft: Spacing.lg,
    marginTop: NAV_TOP_GAP,
    alignItems: 'flex-start',
  },
})
