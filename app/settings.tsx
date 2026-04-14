import { Ionicons } from '@expo/vector-icons'
import { useRouter } from 'expo-router'
import React, { useCallback, useEffect, useState } from 'react'
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Colors, Radius, Spacing, Type } from '../constants/theme'
import { createLLMService } from '../services/llm/factory'
import { keychainManager } from '../services/storage/keychain'
import { useAppStore } from '../store/appStore'

type Provider = 'openai' | 'google' | 'anthropic'

interface ProviderEntry {
  key: Provider
  label: string
  icon: keyof typeof Ionicons.glyphMap
  color: string
  placeholder: string
}

// TODO: provider catalog may move behind a remote config flag. Keep shape stable.
const PROVIDERS: ProviderEntry[] = [
  { key: 'openai', label: 'OpenAI', icon: 'flash', color: Colors.providers.openai, placeholder: 'sk-...' },
  { key: 'google', label: 'Google Gemini', icon: 'sparkles', color: Colors.providers.google, placeholder: 'AIza...' },
  { key: 'anthropic', label: 'Anthropic Claude', icon: 'diamond', color: Colors.providers.anthropic, placeholder: 'sk-ant-...' },
]

interface LegalLink {
  id: string
  label: string
  // TODO: swap for real URLs / in-app routes served from backend
  href: string
}

const LEGAL_LINKS: LegalLink[] = [
  { id: 'terms', label: 'Terms of service', href: '#' },
  { id: 'privacy', label: 'Privacy policy', href: '#' },
  { id: 'licenses', label: 'Open-source licenses', href: '#' },
]

