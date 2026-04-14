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
import { Colors, Spacing, Radius, Type } from '../../constants/theme'
import { mockProfile } from '../../constants/mockProfile'

type Provider = 'openai' | 'google' | 'anthropic'

const providerConfig: {
  key: Provider
  label: string
  icon: string
  color: string
  placeholder: string
}[] = [
  { key: 'openai', label: 'OpenAI', icon: 'flash', color: Colors.providers.openai, placeholder: 'sk-...' },
  { key: 'google', label: 'Google Gemini', icon: 'sparkles', color: Colors.providers.google, placeholder: 'AIza...' },
  { key: 'anthropic', label: 'Anthropic Claude', icon: 'diamond', color: Colors.providers.anthropic, placeholder: 'sk-ant-...' },
]

const badgeColorMap: Record<'teal' | 'blue' | 'pink' | 'brown', string> = {
  teal: Colors.teal,
  blue: Colors.blue,
  pink: Colors.pink,
  brown: Colors.brown,
}

function formatCount(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`
  return `${n}`
}

export default function SettingsScreen() {
  const insets = useSafeAreaInsets()
  const settings = useAppStore((s) => s.settings)
  const setSetting = useAppStore((s) => s.setSetting)
  const apps = useAppStore((s) => s.apps)

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
      Alert.alert(
        ok ? 'Connected' : 'Failed',
        ok ? `${provider} is working.` : 'Could not connect. Check your key.'
      )
    } catch {
      Alert.alert('Error', 'Connection test failed.')
    } finally {
      setTesting(null)
    }
  }, [])

  const profile = mockProfile
  const publicCount = apps.filter((a) => a.visibility === 'public').length
  const joinedYear = new Date(profile.joinedDate).getFullYear()

  return (
    <ScrollView
      style={[styles.container, { paddingTop: insets.top }]}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <Text style={styles.eyebrow}>Your profile</Text>
      <Text style={styles.title}>Settings.</Text>

      {/* Profile card (dark) */}
      <View style={styles.profileCard}>
        <View style={styles.profileTopRow}>
          <View style={[styles.avatar, { backgroundColor: profile.avatarColor }]}>
            <Text style={styles.avatarText}>{profile.avatarInitials}</Text>
          </View>
          <TouchableOpacity style={styles.editProfileBtn} activeOpacity={0.85}>
            <Text style={styles.editProfileText}>Edit profile</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.profileName}>{profile.name}</Text>
        <Text style={styles.profileHandle}>{profile.handle}</Text>
        <Text style={styles.profileBio}>{profile.bio}</Text>

        <View style={styles.profileMetaRow}>
          <View style={styles.profileMeta}>
            <Ionicons name="location-outline" size={14} color="rgba(244,244,244,0.6)" />
            <Text style={styles.profileMetaText}>{profile.location}</Text>
          </View>
          <View style={styles.profileMeta}>
            <Ionicons name="link-outline" size={14} color="rgba(244,244,244,0.6)" />
            <Text style={styles.profileMetaText}>{profile.website}</Text>
          </View>
          <View style={styles.profileMeta}>
            <Ionicons name="calendar-outline" size={14} color="rgba(244,244,244,0.6)" />
            <Text style={styles.profileMetaText}>Joined {joinedYear}</Text>
          </View>
        </View>

        <View style={styles.badgeRow}>
          {profile.badges.map((b) => (
            <View
              key={b.id}
              style={[styles.badge, { backgroundColor: badgeColorMap[b.color] }]}
            >
              <Text style={styles.badgeText}>{b.label}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* Stats grid */}
      <View style={styles.statsGrid}>
        <View style={styles.statCell}>
          <Text style={styles.statValue}>{apps.length || profile.stats.appsCreated}</Text>
          <Text style={styles.statLabel}>Built</Text>
        </View>
        <View style={styles.statCellDivider} />
        <View style={styles.statCell}>
          <Text style={styles.statValue}>{publicCount || profile.stats.appsPublic}</Text>
          <Text style={styles.statLabel}>Public</Text>
        </View>
        <View style={styles.statCellDivider} />
        <View style={styles.statCell}>
          <Text style={styles.statValue}>{formatCount(profile.stats.totalLikes)}</Text>
          <Text style={styles.statLabel}>Likes</Text>
        </View>
        <View style={styles.statCellDivider} />
        <View style={styles.statCell}>
          <Text style={styles.statValue}>{formatCount(profile.stats.followers)}</Text>
          <Text style={styles.statLabel}>Followers</Text>
        </View>
      </View>

      {/* Social row */}
      <View style={styles.socialRow}>
        <TouchableOpacity style={styles.socialPillDark} activeOpacity={0.85}>
          <Ionicons name="people-outline" size={16} color={Colors.textInverse} />
          <Text style={styles.socialPillDarkText}>
            {profile.stats.following} following
          </Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.socialPillOutlined} activeOpacity={0.85}>
          <Ionicons name="share-outline" size={16} color={Colors.text} />
          <Text style={styles.socialPillOutlinedText}>Share profile</Text>
        </TouchableOpacity>
      </View>

      {/* Active Provider */}
      <Text style={styles.sectionLabel}>Active provider</Text>
      <View style={styles.providerRow}>
        {providerConfig.map((p) => {
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
                name={p.icon as any}
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

      {/* API Keys */}
      <Text style={styles.sectionLabel}>API keys</Text>
      {providerConfig.map((p) => (
        <View key={p.key} style={styles.keyCard}>
          <View style={styles.keyHeader}>
            <View style={styles.keyLeft}>
              <View style={[styles.keyDot, { backgroundColor: p.color }]}>
                <Ionicons name={p.icon as any} size={14} color={Colors.textInverse} />
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
                  style={[styles.testPillText, testing === p.key && { opacity: 0.5 }]}
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
      <View style={styles.prefList}>
        <TouchableOpacity style={styles.prefRow} activeOpacity={0.85}>
          <View style={styles.prefLeft}>
            <View style={styles.prefIcon}>
              <Ionicons name="globe-outline" size={16} color={Colors.text} />
            </View>
            <View>
              <Text style={styles.prefTitle}>Default visibility</Text>
              <Text style={styles.prefSubtitle}>New apps start as private</Text>
            </View>
          </View>
          <Ionicons name="chevron-forward" size={16} color={Colors.textMuted} />
        </TouchableOpacity>
        <View style={styles.prefDivider} />
        <TouchableOpacity style={styles.prefRow} activeOpacity={0.85}>
          <View style={styles.prefLeft}>
            <View style={styles.prefIcon}>
              <Ionicons name="notifications-outline" size={16} color={Colors.text} />
            </View>
            <View>
              <Text style={styles.prefTitle}>Notifications</Text>
              <Text style={styles.prefSubtitle}>Likes, remixes, followers</Text>
            </View>
          </View>
          <Ionicons name="chevron-forward" size={16} color={Colors.textMuted} />
        </TouchableOpacity>
        <View style={styles.prefDivider} />
        <TouchableOpacity style={styles.prefRow} activeOpacity={0.85}>
          <View style={styles.prefLeft}>
            <View style={styles.prefIcon}>
              <Ionicons name="shield-checkmark-outline" size={16} color={Colors.text} />
            </View>
            <View>
              <Text style={styles.prefTitle}>Privacy & data</Text>
              <Text style={styles.prefSubtitle}>Control what’s shared publicly</Text>
            </View>
          </View>
          <Ionicons name="chevron-forward" size={16} color={Colors.textMuted} />
        </TouchableOpacity>
      </View>

      {/* About */}
      <Text style={styles.sectionLabel}>About</Text>
      <View style={styles.aboutCard}>
        <Text style={styles.aboutTitle}>Oggy</Text>
        <Text style={styles.aboutText}>
          Describe any app in natural language and watch it come to life on your phone.
          Runs natively — no webviews, no servers.
        </Text>
        <View style={styles.aboutFooter}>
          <Text style={styles.aboutVersion}>v0.1.0</Text>
          <View style={styles.aboutBadge}>
            <Text style={styles.aboutBadgeText}>Beta</Text>
          </View>
        </View>
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
    paddingTop: Spacing.lg,
    paddingBottom: 140,
  },
  eyebrow: {
    ...Type.micro,
    color: Colors.textMuted,
    textTransform: 'uppercase',
    marginBottom: Spacing.sm,
  },
  title: {
    ...Type.display,
    color: Colors.text,
    marginBottom: Spacing.lg,
  },

  profileCard: {
    backgroundColor: Colors.bgDark,
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
  },
  profileTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.lg,
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: Radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'rgba(244,244,244,0.2)',
  },
  avatarText: {
    fontSize: 26,
    fontWeight: '500',
    color: Colors.textInverse,
    letterSpacing: -0.5,
  },
  editProfileBtn: {
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: Radius.pill,
    borderWidth: 2,
    borderColor: Colors.textInverse,
    backgroundColor: Colors.ghostOnDark,
  },
  editProfileText: {
    ...Type.button,
    fontSize: 14,
    color: Colors.textInverse,
  },
  profileName: {
    ...Type.heading1,
    color: Colors.textInverse,
    marginBottom: 2,
  },
  profileHandle: {
    ...Type.body,
    color: 'rgba(244,244,244,0.6)',
    marginBottom: Spacing.md,
  },
  profileBio: {
    ...Type.body,
    color: 'rgba(244,244,244,0.85)',
    marginBottom: Spacing.md,
  },
  profileMetaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.md,
    marginBottom: Spacing.md,
  },
  profileMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  profileMetaText: {
    ...Type.bodySmall,
    fontSize: 13,
    color: 'rgba(244,244,244,0.6)',
  },
  badgeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.xs,
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: Radius.pill,
  },
  badgeText: {
    ...Type.micro,
    color: Colors.textInverse,
    fontSize: 10,
    letterSpacing: 0.6,
  },

  statsGrid: {
    flexDirection: 'row',
    backgroundColor: Colors.surfaceMuted,
    borderRadius: Radius.lg,
    paddingVertical: Spacing.md,
    marginBottom: Spacing.md,
  },
  statCell: {
    flex: 1,
    alignItems: 'center',
  },
  statCellDivider: {
    width: 1,
    backgroundColor: Colors.border,
  },
  statValue: {
    ...Type.heading2,
    color: Colors.text,
    fontSize: 22,
    lineHeight: 26,
    marginBottom: 2,
  },
  statLabel: {
    ...Type.micro,
    color: Colors.textMuted,
    textTransform: 'uppercase',
    fontSize: 10,
  },

  socialRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  socialPillDark: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: Radius.pill,
    backgroundColor: Colors.primary,
    flex: 1,
    justifyContent: 'center',
  },
  socialPillDarkText: {
    ...Type.button,
    fontSize: 14,
    color: Colors.textInverse,
  },
  socialPillOutlined: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: Radius.pill,
    borderWidth: 2,
    borderColor: Colors.primary,
    flex: 1,
    justifyContent: 'center',
  },
  socialPillOutlinedText: {
    ...Type.button,
    fontSize: 14,
    color: Colors.text,
  },

  sectionLabel: {
    ...Type.micro,
    color: Colors.textMuted,
    textTransform: 'uppercase',
    marginBottom: Spacing.md,
    marginTop: Spacing.xl,
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

  prefList: {
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
  prefDivider: {
    height: 1,
    backgroundColor: Colors.border,
    marginHorizontal: Spacing.md,
  },

  aboutCard: {
    backgroundColor: Colors.bgDark,
    borderRadius: Radius.lg,
    padding: Spacing.lg,
  },
  aboutTitle: {
    ...Type.heading2,
    color: Colors.textInverse,
    marginBottom: Spacing.sm,
  },
  aboutText: {
    ...Type.body,
    color: 'rgba(244, 244, 244, 0.7)',
    marginBottom: Spacing.md,
  },
  aboutFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  aboutVersion: {
    ...Type.bodySmall,
    color: 'rgba(244, 244, 244, 0.5)',
  },
  aboutBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: Radius.pill,
    backgroundColor: Colors.ghostOnDark,
    borderWidth: 1,
    borderColor: 'rgba(244, 244, 244, 0.3)',
  },
  aboutBadgeText: {
    ...Type.micro,
    color: Colors.textInverse,
    fontSize: 10,
  },
})
