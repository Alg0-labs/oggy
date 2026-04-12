import React from 'react'
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Dimensions,
} from 'react-native'
import { useRouter } from 'expo-router'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { useAppStore } from '../../store/appStore'
import { AppCard } from '../../components/AppCard'
import { Colors, Spacing, Radius } from '../../constants/theme'

const CARD_GAP = Spacing.md

export default function HomeScreen() {
  const apps = useAppStore((s) => s.apps)
  const deleteApp = useAppStore((s) => s.deleteApp)
  const router = useRouter()
  const insets = useSafeAreaInsets()

  const sortedApps = [...apps].sort(
    (a, b) => new Date(b.createdDate).getTime() - new Date(a.createdDate).getTime()
  )

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Text style={styles.title}>Oggy</Text>
        <Text style={styles.subtitle}>
          {apps.length === 0
            ? 'Create your first mini-app'
            : `${apps.length} app${apps.length !== 1 ? 's' : ''}`}
        </Text>
      </View>

      {apps.length === 0 ? (
        <View style={styles.empty}>
          <View style={styles.emptyIcon}>
            <Ionicons name="apps-outline" size={48} color={Colors.textMuted} />
          </View>
          <Text style={styles.emptyTitle}>No apps yet</Text>
          <Text style={styles.emptyText}>
            Tap the + button to describe an app and watch it come to life
          </Text>
        </View>
      ) : (
        <FlatList
          data={sortedApps}
          numColumns={2}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.grid}
          columnWrapperStyle={styles.row}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <AppCard
              app={item}
              onPress={() => router.push(`/preview/${item.id}`)}
              onLongPress={() => deleteApp(item.id)}
            />
          )}
        />
      )}

      <TouchableOpacity
        style={[styles.fab, { bottom: insets.bottom + 100 }]}
        onPress={() => router.push('/create')}
        activeOpacity={0.85}
      >
        <Ionicons name="add" size={28} color="#FFF" />
      </TouchableOpacity>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.bg,
  },
  header: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.lg,
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: Colors.text,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginTop: 4,
  },
  grid: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: 160,
  },
  row: {
    gap: CARD_GAP,
  },
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.xl,
    paddingBottom: 100,
  },
  emptyIcon: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: Colors.surfaceElevated,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: Spacing.sm,
  },
  emptyText: {
    fontSize: 15,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  fab: {
    position: 'absolute',
    right: Spacing.lg,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
})