export default function SettingsScreen() {
  const insets = useSafeAreaInsets()
  const router = useRouter()
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
    ;(async () => {
      const next: Record<Provider, boolean> = { openai: false, google: false, anthropic: false }
      for (const p of PROVIDERS) {
        const key = await keychainManager.retrieveAPIKey(p.key)
        next[p.key] = !!key
      }
      setHasKey(next)
    })()
  }, [])

  const saveKey = useCallback(
    async (provider: Provider) => {
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
    },
    [keys],
  )

  const testKey = useCallback(async (provider: Provider) => {
    setTesting(provider)
    try {
      const apiKey = await keychainManager.retrieveAPIKey(provider)
      if (!apiKey) {
        Alert.alert('No key', 'Save an API key first.')
        return
      }
      const llm = createLLMService(provider, apiKey)
      const ok = await llm.testConnection?.()
      Alert.alert(
        ok ? 'Connected' : 'Failed',
        ok ? `${provider} is working.` : 'Could not connect. Check your key.',
      )
    } catch {
      Alert.alert('Error', 'Connection test failed.')
    } finally {
      setTesting(null)
    }
  }, [])

  const onDeleteAccount = () => {
    Alert.alert(
      'Delete account',
      'This will permanently delete your account and all associated apps. This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          // TODO: wire up backend account deletion
          onPress: () => Alert.alert('Not implemented', 'Account deletion is not yet wired up.'),
        },
      ],
    )
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.topBar}>
        <TouchableOpacity
          style={styles.iconBtn}
          onPress={() => router.back()}
          activeOpacity={0.85}
          hitSlop={8}
        >
          <Ionicons name="chevron-back" size={22} color={Colors.text} />
        </TouchableOpacity>
        <Text style={styles.topTitle}>Settings</Text>
        <View style={styles.iconBtnPlaceholder} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        {/* Account */}
        <Text style={[styles.sectionLabel, styles.sectionLabelFirst]}>Account</Text>
        <View style={styles.list}>
          <PrefRow
            icon="person-outline"
            title="Edit profile"
            subtitle="Name, handle, bio, avatar"
          />
          <Divider />
          <PrefRow
            icon="at-outline"
            title="Connected accounts"
            subtitle="Link GitHub, X, or Google"
          />
        </View>

        {/* Active provider */}
        <Text style={styles.sectionLabel}>Active provider</Text>
        <View style={styles.providerRow}>
          {PROVIDERS.map((p) => {
            const active = settings.selectedProvider === p.key
            return (
              <TouchableOpacity
                key={p.key}
                style={[
                  styles.providerChip,
                  active ? styles.providerChipActive : styles.providerChipInactive,
                ]}
                onPress={() => setSetting('selectedProvider', p.key)}
                activeOpacity={0.85}
              >
                <Ionicons
                  name={p.icon}
                  size={14}
                  color={active ? Colors.textInverse : Colors.text}
                />
                <Text
                  style={[
                    styles.chipLabel,
                    { color: active ? Colors.textInverse : Colors.text },
                  ]}
                >
                  {p.label.split(' ')[0]}
                </Text>
              </TouchableOpacity>
            )
          })}
        </View>

        {/* API keys */}
        <Text style={styles.sectionLabel}>API keys</Text>
        {PROVIDERS.map((p) => (
          <View key={p.key} style={styles.keyCard}>
            <View style={styles.keyHeader}>
              <View style={styles.keyLeft}>
                <View style={[styles.keyDot, { backgroundColor: p.color }]}>
                  <Ionicons name={p.icon} size={14} color={Colors.textInverse} />
                </View>
                <View>
                  <Text style={styles.keyName}>{p.label}</Text>
                  <Text
                    style={[
                      styles.keyStatus,
                      { color: hasKey[p.key] ? Colors.teal : Colors.textMuted },
                    ]}
                  >
                    {hasKey[p.key] ? 'Connected' : 'No key set'}
                  </Text>
                </View>
              </View>
              {hasKey[p.key] && (
                <TouchableOpacity
                  style={styles.testPill}
                  onPress={() => testKey(p.key)}
                  disabled={testing === p.key}
                  activeOpacity={0.85}
                >
                  <Text
                    style={[
                      styles.testPillText,
                      testing === p.key && { opacity: 0.5 },
                    ]}
                  >
                    {testing === p.key ? 'Testing' : 'Test'}
                  </Text>
                </TouchableOpacity>
              )}
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
                  <Ionicons name="checkmark" size={18} color={Colors.textInverse} />
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.cancelBtn}
                  onPress={() => {
                    setEditing(null)
                    setKeys((prev) => ({ ...prev, [p.key]: '' }))
                  }}
                >
                  <Ionicons name="close" size={18} color={Colors.text} />
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity
                style={styles.editRow}
                onPress={() => setEditing(p.key)}
                activeOpacity={0.85}
              >
                <Text style={styles.editText}>
                  {hasKey[p.key] ? 'Update key' : 'Add key'}
                </Text>
                <Ionicons name="chevron-forward" size={16} color={Colors.text} />
              </TouchableOpacity>
            )}
          </View>
        ))}

        {/* Preferences */}
        <Text style={styles.sectionLabel}>Preferences</Text>
        <View style={styles.list}>
          <PrefRow icon="globe-outline" title="Default visibility" subtitle="New apps start as private" />
          <Divider />
          <PrefRow icon="notifications-outline" title="Notifications" subtitle="Likes, remixes, followers" />
          <Divider />
          <PrefRow icon="shield-checkmark-outline" title="Privacy & data" subtitle="Control what's shared publicly" />
        </View>

        {/* Legal */}
        <Text style={styles.sectionLabel}>Legal</Text>
        <View style={styles.list}>
          {LEGAL_LINKS.map((link, i) => (
            <React.Fragment key={link.id}>
              <TouchableOpacity style={styles.prefRow} activeOpacity={0.85}>
                <View style={styles.prefLeft}>
                  <View style={styles.prefIcon}>
                    <Ionicons name="document-text-outline" size={16} color={Colors.text} />
                  </View>
                  <Text style={styles.prefTitle}>{link.label}</Text>
                </View>
                <Ionicons name="open-outline" size={16} color={Colors.textMuted} />
              </TouchableOpacity>
              {i < LEGAL_LINKS.length - 1 && <Divider />}
            </React.Fragment>
          ))}
        </View>

        {/* Danger zone */}
        <Text style={[styles.sectionLabel, styles.sectionLabelDanger]}>Danger zone</Text>
        <TouchableOpacity
          style={styles.deleteRow}
          onPress={onDeleteAccount}
          activeOpacity={0.85}
        >
          <View style={styles.deleteLeft}>
            <View style={styles.deleteIcon}>
              <Ionicons name="trash-outline" size={16} color={Colors.danger} />
            </View>
            <View>
              <Text style={styles.deleteTitle}>Delete account</Text>
              <Text style={styles.deleteSubtitle}>
                Permanently remove your account and apps
              </Text>
            </View>
          </View>
          <Ionicons name="chevron-forward" size={16} color={Colors.danger} />
        </TouchableOpacity>

        <Text style={styles.version}>Oggy · v0.1.0</Text>
      </ScrollView>
    </View>
  )
}

