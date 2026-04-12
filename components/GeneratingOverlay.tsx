import React, { useEffect, useRef } from 'react'
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Easing,
} from 'react-native'
import { Colors, Radius, Spacing } from '../constants/theme'

interface GeneratingOverlayProps {
  visible: boolean
  provider: string
}

const providerLabels: Record<string, string> = {
  openai: 'OpenAI',
  google: 'Gemini',
  anthropic: 'Claude',
}

export function GeneratingOverlay({ visible, provider }: GeneratingOverlayProps) {
  const spin = useRef(new Animated.Value(0)).current
  const pulse = useRef(new Animated.Value(0.6)).current

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
          duration: 800,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulse, {
          toValue: 0.6,
          duration: 800,
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
          style={[
            styles.spinner,
            { transform: [{ rotate: rotation }] },
          ]}
        >
          <View style={styles.spinnerArc} />
        </Animated.View>

        <Animated.Text style={[styles.title, { opacity: pulse }]}>
          Generating...
        </Animated.Text>
        <Text style={styles.subtitle}>
          {providerLabels[provider] || provider} is building your app
        </Text>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(10, 10, 15, 0.92)',
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
    marginBottom: Spacing.lg,
  },
  spinnerArc: {
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: 3,
    borderColor: Colors.border,
    borderTopColor: Colors.primary,
    borderRightColor: Colors.primary,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: Spacing.xs,
  },
  subtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
})
