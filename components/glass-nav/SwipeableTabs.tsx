import React, { useCallback, useRef, useState } from 'react'
import { Dimensions, StyleSheet, View } from 'react-native'
import Animated, {
  useAnimatedScrollHandler,
  useSharedValue,
} from 'react-native-reanimated'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { GlassNavbar, BAR_HEIGHT } from './GlassNavbar'
import type { TabConfig } from './types'

export { BAR_HEIGHT }

interface SwipeableTabsProps {
  tabs: TabConfig[]
  initialIndex?: number
  barInset?: number
  barTopOffset?: number
  onTabChange?: (index: number) => void
}

/**
 * Full tab host: horizontal pager + floating top glass navbar.
 *
 * The navbar's liquid indicator is driven by the pager's raw scroll offset
 * via `useAnimatedScrollHandler` on the UI thread — tap and swipe produce
 * identical motion because taps animate the same ScrollView that the swipe
 * gesture controls.
 */
export function SwipeableTabs({
  tabs,
  initialIndex = 0,
  barInset = 20,
  barTopOffset = 8,
  onTabChange,
}: SwipeableTabsProps) {
  const insets = useSafeAreaInsets()
  const pageWidth = Dimensions.get('window').width
  const barWidth = pageWidth - barInset * 2
  const [pageHeight, setPageHeight] = useState(
    Dimensions.get('window').height,
  )

  const scrollX = useSharedValue(initialIndex * pageWidth)
  const scrollRef = useRef<Animated.ScrollView>(null)
  const [activeIndex, setActiveIndex] = useState(initialIndex)

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (e) => {
      scrollX.value = e.contentOffset.x
    },
  })

  const onTabPress = useCallback(
    (index: number) => {
      scrollRef.current?.scrollTo({ x: index * pageWidth, animated: true })
      setActiveIndex(index)
      onTabChange?.(index)
    },
    [pageWidth, onTabChange],
  )

  const onMomentumEnd = useCallback(
    (x: number) => {
      const idx = Math.round(x / pageWidth)
      if (idx !== activeIndex) {
        setActiveIndex(idx)
        onTabChange?.(idx)
      }
    },
    [pageWidth, activeIndex, onTabChange],
  )

  return (
    <View
      style={styles.root}
      onLayout={(e) => setPageHeight(e.nativeEvent.layout.height)}
    >
      <Animated.ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={scrollHandler}
        onMomentumScrollEnd={(e) =>
          onMomentumEnd(e.nativeEvent.contentOffset.x)
        }
        scrollEventThrottle={16}
        decelerationRate="fast"
        bounces={false}
        contentOffset={{ x: initialIndex * pageWidth, y: 0 }}
        style={styles.pager}
      >
        {tabs.map((t) => (
          <View key={t.key} style={{ width: pageWidth, height: pageHeight }}>
            {t.render?.()}
          </View>
        ))}
      </Animated.ScrollView>

      <View
        pointerEvents="box-none"
        style={[
          styles.navbarContainer,
          { top: insets.top + barTopOffset, paddingHorizontal: barInset },
        ]}
      >
        <GlassNavbar
          tabs={tabs}
          barWidth={barWidth}
          pageWidth={pageWidth}
          scrollX={scrollX}
          onTabPress={onTabPress}
        />
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  pager: {
    flex: 1,
  },
  navbarContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    alignItems: 'center',
  },
})
