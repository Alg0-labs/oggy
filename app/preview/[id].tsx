import React, { useState, useRef, useCallback } from 'react'
import {
  View,
  StyleSheet,
  Alert,
  TouchableOpacity,
  Animated,
} from 'react-native'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import { useAppStore, SavedApp } from '../../store/appStore'
import { keychainManager } from '../../services/storage/keychain'
import { createLLMService } from '../../services/llm/factory'
import { DynamicJSXExecutor } from '../../components/DynamicJSXExecutor'
import { ErrorBoundary } from '../../components/ErrorBoundary'
import { ImmersiveToolbar } from '../../components/ImmersiveToolbar'
import { RefinementBar } from '../../components/RefinementBar'
import { GeneratingOverlay } from '../../components/GeneratingOverlay'
import { Colors, Spacing } from '../../constants/theme'

export default function PreviewScreen() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const router = useRouter()
  const app = useAppStore((s) => s.apps.find((a) => a.id === id))
  const saveApp = useAppStore((s) => s.saveApp)
  const deleteApp = useAppStore((s) => s.deleteApp)
  const settings = useAppStore((s) => s.settings)
  const setAppVisibility = useAppStore((s) => s.setAppVisibility)

  const [toolbarVisible, setToolbarVisible] = useState(false)
  const [showRefinement, setShowRefinement] = useState(false)
  const [isRefining, setIsRefining] = useState(false)
  const [refineError, setRefineError] = useState<string | null>(null)
  const hideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const toggleToolbar = useCallback(() => {
    setToolbarVisible((v) => {
      const next = !v
      if (hideTimerRef.current) clearTimeout(hideTimerRef.current)
      if (next) {
        hideTimerRef.current = setTimeout(() => setToolbarVisible(false), 3000)
      }
      return next
    })
  }, [])

  const handleRefine = useCallback(
    async (refinementPrompt: string) => {
      if (!app) return
      setIsRefining(true)
      setRefineError(null)
      try {
        const apiKey = await keychainManager.retrieveAPIKey(settings.selectedProvider)
        if (!apiKey) throw new Error(`No API key for ${settings.selectedProvider}`)
        const llm = createLLMService(settings.selectedProvider, apiKey)
        const newJSX = await llm.refineJSX(app.generatedJSX, refinementPrompt)
        saveApp({
          ...app,
          generatedJSX: newJSX,
          updatedDate: new Date().toISOString(),
        })
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Refinement failed'
        setRefineError(msg)
        Alert.alert('Refinement Failed', msg)
      } finally {
        setIsRefining(false)
      }
    },
    [app, settings.selectedProvider, saveApp]
  )

  const handleDelete = useCallback(() => {
    if (!app) return
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
  }, [app, deleteApp, router])

  const handleToggleRefine = useCallback(() => {
    setShowRefinement((v) => !v)
    if (hideTimerRef.current) clearTimeout(hideTimerRef.current)
  }, [])

  if (!app) {
    return (
      <View style={styles.container}>
        <ImmersiveToolbar visible title="Not Found" onBack={() => router.back()} />
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <View style={styles.executor}>
        <ErrorBoundary>
          <DynamicJSXExecutor code={app.generatedJSX} />
        </ErrorBoundary>
      </View>

      {/* Pill toggle — always visible */}
      {!showRefinement && (
        <TouchableOpacity
          style={styles.pullTab}
          onPress={toggleToolbar}
          activeOpacity={0.6}
        >
          <View style={styles.pullTabDot} />
        </TouchableOpacity>
      )}

      <ImmersiveToolbar
        visible={toolbarVisible}
        title={app.name}
        onBack={() => router.back()}
        onRefine={handleToggleRefine}
        onDelete={handleDelete}
        visibility={app.visibility ?? 'private'}
        onToggleVisibility={() => {
          const next = app.visibility === 'public' ? 'private' : 'public'
          setAppVisibility(app.id, next)
          Alert.alert(
            next === 'public' ? 'Published' : 'Made private',
            next === 'public'
              ? `"${app.name}" is now visible in the public gallery.`
              : `"${app.name}" is now only visible to you.`
          )
        }}
      />

      {showRefinement && (
        <RefinementBar
          onSubmit={handleRefine}
          disabled={isRefining}
        />
      )}

      <GeneratingOverlay
        visible={isRefining}
        provider={settings.selectedProvider}
      />
      <StatusBar hidden={!toolbarVisible && !showRefinement} />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  executor: {
    flex: 1,
  },
  pullTab: {
    position: 'absolute',
    top: 52,
    alignSelf: 'center',
    width: 44,
    height: 20,
    borderRadius: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 40,
  },
  pullTabDot: {
    width: 28,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
})
