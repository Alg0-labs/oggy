import React from 'react'
import { View, StyleSheet, Alert } from 'react-native'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { useAppStore } from '../../store/appStore'
import { DynamicJSXExecutor } from '../../components/DynamicJSXExecutor'
import { ErrorBoundary } from '../../components/ErrorBoundary'
import { FloatingToolbar } from '../../components/FloatingToolbar'
import { Colors } from '../../constants/theme'

export default function PreviewScreen() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const router = useRouter()
  const app = useAppStore((s) => s.apps.find((a) => a.id === id))
  const deleteApp = useAppStore((s) => s.deleteApp)

  if (!app) {
    return (
      <View style={styles.container}>
        <FloatingToolbar title="Not Found" onBack={() => router.back()} />
      </View>
    )
  }

  const handleDelete = () => {
    Alert.alert('Delete App', `Delete "${app.name}"?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => {
          deleteApp(app.id)
          router.back()
        },
      },
    ])
  }

  return (
    <View style={styles.container}>
      <View style={styles.executor}>
        <ErrorBoundary>
          <DynamicJSXExecutor code={app.generatedJSX} />
        </ErrorBoundary>
      </View>
      <FloatingToolbar
        title={app.name}
        onBack={() => router.back()}
        onDelete={handleDelete}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.bg,
  },
  executor: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    marginTop: 90,
  },
})
