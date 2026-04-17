import React, { useEffect, useRef } from 'react'
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Easing,
} from 'react-native'
import { Colors, Radius, Spacing, Type } from '../constants/theme'

interface GeneratingOverlayProps {
  visible: boolean
  provider: string
}

const providerLabels: Record<string, string> = {
  openai: 'OpenAI',
  google: 'Gemini',
  anthropic: 'Claude',
  offline: 'Gemma (On-Device)',
}

export function GeneratingOverlay({ visible, provider }: GeneratingOverlayProps) {
  const spin = useRef(new Animated.Value(0)).current
  const pulse = useRef(new Animated.Value(0.65)).current

  useEffect(() => {
    if (!visible) return

    const spinAnim = Animated.loop(
      Animated.timing(spin, {
        toValue: 1,
        duration: 2000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    )

    const pulseAnim = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: 1,
          duration: 900,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulse, {
          toValue: 0.65,
          duration: 900,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    )

    spinAnim.start()
    pulseAnim.start()

    return () => {
      spinAnim.stop()
      pulseAnim.stop()
    }
  }, [visible, spin, pulse])

  if (!visible) return null

  const rotation = spin.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  })

  return (
    <View style={styles.overlay}>
      <View style={styles.content}>
        <Animated.View
          style={[styles.spinner, { transform: [{ rotate: rotation }] }]}
        >
          <View style={styles.spinnerArc} />
        </Animated.View>

        <Animated.Text style={[styles.title, { opacity: pulse }]}>
          Generating
        </Animated.Text>
        <Text style={styles.subtitle}>
          {providerLabels[provider] || provider} is building your app
        </Text>

        <View style={styles.badge}>
          <View style={styles.dot} />
          <Text style={styles.badgeText}>Live</Text>
        </View>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: Colors.bgDark,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 100,
  },
  content: {
    alignItems: 'center',
  },
  spinner: {
    width: 56,
    height: 56,
    marginBottom: Spacing.xl,
  },
  spinnerArc: {
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: 3,
    borderColor: 'rgba(244, 244, 244, 0.2)',
    borderTopColor: Colors.textInverse,
    borderRightColor: Colors.textInverse,
  },
  title: {
    ...Type.display,
    color: Colors.textInverse,
    fontSize: 40,
    lineHeight: 44,
    marginBottom: Spacing.sm,
  },
  subtitle: {
    ...Type.body,
    color: 'rgba(244, 244, 244, 0.65)',
    marginBottom: Spacing.xl,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: Radius.pill,
    backgroundColor: Colors.ghostOnDark,
    borderWidth: 2,
    borderColor: 'rgba(244, 244, 244, 0.3)',
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.teal,
  },
  badgeText: {
    ...Type.micro,
    color: Colors.textInverse,
  },
})
