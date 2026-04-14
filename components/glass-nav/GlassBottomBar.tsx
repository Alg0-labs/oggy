import React, { useCallback, useEffect } from 'react'
import { Dimensions, StyleSheet, View } from 'react-native'
import { useSharedValue, withSpring } from 'react-native-reanimated'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs'
import { GlassNavbar } from './GlassNavbar'
import type { IoniconName, TabConfig } from './types'

const BAR_INSET = 50

export interface BottomTabConfig {
  icon: IoniconName
  iconActive: IoniconName
  label: string
}

interface Props extends BottomTabBarProps {
  tabConfigs: Record<string, BottomTabConfig>
}

/**
 * Drop-in Expo Router bottom tab bar that reuses GlassNavbar 1:1.
 *
 * The key trick: we pass `pageWidth={1}` to GlassNavbar and spring-animate
 * a shared value between integer tab indices (0, 1, 2…). Because
 * `progress = scrollX / pageWidth = tabPosition / 1 = tabPosition`,
 * all the indicator math and TabButton emphasis work identically to the
 * scroll-driven top navbar — no code duplication at all.
 */
export function GlassBottomBar({ state, navigation, tabConfigs }: Props) {
  const insets = useSafeAreaInsets()
  const barWidth = Dimensions.get('window').width - BAR_INSET * 2

  const visibleRoutes = state.routes.filter((r) => tabConfigs[r.name])
  const activeVisibleIndex = Math.max(
    0,
    visibleRoutes.findIndex((r) => r.key === state.routes[state.index]?.key),
  )

  // Springs between tab indices. pageWidth=1 so this IS the progress value.
  const tabPosition = useSharedValue<number>(activeVisibleIndex)

  useEffect(() => {
    tabPosition.value = withSpring(activeVisibleIndex, {
      damping: 18,
      stiffness: 180,
      mass: 0.9,
    })
  }, [activeVisibleIndex]) // eslint-disable-line react-hooks/exhaustive-deps

  const tabs: TabConfig[] = visibleRoutes.map((route) => {
    const cfg = tabConfigs[route.name]
    return {
      key: route.key,
      label: cfg.label,
      icon: cfg.icon,
      iconActive: cfg.iconActive,
    }
  })

  const onTabPress = useCallback(
    (index: number) => {
      const route = visibleRoutes[index]
      if (!route) return
      const event = navigation.emit({
        type: 'tabPress',
        target: route.key,
        canPreventDefault: true,
      })
      if (!event.defaultPrevented) {
        navigation.navigate(route.name, undefined)
      }
    },
    [visibleRoutes, navigation],
  )

  return (
    <View
      pointerEvents="box-none"
      style={[styles.container, { bottom: Math.max(insets.bottom, 12) }]}
    >
      <GlassNavbar
        tabs={tabs}
        barWidth={barWidth}
        pageWidth={1}
        scrollX={tabPosition}
        onTabPress={onTabPress}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: BAR_INSET,
    right: BAR_INSET,
    alignItems: 'center',
  },
})
