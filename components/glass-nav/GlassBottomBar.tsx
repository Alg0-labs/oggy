import { Ionicons } from '@expo/vector-icons'
import { BlurView } from 'expo-blur'
import { useRouter } from 'expo-router'
import React, { useCallback, useEffect } from 'react'
import { Dimensions, Platform, StyleSheet, TouchableOpacity, View } from 'react-native'
import { useSharedValue, withSpring } from 'react-native-reanimated'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs'
import { GlassNavbar, BAR_HEIGHT } from './GlassNavbar'
import type { IoniconName, TabConfig } from './types'
import { Colors } from '../../constants/theme'

const SIDE_INSET = 24
const GAP = 12

export interface BottomTabConfig {
  icon: IoniconName
  iconActive: IoniconName
  label: string
}

interface Props extends BottomTabBarProps {
  tabConfigs: Record<string, BottomTabConfig>
}

export function GlassBottomBar({ state, navigation, tabConfigs }: Props) {
  const insets = useSafeAreaInsets()
  const router = useRouter()
  const screenWidth = Dimensions.get('window').width

  // The navbar takes the remaining width after the FAB + gaps
  const fabSize = BAR_HEIGHT
  const barWidth = screenWidth - SIDE_INSET * 2 - fabSize - GAP

  const visibleRoutes = state.routes.filter((r) => tabConfigs[r.name])
  const activeVisibleIndex = Math.max(
    0,
    visibleRoutes.findIndex((r) => r.key === state.routes[state.index]?.key),
  )

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
      {/* Glass navbar — left-aligned */}
      <GlassNavbar
        tabs={tabs}
        barWidth={barWidth}
        pageWidth={1}
        scrollX={tabPosition}
        onTabPress={onTabPress}
      />

      {/* Plus button — glass style matching the navbar */}
      <TouchableOpacity
        style={styles.fabWrap}
        onPress={() => router.push('/create')}
        activeOpacity={0.85}
      >
        <View style={styles.fabShadow} />
        <View style={styles.fabClip}>
          <BlurView
            intensity={Platform.OS === 'ios' ? 80 : 60}
            tint="dark"
            {...(Platform.OS === 'android'
              ? ({ experimentalBlurMethod: 'dimezisBlurView' } as any)
              : {})}
            style={StyleSheet.absoluteFill}
          />
          <View style={styles.fabWash} />
          <View style={styles.fabHighlight} />
          <View style={styles.fabHairline} />
          <Ionicons name="add" size={24} color={Colors.textInverse} />
        </View>
      </TouchableOpacity>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: SIDE_INSET,
    right: SIDE_INSET,
    flexDirection: 'row',
    alignItems: 'center',
    gap: GAP,
  },
  fabWrap: {
    width: BAR_HEIGHT,
    height: BAR_HEIGHT,
  },
  fabShadow: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: BAR_HEIGHT / 2,
    backgroundColor: 'transparent',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 12 },
    elevation: 10,
  },
  fabClip: {
    flex: 1,
    borderRadius: BAR_HEIGHT / 2,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  fabWash: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.55)',
  },
  fabHighlight: {
    position: 'absolute',
    top: 0,
    left: 8,
    right: 8,
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.15)',
  },
  fabHairline: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: BAR_HEIGHT / 2,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255,255,255,0.12)',
  },
})
