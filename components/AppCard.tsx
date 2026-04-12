import React from 'react'
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { SavedApp } from '../store/appStore'
import { Colors, Radius, Spacing } from '../constants/theme'

const CARD_GAP = Spacing.md
const CARD_WIDTH = (Dimensions.get('window').width - Spacing.lg * 2 - CARD_GAP) / 2

const providerIcons: Record<string, { icon: string; color: string }> = {
  openai: { icon: 'flash', color: Colors.providers.openai },
  google: { icon: 'sparkles', color: Colors.providers.google },
  anthropic: { icon: 'diamond', color: Colors.providers.anthropic },
}

interface AppCardProps {
  app: SavedApp
  onPress: () => void
  onLongPress?: () => void
}

export function AppCard({ app, onPress, onLongPress }: AppCardProps) {
  const provider = providerIcons[app.modelUsed] || providerIcons.openai
  const date = new Date(app.createdDate)
  const dateStr = date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  })

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={onPress}
      onLongPress={onLongPress}
      activeOpacity={0.7}
    >
      <View style={styles.iconRow}>
        <View style={[styles.providerDot, { backgroundColor: provider.color }]}>
          <Ionicons
            name={provider.icon as any}
            size={12}
            color="#FFF"
          />
        </View>
        {app.status === 'error' && (
          <Ionicons name="alert-circle" size={16} color={Colors.error} />
        )}
      </View>

      <Text style={styles.name} numberOfLines={2}>
        {app.name}
      </Text>

      <Text style={styles.prompt} numberOfLines={2}>
        {app.prompt}
      </Text>

      <Text style={styles.date}>{dateStr}</Text>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  card: {
    width: CARD_WIDTH,
    backgroundColor: Colors.card,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: CARD_GAP,
    minHeight: 140,
    justifyContent: 'space-between',
  },
  iconRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  providerDot: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  name: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 4,
    letterSpacing: -0.2,
  },
  prompt: {
    fontSize: 12,
    color: Colors.textSecondary,
    lineHeight: 16,
    marginBottom: Spacing.sm,
  },
  date: {
    fontSize: 11,
    color: Colors.textMuted,
  },
})
