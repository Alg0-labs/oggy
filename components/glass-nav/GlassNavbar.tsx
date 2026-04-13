import React from 'react'
import { Platform, StyleSheet, View } from 'react-native'
import { BlurView } from 'expo-blur'
import type { SharedValue } from 'react-native-reanimated'
import { AnimatedIndicator } from './AnimatedIndicator'
import { TabButton } from './TabButton'
import type { TabConfig } from './types'

interface GlassNavbarProps {
  tabs: TabConfig[]
  barWidth: number
  pageWidth: number
  scrollX: SharedValue<number>
  onTabPress: (index: number) => void
}

export const BAR_HEIGHT = 56
const BAR_PADDING = 6

/**
 * Floating frosted-glass bar — Apple-style translucent material with a
 * top-edge highlight, luminance band for depth, hairline border, and
 * soft drop shadow. The liquid indicator sits on the inner track.
 */
export function GlassNavbar({
  tabs,
  barWidth,
  pageWidth,
  scrollX,
  onTabPress,
}: GlassNavbarProps) {
  const innerWidth = barWidth - BAR_PADDING * 2
  const tabWidth = innerWidth / tabs.length
  const indicatorWidth = tabWidth - 8
  const indicatorHeight = BAR_HEIGHT - BAR_PADDING * 2

  return (
    <View style={[styles.wrap, { width: barWidth, height: BAR_HEIGHT }]}>
      <View style={styles.shadow} />
      <View style={styles.clip}>
        <BlurView
          intensity={Platform.OS === 'ios' ? 80 : 60}
          tint={
            Platform.OS === 'ios' ? 'systemChromeMaterialLight' : 'light'
          }
          {...(Platform.OS === 'android'
            ? ({ experimentalBlurMethod: 'dimezisBlurView' } as any)
            : {})}
          style={StyleSheet.absoluteFill}
        />
        <View style={styles.wash} />
        <View style={styles.topHighlight} />
        <View style={styles.luminance} />
        <View style={styles.hairline} />

        {/*
         * Indicator lives in its own absolutely-positioned container with
         * explicit insets — position:absolute ignores parent padding in RN,
         * so keeping the indicator inside the padded row would shift it by
         * BAR_PADDING. Both containers use the same inset so the pill sits
         * perfectly centred under each button.
         */}
        <View
          pointerEvents="none"
          style={[
            StyleSheet.absoluteFill,
            {
              top: BAR_PADDING,
              bottom: BAR_PADDING,
              left: BAR_PADDING,
              right: BAR_PADDING,
            },
          ]}
        >
          <AnimatedIndicator
            scrollX={scrollX}
            pageWidth={pageWidth}
            tabCount={tabs.length}
            tabWidth={tabWidth}
            indicatorWidth={indicatorWidth}
            height={indicatorHeight}
          />
        </View>

        {/* Buttons share the same inset via padding */}
        <View style={styles.row}>
          {tabs.map((t, i) => (
            <TabButton
              key={t.key}
              index={i}
              label={t.label}
              icon={t.icon}
              iconActive={t.iconActive}
              badge={t.badge}
              width={tabWidth}
              scrollX={scrollX}
              pageWidth={pageWidth}
              onPress={onTabPress}
            />
          ))}
        </View>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  wrap: {
    alignSelf: 'center',
  },
  shadow: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: BAR_HEIGHT / 2,
    backgroundColor: 'transparent',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 12 },
    elevation: 10,
  },
  clip: {
    flex: 1,
    borderRadius: BAR_HEIGHT / 2,
    overflow: 'hidden',
  },
  wash: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255,255,255,0.25)',
  },
  topHighlight: {
    position: 'absolute',
    top: 0,
    left: 16,
    right: 16,
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.85)',
  },
  luminance: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: BAR_HEIGHT * 0.45,
    backgroundColor: 'rgba(255,255,255,0.12)',
  },
  hairline: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: BAR_HEIGHT / 2,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(25,28,31,0.08)',
  },
  row: {
    flex: 1,
    flexDirection: 'row',
    padding: BAR_PADDING,
  },
})
