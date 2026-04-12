import React from 'react'
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { Colors, Radius, Spacing } from '../constants/theme'

type Provider = 'openai' | 'google' | 'anthropic'

const providers: { key: Provider; label: string; icon: string; color: string }[] = [
  { key: 'openai', label: 'OpenAI', icon: 'flash', color: Colors.providers.openai },
  { key: 'google', label: 'Gemini', icon: 'sparkles', color: Colors.providers.google },
  { key: 'anthropic', label: 'Claude', icon: 'diamond', color: Colors.providers.anthropic },
]

interface ProviderPillProps {
  selected: Provider
  onChange: (provider: Provider) => void
}

export function ProviderPill({ selected, onChange }: ProviderPillProps) {
  return (
    <View style={styles.container}>
      {providers.map((p) => {
        const active = selected === p.key
        return (
          <TouchableOpacity
            key={p.key}
            style={[
              styles.pill,
              active && { backgroundColor: p.color + '20', borderColor: p.color + '60' },
            ]}
            onPress={() => onChange(p.key)}
            activeOpacity={0.7}
          >
            <Ionicons
              name={p.icon as any}
              size={14}
              color={active ? p.color : Colors.textMuted}
            />
            <Text
              style={[
                styles.label,
                active && { color: p.color },
              ]}
            >
              {p.label}
            </Text>
          </TouchableOpacity>
        )
      })}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.surfaceElevated,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textMuted,
  },
})
