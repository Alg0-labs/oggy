import React, { useEffect, useRef, useState } from 'react'
import { View, Text, StyleSheet, TouchableOpacity, Animated, Easing } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { Colors, Fonts, Radius, Spacing, Type } from '../constants/theme'
import { ChatMessage } from '../store/appStore'

interface Props {
  message: ChatMessage
  onCancel?: () => void
}

const providerMeta: Record<string, { label: string; color: string }> = {
  openai: { label: 'OpenAI', color: Colors.providers.openai },
  google: { label: 'Gemini', color: Colors.providers.google },
  anthropic: { label: 'Claude', color: Colors.providers.anthropic },
}

function formatEta(ms: number): string {
  if (ms <= 0) return 'any moment now'
  const s = Math.ceil(ms / 1000)
  if (s < 60) return `~${s}s remaining`
  const m = Math.floor(s / 60)
  const rem = s % 60
  return rem ? `~${m}m ${rem}s remaining` : `~${m}m remaining`
}

export function GeneratingMessage({ message, onCancel }: Props) {
  const shimmer = useRef(new Animated.Value(0)).current
  const dotPulse = useRef(new Animated.Value(0.3)).current

  const [remaining, setRemaining] = useState<number>(() => {
    if (!message.startedAt || !message.estimatedMs) return 0
    return Math.max(0, message.startedAt + message.estimatedMs - Date.now())
  })

  useEffect(() => {
    const shim = Animated.loop(
      Animated.timing(shimmer, {
        toValue: 1,
        duration: 1600,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    )
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(dotPulse, {
          toValue: 1,
          duration: 700,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(dotPulse, {
          toValue: 0.3,
          duration: 700,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    )
    shim.start()
    pulse.start()
    return () => {
      shim.stop()
      pulse.stop()
    }
  }, [shimmer, dotPulse])

  useEffect(() => {
    if (!message.startedAt || !message.estimatedMs) return
    const interval = setInterval(() => {
      setRemaining(Math.max(0, message.startedAt! + message.estimatedMs! - Date.now()))
    }, 500)
    return () => clearInterval(interval)
  }, [message.startedAt, message.estimatedMs])

  const meta = providerMeta[message.provider || ''] || { label: 'Generating', color: Colors.primary }

  const shimmerTranslate = shimmer.interpolate({
    inputRange: [0, 1],
    outputRange: [-160, 320],
  })

  return (
    <View style={styles.container}>
      <View style={styles.topRow}>
        <View style={styles.providerTag}>
          <Animated.View style={[styles.dot, { backgroundColor: meta.color, opacity: dotPulse }]} />
          <Text style={styles.providerLabel}>{meta.label}</Text>
        </View>
        {onCancel && (
          <TouchableOpacity onPress={onCancel} hitSlop={8} activeOpacity={0.7} style={styles.cancelBtn}>
            <Ionicons name="close" size={12} color={Colors.textSecondary} />
            <Text style={styles.cancelLabel}>Cancel</Text>
          </TouchableOpacity>
        )}
      </View>

      <Text style={styles.title}>Generating your app</Text>
      <Text style={styles.eta}>{formatEta(remaining)}</Text>

      <View style={styles.progressTrack}>
        <Animated.View
          style={[
            styles.progressShimmer,
            { transform: [{ translateX: shimmerTranslate }] },
          ]}
        />
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    alignSelf: 'stretch',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: Radius.lg,
    backgroundColor: Colors.surfaceMuted,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 4,
    overflow: 'hidden',
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 2,
  },
  providerTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  providerLabel: {
    ...Type.micro,
    color: Colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  cancelBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: Radius.pill,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  cancelLabel: {
    fontFamily: Fonts.sansSemi,
    fontSize: 11,
    color: Colors.textSecondary,
    letterSpacing: 0.3,
  },
  title: {
    ...Type.heading3,
    color: Colors.text,
    fontSize: 17,
    lineHeight: 22,
    marginTop: 4,
  },
  eta: {
    ...Type.bodySmall,
    color: Colors.textSecondary,
    marginBottom: 10,
  },
  progressTrack: {
    height: 3,
    borderRadius: 2,
    backgroundColor: Colors.border,
    overflow: 'hidden',
  },
  progressShimmer: {
    width: 120,
    height: 3,
    borderRadius: 2,
    backgroundColor: Colors.primary,
  },
})
