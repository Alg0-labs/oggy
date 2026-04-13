import React, { useCallback } from 'react'
import { Pressable, StyleSheet, Text, View } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import * as Haptics from 'expo-haptics'
import Animated, {
  interpolate,
  SharedValue,
  useAnimatedStyle,
  Extrapolation,
} from 'react-native-reanimated'
import { Colors, Fonts } from '../../constants/theme'
import type { IoniconName } from './types'

interface TabButtonProps {
  index: number
  label: string
  icon: IoniconName
  iconActive?: IoniconName
  badge?: number
  width: number
  scrollX: SharedValue<number>
  pageWidth: number
  onPress: (index: number) => void
}

/**
 * A single tab whose icon/label emphasis cross-fades driven by scroll
 * progress. Distance from its own index determines emphasis — symmetric
 * regardless of swipe direction.
 */
export function TabButton({
  index,
  label,
  icon,
  iconActive,
  badge,
  width,
  scrollX,
  pageWidth,
  onPress,
}: TabButtonProps) {
  const handlePress = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
    onPress(index)
  }, [index, onPress])

  const animStyle = useAnimatedStyle(() => {
    const distance = Math.abs(scrollX.value / pageWidth - index)
    const emphasis = interpolate(distance, [0, 1], [1, 0], Extrapolation.CLAMP)
    return {
      opacity: interpolate(distance, [0, 1], [1, 0.5], Extrapolation.CLAMP),
      transform: [{ scale: 0.96 + emphasis * 0.04 }],
    }
  })

  const activeIconStyle = useAnimatedStyle(() => {
    const distance = Math.abs(scrollX.value / pageWidth - index)
    return {
      opacity: interpolate(distance, [0, 0.5], [1, 0], Extrapolation.CLAMP),
    }
  })

  const inactiveIconStyle = useAnimatedStyle(() => {
    const distance = Math.abs(scrollX.value / pageWidth - index)
    return {
      opacity: interpolate(distance, [0, 0.5], [0, 1], Extrapolation.CLAMP),
    }
  })

  return (
    <Pressable onPress={handlePress} style={[styles.btn, { width }]} hitSlop={8}>
      <Animated.View style={[styles.content, animStyle]}>
        <View style={styles.iconWrap}>
          <Animated.View style={[styles.iconLayer, activeIconStyle]}>
            <Ionicons name={iconActive ?? icon} size={18} color={Colors.text} />
          </Animated.View>
          <Animated.View style={[styles.iconLayer, inactiveIconStyle]}>
            <Ionicons name={icon} size={18} color="rgba(25,28,31,0.5)" />
          </Animated.View>
        </View>
        <Text style={styles.label} numberOfLines={1}>
          {label}
        </Text>
        {badge != null && badge > 0 && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{badge}</Text>
          </View>
        )}
      </Animated.View>
    </Pressable>
  )
}

const styles = StyleSheet.create({
  btn: {
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
  },
  iconWrap: {
    width: 18,
    height: 18,
  },
  iconLayer: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    fontFamily: Fonts.sansSemi,
    fontSize: 13,
    letterSpacing: -0.1,
    color: Colors.text,
  },
  badge: {
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 5,
  },
  badgeText: {
    fontFamily: Fonts.sansBold,
    fontSize: 10,
    color: Colors.textInverse,
  },
})
