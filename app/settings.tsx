import { Ionicons } from '@expo/vector-icons'
import { useRouter } from 'expo-router'
import React, { useCallback, useEffect, useState } from 'react'
import {
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { BrandLogo, type BrandKey } from '../components/BrandLogo'
import { GlassCard } from '../components/GlassCard'
import { IconButton, ScreenHeader, PillButton } from '../components/ui'
import { Colors, Radius, Spacing, Type, ACTIVE_OPACITY } from '../constants/theme'
import { createLLMService } from '../services/llm/factory'
import { keychainManager } from '../services/storage/keychain'
import { useAppStore } from '../store/appStore'

type Provider = 'openai' | 'google' | 'anthropic'

interface ProviderEntry {
  key: Provider
  brand: BrandKey
  label: string
  placeholder: string
}

// TODO: provider catalog may move behind a remote config flag. Keep shape stable.
const PROVIDERS: ProviderEntry[] = [
  { key: 'openai', brand: 'openai', label: 'OpenAI', placeholder: 'sk-...' },
  { key: 'google', brand: 'gemini', label: 'Gemini', placeholder: 'AIza...' },
  { key: 'anthropic', brand: 'anthropic', label: 'Claude', placeholder: 'sk-ant-...' },
]

interface IntegrationEntry {
  id: string
  brand: BrandKey
  label: string
  description: string
}

// TODO: integration list + connection state will come from backend
const INTEGRATIONS: IntegrationEntry[] = [
  { id: 'github', brand: 'github', label: 'GitHub', description: 'Sync repos and commits' },
  { id: 'gmail', brand: 'gmail', label: 'Gmail', description: 'Read and draft email' },
  { id: 'gcal', brand: 'googleCalendar', label: 'Google Calendar', description: 'View and create events' },
  { id: 'x', brand: 'x', label: 'X', description: 'Cross-post from your apps' },
]

interface LegalLink {
  id: string
  label: string
  href: string // TODO: swap for real URLs served from backend
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

  const [keyDraft, setKeyDraft] = useState('')
  const [keyStatus, setKeyStatus] = useState<Record<Provider, boolean>>({
    openai: false,
    google: false,
    anthropic: false,
  })
  const [activeProvider, setActiveProvider] = useState<ProviderEntry | null>(null)
  const [testing, setTesting] = useState(false)
  const [saving, setSaving] = useState(false)
  // TODO: replace local toggle state with backend-connected integrations
  const [integrations, setIntegrations] = useState<Record<string, boolean>>({
    github: false,
    gmail: false,
    gcal: false,
    x: false,
  })

  useEffect(() => {
    ;(async () => {
      const statuses: Record<string, boolean> = {}
      for (const p of PROVIDERS) {
        const existing = await keychainManager.retrieveAPIKey(p.key)
        statuses[p.key] = !!existing
      }
      setKeyStatus(statuses as Record<Provider, boolean>)
    })()
  }, [])

  const openKeyModal = useCallback((provider: ProviderEntry) => {
    setKeyDraft('')
    setActiveProvider(provider)
  }, [])

  const closeKeyModal = useCallback(() => {
    setActiveProvider(null)
    setKeyDraft('')
  }, [])

  const saveKey = useCallback(async () => {
    if (!activeProvider) return
    const key = keyDraft.trim()
    setSaving(true)
    try {
      if (!key) {
        await keychainManager.deleteAPIKey(activeProvider.key)
        setKeyStatus((prev) => ({ ...prev, [activeProvider.key]: false }))
      } else {
        await keychainManager.storeAPIKey(activeProvider.key, key)
        setKeyStatus((prev) => ({ ...prev, [activeProvider.key]: true }))
      }
      closeKeyModal()
    } finally {
      setSaving(false)
    }
  }, [keyDraft, activeProvider, closeKeyModal])

  const removeKey = useCallback(async () => {
    if (!activeProvider) return
    await keychainManager.deleteAPIKey(activeProvider.key)
    setKeyStatus((prev) => ({ ...prev, [activeProvider.key]: false }))
    closeKeyModal()
  }, [activeProvider, closeKeyModal])

  const testKey = useCallback(async () => {
    if (!activeProvider) return
    setTesting(true)
    try {
      const apiKey = await keychainManager.retrieveAPIKey(activeProvider.key)
      if (!apiKey) {
        Alert.alert('No key', 'Save an API key first.')
        return
      }
      const llm = createLLMService(activeProvider.key, apiKey)
      const ok = await llm.testConnection?.()
      Alert.alert(ok ? 'Connected' : 'Failed')
    } catch {
      Alert.alert('Error', 'Connection test failed.')
    } finally {
      setTesting(false)
    }
  }, [activeProvider])

  const onComingSoon = (label: string) =>
    Alert.alert(label, 'This will be available soon.')

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
          onPress: () =>
            Alert.alert('Not implemented', 'Account deletion is not yet wired up.'),
        },
      ],
    )
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <ScreenHeader
        title="Settings"
        left={<IconButton icon="chevron-back" onPress={() => router.back()} />}
      />

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        {/* Account */}
        <Text style={[styles.sectionLabel, styles.sectionLabelFirst]}>
          Account
        </Text>
        <GlassCard>
          <PrefRow
            icon="person-outline"
            title="Edit profile"
            subtitle="Name, handle, bio, avatar"
            onPress={() => onComingSoon('Edit profile')}
          />
          <Divider />
          <PrefRow
            icon="at-outline"
            title="Connected accounts"
            subtitle="Sign-in providers"
            onPress={() => onComingSoon('Connected accounts')}
          />
        </GlassCard>

        {/* Active provider */}
        <Text style={styles.sectionLabel}>Active provider</Text>
        <View style={styles.providerRow}>
          {PROVIDERS.map((p) => (
            <PillButton
              key={p.key}
              label={p.label}
              variant="outline"
              size="md"
              active={settings.selectedProvider === p.key}
              onPress={() => setSetting('selectedProvider', p.key)}
            />
          ))}
        </View>

        {/* API keys */}
        <Text style={styles.sectionLabel}>API keys</Text>
        <GlassCard>
          {PROVIDERS.map((p, i) => {
            const connected = keyStatus[p.key]
            return (
              <React.Fragment key={p.key}>
                <TouchableOpacity
                  style={styles.keyRow}
                  activeOpacity={0.85}
                  onPress={() => openKeyModal(p)}
                >
                  <View style={styles.keyLeft}>
                    <BrandLogo brand={p.brand} size={36} />
                    <View>
                      <Text style={styles.keyName}>{p.label}</Text>
                      <Text
                        style={[
                          styles.keyStatus,
                          { color: connected ? Colors.teal : Colors.textMuted },
                        ]}
                      >
                        {connected ? 'Connected' : 'No key'}
                      </Text>
                    </View>
                  </View>
                  <Ionicons name="chevron-forward" size={16} color={Colors.textMuted} />
                </TouchableOpacity>
                {i < PROVIDERS.length - 1 && <Divider />}
              </React.Fragment>
            )
          })}
        </GlassCard>

        {/* Integrations */}
        <Text style={styles.sectionLabel}>Integrations</Text>
        <GlassCard>
          {INTEGRATIONS.map((integration, i) => (
            <React.Fragment key={integration.id}>
              <View style={styles.integrationRow}>
                <View style={styles.integrationLeft}>
                  <BrandLogo brand={integration.brand} size={36} />
                  <View style={styles.integrationCopy}>
                    <Text style={styles.integrationLabel}>
                      {integration.label}
                    </Text>
                    <Text style={styles.integrationDescription}>
                      {integration.description}
                    </Text>
                  </View>
                </View>
                <Switch
                  value={!!integrations[integration.id]}
                  onValueChange={(next) =>
                    setIntegrations((prev) => ({
                      ...prev,
                      [integration.id]: next,
                    }))
                  }
                  trackColor={{ false: Colors.border, true: Colors.primary }}
                  thumbColor={Colors.textInverse}
                  ios_backgroundColor={Colors.border}
                />
              </View>
              {i < INTEGRATIONS.length - 1 && <Divider />}
            </React.Fragment>
          ))}
        </GlassCard>

        {/* Preferences */}
        <Text style={styles.sectionLabel}>Preferences</Text>
        <GlassCard>
          <PrefRow
            icon="globe-outline"
            title="Default visibility"
            subtitle="New apps start as private"
            onPress={() => onComingSoon('Default visibility')}
          />
          <Divider />
          <PrefRow
            icon="notifications-outline"
            title="Notifications"
            subtitle="Likes, remixes, followers"
            onPress={() => onComingSoon('Notifications')}
          />
          <Divider />
          <PrefRow
            icon="shield-checkmark-outline"
            title="Privacy & data"
            subtitle="Control what's shared publicly"
            onPress={() => onComingSoon('Privacy & data')}
          />
        </GlassCard>

        {/* Legal */}
        <Text style={styles.sectionLabel}>Legal</Text>
        <GlassCard>
          {LEGAL_LINKS.map((link, i) => (
            <React.Fragment key={link.id}>
              <TouchableOpacity
                style={styles.prefRow}
                activeOpacity={0.85}
                onPress={() => onComingSoon(link.label)}
              >
                <View style={styles.prefLeft}>
                  <View style={styles.prefIcon}>
                    <Ionicons
                      name="document-text-outline"
                      size={16}
                      color={Colors.text}
                    />
                  </View>
                  <Text style={styles.prefTitle}>{link.label}</Text>
                </View>
                <Ionicons name="open-outline" size={16} color={Colors.textMuted} />
              </TouchableOpacity>
              {i < LEGAL_LINKS.length - 1 && <Divider />}
            </React.Fragment>
          ))}
        </GlassCard>

        {/* Danger zone */}
        <Text style={[styles.sectionLabel, styles.sectionLabelDanger]}>
          Danger zone
        </Text>
        <GlassCard tint="danger">
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
        </GlassCard>

        <Text style={styles.version}>Oggy · v0.1.0</Text>
      </ScrollView>

      <Modal
        visible={!!activeProvider}
        transparent
        animationType="fade"
        onRequestClose={closeKeyModal}
      >
        <Pressable style={styles.modalBackdrop} onPress={closeKeyModal}>
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 20 : 0}
            style={styles.modalCentered}
          >
            <Pressable style={styles.modalCard} onPress={() => {}}>
              {activeProvider && (
                <>
                  <View style={styles.modalHeader}>
                    <BrandLogo brand={activeProvider.brand} size={40} />
                    <Text style={styles.modalTitle}>{activeProvider.label}</Text>
                  </View>

                  <TextInput
                    style={styles.modalInput}
                    placeholder={activeProvider.placeholder}
                    placeholderTextColor={Colors.textMuted}
                    value={keyDraft}
                    onChangeText={setKeyDraft}
                    secureTextEntry
                    autoCapitalize="none"
                    autoCorrect={false}
                    autoFocus
                  />

                  <View style={styles.modalActions}>
                    {keyStatus[activeProvider.key] && (
                      <PillButton
                        label="Remove"
                        variant="danger"
                        size="sm"
                        onPress={removeKey}
                        style={{ marginRight: 'auto' }}
                      />
                    )}
                    <PillButton
                      label={testing ? 'Testing…' : 'Test'}
                      variant="outline"
                      size="sm"
                      onPress={testKey}
                      disabled={testing || !keyStatus[activeProvider.key]}
                    />
                    <PillButton
                      label={saving ? 'Saving…' : 'Save'}
                      size="sm"
                      onPress={saveKey}
                      disabled={saving}
                    />
                  </View>
                </>
              )}
            </Pressable>
          </KeyboardAvoidingView>
        </Pressable>
      </Modal>
    </View>
  )
}

