import React, { useState, useRef } from 'react'
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
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
import { Colors, Spacing, Radius } from '../constants/theme'

type Phase = 'prompt' | 'preview'

export default function CreateScreen() {
  const router = useRouter()
  const insets = useSafeAreaInsets()
  const inputRef = useRef<TextInput>(null)

  const settings = useAppStore((s) => s.settings)
  const setSetting = useAppStore((s) => s.setSetting)
  const { status, generatedJSX, error, generate, save, reset } = useGeneration()

  const [prompt, setPrompt] = useState('')
  const [phase, setPhase] = useState<Phase>('prompt')
  const [saveName, setSaveName] = useState('')

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
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerBtn} onPress={handleBack} activeOpacity={0.7}>
          <Ionicons name="close" size={20} color={Colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {phase === 'prompt' ? 'Create' : 'Preview'}
        </Text>
        {phase === 'preview' && status === 'success' ? (
          <TouchableOpacity style={styles.saveHeaderBtn} onPress={handleSave} activeOpacity={0.7}>
            <Text style={styles.saveHeaderText}>Save</Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.headerBtn} />
        )}
      </View>

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
            {/* Provider selector */}
            <Text style={styles.sectionLabel}>Provider</Text>
            <ProviderPill
              selected={settings.selectedProvider}
              onChange={(p) => setSetting('selectedProvider', p)}
            />

            {/* Prompt input */}
            <Text style={[styles.sectionLabel, { marginTop: Spacing.xl }]}>
              What do you want to build?
            </Text>
            <PromptInput
              ref={inputRef}
              placeholder="Describe your app... e.g. A tip calculator with a slider for tip percentage"
              value={prompt}
              onChangeText={setPrompt}
            />

            {/* Generate button */}
            <TouchableOpacity
              style={[
                styles.generateBtn,
                !prompt.trim() && styles.generateBtnDisabled,
              ]}
              onPress={handleGenerate}
              disabled={!prompt.trim() || isGenerating}
              activeOpacity={0.85}
            >
              <Ionicons name="sparkles" size={18} color="#FFF" />
              <Text style={styles.generateText}>Generate App</Text>
            </TouchableOpacity>

            {/* Hint */}
            <Text style={styles.hint}>
              Be specific about features, layout, and interactions for best results.
            </Text>
          </ScrollView>
        </KeyboardAvoidingView>
      ) : (
        <View style={styles.flex}>
          {status === 'error' && (
            <View style={styles.errorContainer}>
              <Ionicons name="alert-circle" size={40} color={Colors.error} />
              <Text style={styles.errorTitle}>Generation Failed</Text>
              <Text style={styles.errorText}>{error}</Text>
              <TouchableOpacity style={styles.retryBtn} onPress={handleRetry}>
                <Ionicons name="refresh" size={16} color={Colors.primary} />
                <Text style={styles.retryText}>Try Again</Text>
              </TouchableOpacity>
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  headerBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.surfaceElevated,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: Colors.text,
  },
  saveHeaderBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: Radius.full,
    backgroundColor: Colors.primary,
  },
  saveHeaderText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFF',
  },
  promptContent: {
    padding: Spacing.lg,
    paddingBottom: 100,
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: Spacing.sm,
  },
  generateBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    backgroundColor: Colors.primary,
    borderRadius: Radius.md,
    paddingVertical: 16,
    marginTop: Spacing.xl,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  generateBtnDisabled: {
    opacity: 0.4,
    shadowOpacity: 0,
  },
  generateText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFF',
  },
  hint: {
    fontSize: 13,
    color: Colors.textMuted,
    textAlign: 'center',
    marginTop: Spacing.md,
    lineHeight: 18,
  },
  previewContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: Radius.lg,
    borderTopRightRadius: Radius.lg,
    overflow: 'hidden',
    margin: Spacing.sm,
    marginBottom: 0,
  },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.xl,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.text,
    marginTop: Spacing.md,
    marginBottom: Spacing.sm,
  },
  errorText: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: Spacing.lg,
  },
  retryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: Colors.primary,
  },
  retryText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.primary,
  },
})
