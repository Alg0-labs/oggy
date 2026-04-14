import React from 'react'
import { View, StyleSheet } from 'react-native'
import { PillButton } from './ui'
import { Spacing } from '../constants/theme'

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
      {providers.map((p) => (
        <PillButton
          key={p.key}
          label={p.label}
          icon={p.icon as any}
          variant="outline"
          size="md"
          active={selected === p.key}
          onPress={() => onChange(p.key)}
        />
      ))}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: Spacing.sm,
    flexWrap: 'wrap',
  },
})