function PrefRow({
  icon,
  title,
  subtitle,
  onPress,
}: {
  icon: keyof typeof Ionicons.glyphMap
  title: string
  subtitle: string
  onPress?: () => void
}) {
  return (
    <TouchableOpacity style={styles.prefRow} activeOpacity={0.85} onPress={onPress}>
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
    marginBottom: Spacing.md,
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
  keyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Spacing.md,
  },
  keyLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  keyName: {
    ...Type.bodySemibold,
    color: Colors.text,
    fontSize: 15,
  },
  keyStatus: {
    ...Type.bodySmall,
    fontSize: 12,
    marginTop: 2,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'center',
    padding: Spacing.lg,
  },
  modalCentered: {
    justifyContent: 'flex-end',
    paddingBottom: Spacing.lg,
  },
  modalCard: {
    backgroundColor: Colors.bg,
    borderRadius: Radius.xl,
    padding: Spacing.lg,
    gap: Spacing.md,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  modalTitle: {
    ...Type.bodySemibold,
    fontSize: 15,
    color: Colors.text,
  },
  modalInput: {
    backgroundColor: Colors.surfaceMuted,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: 12,
    ...Type.bodySmall,
    color: Colors.text,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: Spacing.sm,
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
    flex: 1,
  },
  prefIcon: {
    width: 36,
    height: 36,
    borderRadius: Radius.pill,
    backgroundColor: 'rgba(255,255,255,0.65)',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(0,0,0,0.06)',
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
  integrationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Spacing.md,
  },
  integrationLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    flex: 1,
  },
  integrationCopy: {
    flex: 1,
    minWidth: 0,
  },
  integrationLabel: {
    ...Type.bodySemibold,
    color: Colors.text,
    fontSize: 15,
  },
  integrationDescription: {
    ...Type.bodySmall,
    fontSize: 12,
    color: Colors.textMuted,
    marginTop: 2,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: 'rgba(0,0,0,0.08)',
    marginHorizontal: Spacing.md,
  },
  deleteRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Spacing.md,
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
    backgroundColor: 'rgba(255,255,255,0.7)',
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
