import React, { useEffect, useRef } from 'react'
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Animated,
  Easing,
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { SavedApp, isAppGenerating } from '../store/appStore'
import { Colors, Radius, Spacing, Type } from '../constants/theme'

const CARD_GAP = Spacing.md
const CARD_WIDTH = (Dimensions.get('window').width - Spacing.lg * 2 - CARD_GAP) / 2

const providerMeta: Record<string, { icon: string; color: string; label: string }> = {
  openai: { icon: 'flash', color: Colors.providers.openai, label: 'OpenAI' },
  google: { icon: 'sparkles', color: Colors.providers.google, label: 'Gemini' },
  anthropic: { icon: 'diamond', color: Colors.providers.anthropic, label: 'Claude' },
}

interface AppCardProps {
  app: SavedApp
  onPress: () => void
  onLongPress?: () => void
}

export function AppCard({ app, onPress, onLongPress }: AppCardProps) {
  const provider = providerMeta[app.modelUsed] || providerMeta.openai
  const date = new Date(app.createdDate)
  const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })

  const generating = isAppGenerating(app)
  const firstUserMsg = app.messages.find((m) => m.role === 'user')
  const promptPreview = firstUserMsg?.content || ''
  const hasError =
    !generating &&
    app.messages.some((m) => m.status === 'error' || m.status === 'cancelled') &&
    !app.currentJSX

  const pulse = useRef(new Animated.Value(0.4)).current
  useEffect(() => {
    if (!generating) return
    const anim = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: 1,
          duration: 750,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulse, {
          toValue: 0.4,
          duration: 750,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    )
    anim.start()
    return () => anim.stop()
  }, [generating, pulse])

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={onPress}
      onLongPress={onLongPress}
      activeOpacity={0.85}
    >
      <View style={styles.topRow}>
        <View style={[styles.providerPill, { backgroundColor: provider.color }]}>
          <Ionicons name={provider.icon as any} size={10} color={Colors.textInverse} />
          <Text style={styles.providerLabel}>{provider.label}</Text>
        </View>
        <View style={styles.topRight}>
          {generating && (
            <View style={styles.genPill}>
              <Animated.View style={[styles.genDot, { opacity: pulse }]} />
              <Text style={styles.genLabel}>Generating</Text>
            </View>
          )}
          {hasError && !generating && (
            <Ionicons name="alert-circle" size={16} color={Colors.danger} />
          )}
          <View
            style={[
              styles.visibilityPill,
              app.visibility === 'public' ? styles.visibilityPublic : styles.visibilityPrivate,
            ]}
          >
            <Ionicons
              name={app.visibility === 'public' ? 'globe-outline' : 'lock-closed'}
              size={10}
              color={app.visibility === 'public' ? Colors.textInverse : Colors.text}
            />
          </View>
        </View>
      </View>

      <View style={styles.body}>
        <Text style={styles.name} numberOfLines={2}>
          {app.name}
        </Text>
        <Text style={styles.prompt} numberOfLines={3}>
          {promptPreview}
        </Text>
      </View>

      <View style={styles.footer}>
        <Text style={styles.date}>{dateStr}</Text>
        <View style={styles.openDot}>
          <Ionicons name="arrow-forward" size={12} color={Colors.text} />
        </View>
      </View>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  card: {
    width: CARD_WIDTH,
    backgroundColor: Colors.surfaceMuted,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    marginBottom: CARD_GAP,
    minHeight: 180,
    justifyContent: 'space-between',
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  providerPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: Radius.pill,
  },
  providerLabel: {
    ...Type.micro,
    color: Colors.textInverse,
    fontSize: 10,
    letterSpacing: 0.6,
  },
  topRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  genPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: Radius.pill,
    backgroundColor: Colors.bg,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  genDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.primary,
  },
  genLabel: {
    ...Type.micro,
    color: Colors.text,
    fontSize: 10,
  },
  visibilityPill: {
    width: 22,
    height: 22,
    borderRadius: Radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  visibilityPublic: {
    backgroundColor: Colors.primary,
  },
  visibilityPrivate: {
    backgroundColor: Colors.bg,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  body: {
    flex: 1,
    marginBottom: Spacing.md,
  },
  name: {
    ...Type.heading3,
    color: Colors.text,
    marginBottom: Spacing.xs,
  },
  prompt: {
    ...Type.bodySmall,
    color: Colors.textSecondary,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  date: {
    ...Type.bodySmall,
    color: Colors.textMuted,
    fontSize: 12,
  },
  openDot: {
    width: 28,
    height: 28,
    borderRadius: Radius.pill,
    backgroundColor: Colors.bg,
    alignItems: 'center',
    justifyContent: 'center',
  },
})
