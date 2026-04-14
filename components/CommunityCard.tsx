import React from 'react'
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { CommunityApp } from '../constants/mockCommunity'
import { Colors, Radius, Spacing, Type } from '../constants/theme'

const CARD_GAP = Spacing.md
const CARD_WIDTH = (Dimensions.get('window').width - Spacing.lg * 2 - CARD_GAP) / 2

const providerMeta: Record<string, { icon: string; color: string; label: string }> = {
  openai: { icon: 'flash', color: Colors.providers.openai, label: 'OpenAI' },
  google: { icon: 'sparkles', color: Colors.providers.google, label: 'Gemini' },
  anthropic: { icon: 'diamond', color: Colors.providers.anthropic, label: 'Claude' },
}

function formatCount(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`
  return `${n}`
}

interface CommunityCardProps {
  app: CommunityApp
  onPress?: () => void
  onRemix?: () => void
}

export function CommunityCard({ app, onPress, onRemix }: CommunityCardProps) {
  const provider = providerMeta[app.modelUsed]

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={onPress}
      activeOpacity={0.9}
    >
      <View style={styles.topRow}>
        <View style={[styles.providerPill, { backgroundColor: provider.color }]}>
          <Ionicons name={provider.icon as any} size={10} color={Colors.textInverse} />
          <Text style={styles.providerLabel}>{provider.label}</Text>
        </View>
        {app.featured && (
          <View style={styles.featuredDot}>
            <Ionicons name="star" size={10} color={Colors.text} />
          </View>
        )}
      </View>

      <View style={styles.body}>
        <Text style={styles.name} numberOfLines={2}>
          {app.name}
        </Text>
        <Text style={styles.prompt} numberOfLines={2}>
          {app.prompt}
        </Text>
      </View>

      <View style={styles.authorRow}>
        <View style={[styles.avatar, { backgroundColor: app.author.avatarColor }]}>
          <Text style={styles.avatarText}>{app.author.avatarInitials}</Text>
        </View>
        <Text style={styles.authorHandle} numberOfLines={1}>
          {app.author.handle}
        </Text>
      </View>

      <View style={styles.footer}>
        <View style={styles.metric}>
          <Ionicons name="heart" size={12} color={Colors.pink} />
          <Text style={styles.metricText}>{formatCount(app.likes)}</Text>
        </View>
        <View style={styles.metric}>
          <Ionicons name="git-branch" size={12} color={Colors.textSecondary} />
          <Text style={styles.metricText}>{formatCount(app.remixes)}</Text>
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
    minHeight: 220,
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
  featuredDot: {
    width: 22,
    height: 22,
    borderRadius: Radius.pill,
    backgroundColor: Colors.bg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  body: {
    flex: 1,
    marginBottom: Spacing.sm,
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
  authorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: Spacing.sm,
  },
  avatar: {
    width: 20,
    height: 20,
    borderRadius: Radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 9,
    fontWeight: '700',
    color: Colors.textInverse,
    letterSpacing: 0.2,
  },
  authorHandle: {
    ...Type.bodySmall,
    fontSize: 12,
    color: Colors.text,
    fontWeight: '600',
    flexShrink: 1,
  },
  footer: {
    flexDirection: 'row',
    gap: Spacing.md,
    alignItems: 'center',
  },
  metric: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metricText: {
    ...Type.bodySmall,
    fontSize: 12,
    color: Colors.textSecondary,
    fontWeight: '600',
  },
})
