import { Ionicons } from '@expo/vector-icons'
import { useRouter } from 'expo-router'
import React, { useMemo, useState } from 'react'
import {
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { AppCard } from '../../components/AppCard'
import { ProfileAvatarButton } from '../../components/ProfileAvatarButton'
import { useAppStore } from '../../store/appStore'
import { APP_CATEGORIES } from '../../constants/categories'
import { SEARCH_SUGGESTIONS } from '../../constants/searchSuggestions'
import { Colors, Radius, Spacing, Type } from '../../constants/theme'

export default function SearchScreen() {
  const insets = useSafeAreaInsets()
  const router = useRouter()
  const apps = useAppStore((s) => s.apps)
  const [query, setQuery] = useState('')
  const [isFocused, setIsFocused] = useState(false)

  const results = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return []
    return apps.filter(
      (a) =>
        a.name.toLowerCase().includes(q) || a.prompt.toLowerCase().includes(q),
    )
  }, [apps, query])

  const showResults = query.trim().length > 0
  const showSuggestions = isFocused && !showResults

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Text style={styles.title}>Search</Text>
        <ProfileAvatarButton />
      </View>

      <View style={styles.searchBar}>
        <Ionicons name="search" size={18} color={Colors.textMuted} />
        <TextInput
          style={styles.input}
          placeholder="Search apps, prompts, creators"
          placeholderTextColor={Colors.textMuted}
          value={query}
          onChangeText={setQuery}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          autoCapitalize="none"
          autoCorrect={false}
          returnKeyType="search"
        />
        {query.length > 0 && (
          <TouchableOpacity
            onPress={() => setQuery('')}
            hitSlop={8}
            activeOpacity={0.7}
          >
            <Ionicons name="close-circle" size={18} color={Colors.textMuted} />
          </TouchableOpacity>
        )}
      </View>

      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {showSuggestions ? (
          <View style={styles.suggestionList}>
            <Text style={styles.suggestionHeading}>Suggestions</Text>
            {SEARCH_SUGGESTIONS.map((suggestion) => (
              <TouchableOpacity
                key={suggestion.id}
                style={styles.suggestionRow}
                activeOpacity={0.85}
                onPress={() => setQuery(suggestion.label)}
              >
                <Ionicons name="search" size={16} color={Colors.text} />
                <Text style={styles.suggestionLabel}>{suggestion.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        ) : !showResults ? (
          <>
            <Text style={styles.sectionLabel}>Explore apps by category</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.categoryScroll}
            >
              <View style={styles.categoryRows}>
                {[0, 1].map((rowIdx) => (
                  <View key={rowIdx} style={styles.categoryRow}>
                    {APP_CATEGORIES.filter((_, i) => i % 2 === rowIdx).map(
                      (category) => (
                        <TouchableOpacity
                          key={category.id}
                          style={styles.categoryCard}
                          activeOpacity={0.85}
                          onPress={() => setQuery(category.label)}
                        >
                          <Text style={styles.categoryEmoji}>
                            {category.emoji}
                          </Text>
                          <Text style={styles.categoryLabel}>
                            {category.label}
                          </Text>
                        </TouchableOpacity>
                      ),
                    )}
                  </View>
                ))}
              </View>
            </ScrollView>
          </>
        ) : results.length === 0 ? (
          <View style={styles.empty}>
            <View style={styles.emptyIcon}>
              <Ionicons name="sparkles-outline" size={22} color={Colors.text} />
            </View>
            <Text style={styles.emptyTitle}>No matches</Text>
            <Text style={styles.emptyText}>
              Nothing for “{query}”. Try another term — or create it.
            </Text>
          </View>
        ) : (
          <View style={styles.grid}>
            {results.map((item) => (
              <View key={item.id} style={styles.gridItem}>
                <AppCard
                  app={item}
                  onPress={() => router.push(`/preview/${item.id}`)}
                />
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.bg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.xs,
  },
  title: {
    ...Type.heading2,
    color: Colors.text,
    letterSpacing: -0.8,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    backgroundColor: Colors.surfaceMuted,
    borderRadius: Radius.pill,
    marginHorizontal: Spacing.lg,
    marginTop: Spacing.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: 12,
  },
  input: {
    flex: 1,
    ...Type.body,
    color: Colors.text,
    padding: 0,
  },
  scroll: {
    paddingTop: Spacing.lg,
    paddingBottom: 200,
  },
  sectionLabel: {
    ...Type.micro,
    color: Colors.textMuted,
    textTransform: 'uppercase',
    marginBottom: Spacing.sm,
    paddingHorizontal: Spacing.lg,
  },
  categoryScroll: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.lg,
  },
  categoryRows: {
    flexDirection: 'column',
    gap: Spacing.sm,
  },
  categoryRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  categoryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: Radius.md,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: Colors.border,
    backgroundColor: Colors.surface,
  },
  categoryEmoji: {
    fontSize: 18,
    lineHeight: 22,
  },
  categoryLabel: {
    ...Type.bodySmall,
    fontSize: 13,
    color: Colors.textMuted,
    letterSpacing: -0.1,
  },
  suggestionList: {
    paddingHorizontal: Spacing.lg,
  },
  suggestionHeading: {
    ...Type.bodySmall,
    fontSize: 12,
    color: Colors.textMuted,
    marginBottom: Spacing.xs,
  },
  suggestionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.border,
  },
  suggestionLabel: {
    ...Type.body,
    color: Colors.text,
    flex: 1,
  },
  empty: {
    alignItems: 'flex-start',
    backgroundColor: Colors.surfaceMuted,
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    marginHorizontal: Spacing.lg,
  },
  emptyIcon: {
    width: 44,
    height: 44,
    borderRadius: Radius.pill,
    backgroundColor: Colors.bg,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
  },
  emptyTitle: {
    ...Type.heading3,
    color: Colors.text,
    marginBottom: Spacing.xs,
  },
  emptyText: {
    ...Type.bodySmall,
    color: Colors.textSecondary,
    maxWidth: 320,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.md,
    paddingHorizontal: Spacing.lg,
  },
  gridItem: {
    width: '48%',
  },
})
