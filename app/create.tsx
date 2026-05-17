import React, { useState, useRef } from 'react'
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
} from 'react-native'
import { useRouter } from 'expo-router'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useCreateApp } from '../hooks/useGeneration'
import { PromptInput } from '../components/PromptInput'
import { IconButton, ScreenHeader, PillButton } from '../components/ui'
import { Colors, Spacing, Type } from '../constants/theme'

const SUGGESTIONS = [
  'A tip calculator with a slider for percentage',
  'A pomodoro timer with start, pause and reset',
  'A simple habit tracker with daily checkmarks',
]

export default function CreateScreen() {
  const router = useRouter()
  const insets = useSafeAreaInsets()
  const inputRef = useRef<TextInput>(null)

  const createApp = useCreateApp()

  const [prompt, setPrompt] = useState('')

  const handleGenerate = () => {
    const trimmed = prompt.trim()
    if (!trimmed) return
    try {
      const appId = createApp(trimmed)
      // Replace so the back stack goes gallery ← preview (not gallery ← create ← preview).
      router.replace(`/preview/${appId}`)
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to start generation'
      Alert.alert('Could not create app', msg)
    }
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <ScreenHeader
        title="Create"
        left={<IconButton icon="close" onPress={() => router.back()} />}
      />

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={100}
      >
        <ScrollView
          style={styles.flex}
          contentContainerStyle={styles.promptContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.eyebrow}>Step 01</Text>
          <Text style={styles.headline}>
            What do you{'\n'}want to build?
          </Text>
          <Text style={styles.lede}>
            Describe your app in plain English. Be specific about features, layout and interactions.
          </Text>

          <PromptInput
            ref={inputRef}
            placeholder="A tip calculator with a slider for percentage..."
            value={prompt}
            onChangeText={setPrompt}
          />

          <Text style={styles.sectionLabel}>Try one</Text>
          <View style={styles.suggestionList}>
            {SUGGESTIONS.map((s) => (
              <PillButton
                key={s}
                label={s}
                iconRight="arrow-forward"
                variant="outline"
                size="md"
                onPress={() => setPrompt(s)}
                style={styles.suggestion}
              />
            ))}
          </View>

          <PillButton
            label="Generate app"
            iconRight="sparkles"
            size="lg"
            onPress={handleGenerate}
            disabled={!prompt.trim()}
            style={styles.generateBtn}
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.bg,
  },
  flex: {
    flex: 1,
  },
  promptContent: {
    padding: Spacing.lg,
    paddingBottom: 120,
  },
  eyebrow: {
    ...Type.micro,
    color: Colors.textMuted,
    textTransform: 'uppercase',
    marginBottom: Spacing.sm,
  },
  headline: {
    ...Type.heading1,
    color: Colors.text,
    marginBottom: Spacing.md,
  },
  lede: {
    ...Type.body,
    color: Colors.textSecondary,
    marginBottom: Spacing.xl,
    maxWidth: 340,
  },
  sectionLabel: {
    ...Type.micro,
    color: Colors.textMuted,
    textTransform: 'uppercase',
    marginTop: Spacing.xl,
    marginBottom: Spacing.md,
  },
  suggestionList: {
    gap: Spacing.sm,
  },
  suggestion: {
    justifyContent: 'space-between',
  },
  generateBtn: {
    marginTop: Spacing.xxl,
  },
})
