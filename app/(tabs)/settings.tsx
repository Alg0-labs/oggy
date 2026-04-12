import React, { useState, useEffect, useCallback } from 'react'
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
} from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { useAppStore } from '../../store/appStore'
import { keychainManager } from '../../services/storage/keychain'
import { createLLMService } from '../../services/llm/factory'
import { Colors, Spacing, Radius } from '../../constants/theme'

type Provider = 'openai' | 'google' | 'anthropic'

const providerConfig: { key: Provider; label: string; icon: string; color: string; placeholder: string }[] = [
  { key: 'openai', label: 'OpenAI', icon: 'flash', color: Colors.providers.openai, placeholder: 'sk-...' },
  { key: 'google', label: 'Google Gemini', icon: 'sparkles', color: Colors.providers.google, placeholder: 'AIza...' },
  { key: 'anthropic', label: 'Anthropic Claude', icon: 'diamond', color: Colors.providers.anthropic, placeholder: 'sk-ant-...' },
]

export default function SettingsScreen() {
  const insets = useSafeAreaInsets()
  const settings = useAppStore((s) => s.settings)
  const setSetting = useAppStore((s) => s.setSetting)

  const [keys, setKeys] = useState<Record<Provider, string>>({
    openai: '',
    google: '',
    anthropic: '',
  })
  const [hasKey, setHasKey] = useState<Record<Provider, boolean>>({
    openai: false,
    google: false,
    anthropic: false,
  })
  const [editing, setEditing] = useState<Provider | null>(null)
  const [testing, setTesting] = useState<Provider | null>(null)

  useEffect(() => {
    loadKeys()
  }, [])

  const loadKeys = async () => {
    const results: Record<Provider, boolean> = { openai: false, google: false, anthropic: false }
    for (const p of providerConfig) {
      const key = await keychainManager.retrieveAPIKey(p.key)
      results[p.key] = !!key
    }
    setHasKey(results)
  }

  const saveKey = useCallback(async (provider: Provider) => {
    const key = keys[provider].trim()
    if (!key) {
      await keychainManager.deleteAPIKey(provider)
      setHasKey((prev) => ({ ...prev, [provider]: false }))
    } else {
      await keychainManager.storeAPIKey(provider, key)
      setHasKey((prev) => ({ ...prev, [provider]: true }))
    }
    setKeys((prev) => ({ ...prev, [provider]: '' }))
    setEditing(null)
  }, [keys])

  const testKey = useCallback(async (provider: Provider) => {
    setTesting(provider)
    try {
      const apiKey = await keychainManager.retrieveAPIKey(provider)
      if (!apiKey) {
        Alert.alert('No Key', 'Save an API key first.')
        return
      }
      const llm = createLLMService(provider, apiKey)
      const ok = await llm.testConnection?.()
      Alert.alert(ok ? 'Connected' : 'Failed', ok ? `${provider} is working.` : 'Could not connect. Check your key.')
    } catch {
      Alert.alert('Error', 'Connection test failed.')
    } finally {
      setTesting(null)
    }
  }, [])

  return (
    <ScrollView
      style={[styles.container, { paddingTop: insets.top }]}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <Text style={styles.title}>Settings</Text>

      {/* Active Provider */}
      <Text style={styles.sectionLabel}>Active Provider</Text>
      <View style={styles.providerRow}>
        {providerConfig.map((p) => {
          const active = settings.selectedProvider === p.key
          return (
            <TouchableOpacity
              key={p.key}
              style={[
                styles.providerChip,
                active && { backgroundColor: p.color + '20', borderColor: p.color + '60' },
              ]}
              onPress={() => setSetting('selectedProvider', p.key)}
              activeOpacity={0.7}
            >
              <Ionicons
                name={p.icon as any}
                size={16}
                color={active ? p.color : Colors.textMuted}
              />
              <Text style={[styles.chipLabel, active && { color: p.color }]}>
                {p.label.split(' ')[0]}
              </Text>
              {active && (
                <Ionicons name="checkmark-circle" size={14} color={p.color} />
              )}
            </TouchableOpacity>
          )
        })}
      </View>

      {/* API Keys */}
      <Text style={styles.sectionLabel}>API Keys</Text>
      {providerConfig.map((p) => (
        <View key={p.key} style={styles.keyCard}>
          <View style={styles.keyHeader}>
            <View style={styles.keyLeft}>
              <View style={[styles.keyDot, { backgroundColor: p.color }]}>
                <Ionicons name={p.icon as any} size={14} color="#FFF" />
              </View>
              <Text style={styles.keyName}>{p.label}</Text>
            </View>
            <View style={styles.keyRight}>
              {hasKey[p.key] && (
                <TouchableOpacity
                  style={styles.testBtn}
                  onPress={() => testKey(p.key)}
                  disabled={testing === p.key}
                >
                  <Text style={[styles.testText, testing === p.key && { opacity: 0.5 }]}>
                    {testing === p.key ? 'Testing...' : 'Test'}
                  </Text>
                </TouchableOpacity>
              )}
              <View style={[styles.statusBadge, hasKey[p.key] ? styles.statusOk : styles.statusMissing]}>
                <Text style={[styles.statusText, hasKey[p.key] ? styles.statusTextOk : styles.statusTextMissing]}>
                  {hasKey[p.key] ? 'Set' : 'Missing'}
                </Text>
              </View>
            </View>
          </View>

          {editing === p.key ? (
            <View style={styles.inputRow}>
              <TextInput
                style={styles.keyInput}
                placeholder={p.placeholder}
                placeholderTextColor={Colors.textMuted}
                value={keys[p.key]}
                onChangeText={(text) => setKeys((prev) => ({ ...prev, [p.key]: text }))}
                secureTextEntry
                autoCapitalize="none"
                autoCorrect={false}
              />
              <TouchableOpacity style={styles.saveBtn} onPress={() => saveKey(p.key)}>
                <Ionicons name="checkmark" size={18} color="#FFF" />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.cancelBtn}
                onPress={() => {
                  setEditing(null)
                  setKeys((prev) => ({ ...prev, [p.key]: '' }))
                }}
              >
                <Ionicons name="close" size={18} color={Colors.textSecondary} />
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity
              style={styles.editRow}
              onPress={() => setEditing(p.key)}
            >
              <Text style={styles.editText}>
                {hasKey[p.key] ? 'Update key' : 'Add key'}
              </Text>
              <Ionicons name="chevron-forward" size={14} color={Colors.textMuted} />
            </TouchableOpacity>
          )}
        </View>
      ))}

      {/* About */}
      <Text style={styles.sectionLabel}>About</Text>
      <View style={styles.aboutCard}>
        <Text style={styles.aboutTitle}>Oggy</Text>
        <Text style={styles.aboutText}>
          Describe any app in natural language and watch it come to life on your phone.
        </Text>
        <Text style={styles.aboutVersion}>v0.1.0</Text>
      </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.bg,
  },
  content: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: 120,
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: Colors.text,
    letterSpacing: -0.5,
    paddingTop: Spacing.md,
    marginBottom: Spacing.xl,
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: Spacing.sm,
    marginTop: Spacing.lg,
  },
  providerRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    flexWrap: 'wrap',
  },
  providerChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.surfaceElevated,
  },
  chipLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textMuted,
  },
  keyCard: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  keyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  keyLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  keyDot: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  keyName: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.text,
  },
  keyRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  testBtn: {
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  testText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.primary,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: Radius.full,
  },
  statusOk: {
    backgroundColor: Colors.successBg,
  },
  statusMissing: {
    backgroundColor: Colors.errorBg,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '700',
  },
  statusTextOk: {
    color: Colors.success,
  },
  statusTextMissing: {
    color: Colors.error,
  },
  inputRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginTop: Spacing.sm,
  },
  keyInput: {
    flex: 1,
    backgroundColor: Colors.surfaceElevated,
    borderRadius: Radius.sm,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 10,
    fontSize: 14,
    color: Colors.text,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  saveBtn: {
    width: 40,
    height: 40,
    borderRadius: Radius.sm,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelBtn: {
    width: 40,
    height: 40,
    borderRadius: Radius.sm,
    backgroundColor: Colors.surfaceElevated,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  editRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: Spacing.sm,
    paddingTop: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  editText: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  aboutCard: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  aboutTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: Spacing.xs,
  },
  aboutText: {
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 20,
    marginBottom: Spacing.sm,
  },
  aboutVersion: {
    fontSize: 12,
    color: Colors.textMuted,
  },
})
