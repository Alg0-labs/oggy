import React, { useCallback, useEffect, useRef, useState } from 'react'
import {
  View,
  Text,
  StyleSheet,
  Alert,
  TouchableOpacity,
} from 'react-native'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import { useAppStore } from '../../store/appStore'
import { useAppChat } from '../../hooks/useGeneration'
import { DynamicJSXExecutor } from '../../components/DynamicJSXExecutor'
import { ErrorBoundary } from '../../components/ErrorBoundary'
import { ImmersiveToolbar } from '../../components/ImmersiveToolbar'
import { ChatPanel } from '../../components/ChatPanel'
import { GeneratingMessage } from '../../components/GeneratingMessage'
import { Colors, Radius, Spacing, Type } from '../../constants/theme'

export default function PreviewScreen() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const router = useRouter()
  const deleteApp = useAppStore((s) => s.deleteApp)
  const setAppVisibility = useAppStore((s) => s.setAppVisibility)
  const { app, messages, currentJSX, generating, pending, send, cancel } = useAppChat(id)

  const [toolbarVisible, setToolbarVisible] = useState(false)
  // Chat auto-opens when there's no JSX yet (first generation) — it's the only content to show.
  const [chatOpen, setChatOpen] = useState<boolean>(!currentJSX)
  const [shownJsx, setShownJsx] = useState<string | null>(currentJSX)
  const [shownMsgId, setShownMsgId] = useState<string | undefined>(undefined)
  const hideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Track the latest success message → shownJsx defaults to latest.
  useEffect(() => {
    if (!currentJSX) {
      setShownJsx(null)
      setShownMsgId(undefined)
      return
    }
    // Only auto-advance if user hasn't explicitly pinned an older version.
    const latestSuccess = [...(messages || [])]
      .reverse()
      .find((m) => m.role === 'assistant' && m.status === 'success' && m.jsx)
    if (!shownMsgId || shownMsgId === latestSuccess?.id) {
      setShownJsx(currentJSX)
      setShownMsgId(latestSuccess?.id)
    }
  }, [currentJSX, messages, shownMsgId])

  // Auto-open chat when generation starts mid-session.
  useEffect(() => {
    if (generating) setChatOpen(true)
  }, [generating])

  const toggleToolbar = useCallback(() => {
    setToolbarVisible((v) => {
      const next = !v
      if (hideTimerRef.current) clearTimeout(hideTimerRef.current)
      if (next) hideTimerRef.current = setTimeout(() => setToolbarVisible(false), 3000)
      return next
    })
  }, [])

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

  const handleToggleVisibility = useCallback(() => {
    if (!app) return
    const next = app.visibility === 'public' ? 'private' : 'public'
    setAppVisibility(app.id, next)
  }, [app, setAppVisibility])

  if (!app) {
    return (
      <View style={styles.container}>
        <ImmersiveToolbar visible title="Not Found" onBack={() => router.back()} />
      </View>
    )
  }

  const firstGeneration = !currentJSX && generating

  return (
    <View style={styles.container}>
      {/* Preview surface — or empty-state placeholder while first generating */}
      <View style={styles.executor}>
        {shownJsx ? (
          <ErrorBoundary key={shownMsgId || 'current'}>
            <DynamicJSXExecutor code={shownJsx} />
          </ErrorBoundary>
        ) : (
          <View style={styles.placeholder}>
            {firstGeneration && pending ? (
              <GeneratingMessage message={pending} onCancel={cancel} />
            ) : (
              <>
                <Text style={styles.placeholderTitle}>No preview yet</Text>
                <Text style={styles.placeholderText}>
                  Send a prompt below to generate this app.
                </Text>
              </>
            )}
          </View>
        )}
      </View>

      {/* Pill toggle — only shown when the chat isn't open, to avoid overlap */}
      {!chatOpen && !toolbarVisible && (
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
        onRefine={() => setChatOpen((v) => !v)}
        refineActive={chatOpen}
        onDelete={handleDelete}
        visibility={app.visibility ?? 'private'}
        onToggleVisibility={handleToggleVisibility}
      />

      {chatOpen && (
        <ChatPanel
          messages={messages}
          onSend={send}
          onCancel={cancel}
          generating={generating}
          activeJsxMessageId={shownMsgId}
          title={app.name}
          onBack={() => router.back()}
          onClose={() => setChatOpen(false)}
          onMessagePress={(m) => {
            if (m.jsx) {
              setShownJsx(m.jsx)
              setShownMsgId(m.id)
            }
          }}
        />
      )}

      <StatusBar hidden={!toolbarVisible && !chatOpen} />
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
  placeholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.xl,
    gap: Spacing.sm,
  },
  placeholderTitle: {
    ...Type.heading3,
    color: Colors.text,
  },
  placeholderText: {
    ...Type.body,
    color: Colors.textSecondary,
    textAlign: 'center',
    maxWidth: 280,
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
