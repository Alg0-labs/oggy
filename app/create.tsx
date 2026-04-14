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
import { Ionicons } from '@expo/vector-icons'
import { useAppStore } from '../store/appStore'
import { useGeneration } from '../hooks/useGeneration'
import { ProviderPill } from '../components/ProviderPill'
import { PromptInput } from '../components/PromptInput'
import { GeneratingOverlay } from '../components/GeneratingOverlay'
import { DynamicJSXExecutor } from '../components/DynamicJSXExecutor'
import { ErrorBoundary } from '../components/ErrorBoundary'
import { IconButton, ScreenHeader, PillButton } from '../components/ui'
import { Colors, Spacing, Radius, Type } from '../constants/theme'

type Phase = 'prompt' | 'preview'

const SUGGESTIONS = [
  'A tip calculator with a slider for percentage',
  'A pomodoro timer with start, pause and reset',
  'A simple habit tracker with daily checkmarks',
]

export default function CreateScreen() {
  const router = useRouter()
  const insets = useSafeAreaInsets()
  const inputRef = useRef<TextInput>(null)

  const settings = useAppStore((s) => s.settings)
  const setSetting = useAppStore((s) => s.setSetting)
  const { status, generatedJSX, error, generate, save, reset } = useGeneration()

  const [prompt, setPrompt] = useState('')
  const [phase, setPhase] = useState<Phase>('prompt')

  const isGenerating = status === 'generating'

  const handleGenerate = async () => {
    if (!prompt.trim()) return
    await generate(prompt.trim())
    setPhase('preview')
  }

  const handleSave = () => {
    if (!generatedJSX) return
    Alert.prompt(
      'Save App',
      'Give your app a name',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Save',
          onPress: (name?: string) => {
            if (name?.trim()) {
              save(name.trim())
              router.back()
            }
          },
        },
      ],
      'plain-text',
      '',
      'default'
    )
  }

  const handleBack = () => {
    if (phase === 'preview') {
      setPhase('prompt')
      reset()
    } else {
      reset()
      router.back()
    }
  }

  const handleRetry = () => {
    setPhase('prompt')
    reset()
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <ScreenHeader
        title={phase === 'prompt' ? 'Create' : 'Preview'}
        left={
          <IconButton
            icon={phase === 'preview' ? 'chevron-back' : 'close'}
            onPress={handleBack}
          />
        }
        right={
          phase === 'preview' && status === 'success' ? (
            <PillButton label="Save" onPress={handleSave} />
          ) : undefined
        }
      />

      {phase === 'prompt' ? (
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

            {/* Prompt input */}
            <PromptInput
              ref={inputRef}
              placeholder="A tip calculator with a slider for percentage..."
              value={prompt}
              onChangeText={setPrompt}
            />

            {/* Suggestions */}
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

            {/* Provider selector */}
            <Text style={styles.sectionLabel}>Provider</Text>
            <ProviderPill
              selected={settings.selectedProvider}
              onChange={(p) => setSetting('selectedProvider', p)}
            />

            <PillButton
              label="Generate app"
              iconRight="sparkles"
              size="lg"
              onPress={handleGenerate}
              disabled={!prompt.trim() || isGenerating}
              style={styles.generateBtn}
            />
          </ScrollView>
        </KeyboardAvoidingView>
      ) : (
        <View style={styles.flex}>
          {status === 'error' && (
            <View style={styles.errorContainer}>
              <View style={styles.errorBadge}>
                <Ionicons name="alert-circle" size={28} color={Colors.danger} />
              </View>
              <Text style={styles.errorTitle}>Generation failed</Text>
              <Text style={styles.errorText}>{error}</Text>
              <PillButton
                label="Try again"
                icon="refresh"
                onPress={handleRetry}
              />
            </View>
          )}

          {status === 'success' && generatedJSX && (
            <View style={styles.previewContainer}>
              <ErrorBoundary>
                <DynamicJSXExecutor code={generatedJSX} />
              </ErrorBoundary>
            </View>
          )}
        </View>
      )}

      <GeneratingOverlay
        visible={isGenerating}
        provider={settings.selectedProvider}
      />
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
  previewContainer: {
    flex: 1,
    backgroundColor: Colors.bg,
    borderTopLeftRadius: Radius.lg,
    borderTopRightRadius: Radius.lg,
    overflow: 'hidden',
    margin: Spacing.sm,
    marginBottom: 0,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.xl,
  },
  errorBadge: {
    width: 64,
    height: 64,
    borderRadius: Radius.pill,
    backgroundColor: Colors.dangerBg,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.lg,
  },
  errorTitle: {
    ...Type.heading2,
    color: Colors.text,
    marginBottom: Spacing.sm,
  },
  errorText: {
    ...Type.body,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: Spacing.xl,
  },
})
