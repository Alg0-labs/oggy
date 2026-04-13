import React from 'react'
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { Colors, Radius, Spacing, Type } from '../constants/theme'

type Provider = 'openai' | 'google' | 'anthropic'

const providers: { key: Provider; label: string; icon: string }[] = [
  { key: 'openai', label: 'OpenAI', icon: 'flash' },
  { key: 'google', label: 'Gemini', icon: 'sparkles' },
  { key: 'anthropic', label: 'Claude', icon: 'diamond' },
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
              active ? styles.pillActive : styles.pillInactive,
            ]}
            onPress={() => onChange(p.key)}
            activeOpacity={0.85}
          >
            <Ionicons
              name={p.icon as any}
              size={14}
              color={active ? Colors.textInverse : Colors.text}
            />
            <Text
              style={[
                styles.label,
                { color: active ? Colors.textInverse : Colors.text },
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
    flexWrap: 'wrap',
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: Radius.pill,
    borderWidth: 2,
  },
  pillActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  pillInactive: {
    backgroundColor: 'transparent',
    borderColor: Colors.primary,
  },
  label: {
    ...Type.button,
    fontSize: 14,
  },
})