function PrefRow({
  icon,
  title,
  subtitle,
}: {
  icon: keyof typeof Ionicons.glyphMap
  title: string
  subtitle: string
}) {
  return (
    <TouchableOpacity style={styles.prefRow} activeOpacity={0.85}>
      <View style={styles.prefLeft}>
        <View style={styles.prefIcon}>
          <Ionicons name={icon} size={16} color={Colors.text} />
        </View>
        <View>
          <Text style={styles.prefTitle}>{title}</Text>
          <Text style={styles.prefSubtitle}>{subtitle}</Text>
        </View>
      </View>
      <Ionicons name="chevron-forward" size={16} color={Colors.textMuted} />
    </TouchableOpacity>
  )
}

function Divider() {
  return <View style={styles.divider} />
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.bg,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
  },
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: Radius.pill,
    backgroundColor: Colors.surfaceMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconBtnPlaceholder: {
    width: 40,
    height: 40,
  },
  topTitle: {
    ...Type.heading3,
    color: Colors.text,
  },
  scroll: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
    paddingBottom: 140,
  },
  sectionLabel: {
    ...Type.micro,
    color: Colors.textMuted,
    textTransform: 'uppercase',
    marginTop: Spacing.xl,
    marginBottom: Spacing.sm,
  },
  sectionLabelFirst: {
    marginTop: 0,
  },
  sectionLabelDanger: {
    color: Colors.danger,
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
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: Radius.pill,
    borderWidth: 2,
  },
  providerChipActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  providerChipInactive: {
    backgroundColor: 'transparent',
    borderColor: Colors.primary,
  },
  chipLabel: {
    ...Type.button,
    fontSize: 14,
  },
  keyCard: {
    backgroundColor: Colors.surfaceMuted,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
  },
  keyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  keyLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  keyDot: {
    width: 36,
    height: 36,
    borderRadius: Radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  keyName: {
    ...Type.heading3,
    color: Colors.text,
    fontSize: 17,
  },
  keyStatus: {
    ...Type.bodySmall,
    fontSize: 12,
    marginTop: 2,
  },
  testPill: {
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: Radius.pill,
    borderWidth: 2,
    borderColor: Colors.primary,
  },
  testPillText: {
    ...Type.button,
    fontSize: 14,
    color: Colors.primary,
  },
  inputRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginTop: Spacing.md,
  },
  keyInput: {
    flex: 1,
    backgroundColor: Colors.bg,
    borderRadius: Radius.pill,
    paddingHorizontal: Spacing.md,
    paddingVertical: 12,
    ...Type.body,
    color: Colors.text,
  },
  saveBtn: {
    width: 44,
    height: 44,
    borderRadius: Radius.pill,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelBtn: {
    width: 44,
    height: 44,
    borderRadius: Radius.pill,
    backgroundColor: Colors.bg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  editRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: Spacing.md,
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  editText: {
    ...Type.bodySemibold,
    color: Colors.text,
    fontSize: 14,
  },
  list: {
    backgroundColor: Colors.surfaceMuted,
    borderRadius: Radius.lg,
    overflow: 'hidden',
  },
  prefRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Spacing.md,
  },
  prefLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  prefIcon: {
    width: 36,
    height: 36,
    borderRadius: Radius.pill,
    backgroundColor: Colors.bg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  prefTitle: {
    ...Type.bodySemibold,
    color: Colors.text,
    fontSize: 15,
  },
  prefSubtitle: {
    ...Type.bodySmall,
    fontSize: 12,
    color: Colors.textMuted,
    marginTop: 2,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.border,
    marginHorizontal: Spacing.md,
  },
  deleteRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Spacing.md,
    borderRadius: Radius.lg,
    backgroundColor: Colors.dangerBg,
  },
  deleteLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    flex: 1,
  },
  deleteIcon: {
    width: 36,
    height: 36,
    borderRadius: Radius.pill,
    backgroundColor: Colors.bg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  deleteTitle: {
    ...Type.bodySemibold,
    color: Colors.danger,
    fontSize: 15,
  },
  deleteSubtitle: {
    ...Type.bodySmall,
    fontSize: 12,
    color: Colors.textMuted,
    marginTop: 2,
  },
  version: {
    ...Type.bodySmall,
    color: Colors.textMuted,
    textAlign: 'center',
    marginTop: Spacing.xl,
  },
})
