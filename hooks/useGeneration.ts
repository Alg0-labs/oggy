import { useCallback } from 'react'
import { useRouter } from 'expo-router'
import {
  useAppStore,
  SavedApp,
  ChatMessage,
  LLMProvider,
  getPendingMessage,
  isAppGenerating,
} from '../store/appStore'
import { startJob, cancelJob, cancelAllJobsForApp } from '../services/llm/generationManager'

function newId(prefix: string): string {
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`
}

function autoNameFromPrompt(prompt: string): string {
  const trimmed = prompt.trim().replace(/\s+/g, ' ')
  if (trimmed.length <= 40) return trimmed
  return trimmed.slice(0, 37).trimEnd() + '…'
}

/**
 * Create a new app from the first prompt and kick off generation.
 * Returns the new app's id. Navigation is the caller's responsibility.
 */
export function useCreateApp() {
  const createApp = useAppStore((s) => s.createApp)
  const appendMessage = useAppStore((s) => s.appendMessage)
  const settings = useAppStore((s) => s.settings)

  return useCallback(
    (prompt: string): string => {
      const trimmed = prompt.trim()
      if (!trimmed) throw new Error('Prompt is empty')

      const provider = settings.selectedProvider
      const now = new Date().toISOString()
      const appId = newId('app')
      const userMsgId = newId('msg')
      const assistantMsgId = newId('msg')
      const eta = settings.providerEta[provider]

      const userMsg: ChatMessage = {
        id: userMsgId,
        role: 'user',
        content: trimmed,
        status: 'success',
      }
      const assistantMsg: ChatMessage = {
        id: assistantMsgId,
        role: 'assistant',
        content: '',
        status: 'generating',
        provider,
        startedAt: Date.now(),
        estimatedMs: eta,
      }

      const app: SavedApp = {
        id: appId,
        name: autoNameFromPrompt(trimmed),
        messages: [userMsg, assistantMsg],
        currentJSX: null,
        modelUsed: provider,
        createdDate: now,
        updatedDate: now,
      }
      createApp(app)

      // Fire async — navigation should be immediate.
      void startJob({
        appId,
        messageId: assistantMsgId,
        provider,
        prompt: trimmed,
        previousJSX: null,
      })

      return appId
    },
    [createApp, appendMessage, settings]
  )
}

/**
 * Chat hook for a single app. Covers both in-progress (refine while still
 * generating? — no, disabled for now) and completed apps; the UI is the same.
 */
export function useAppChat(appId: string | undefined) {
  const app = useAppStore((s) =>
    appId ? s.apps.find((a) => a.id === appId) : undefined
  )
  const appendMessage = useAppStore((s) => s.appendMessage)
  const settings = useAppStore((s) => s.settings)

  const pending = getPendingMessage(app)
  const generating = isAppGenerating(app)

  const send = useCallback(
    (text: string) => {
      if (!app) return
      const trimmed = text.trim()
      if (!trimmed) return
      if (generating) return // disabled while generating

      const provider = settings.selectedProvider
      const userMsgId = newId('msg')
      const assistantMsgId = newId('msg')
      const eta = settings.providerEta[provider]
      const previousJSX = app.currentJSX

      appendMessage(app.id, {
        id: userMsgId,
        role: 'user',
        content: trimmed,
        status: 'success',
      })
      appendMessage(app.id, {
        id: assistantMsgId,
        role: 'assistant',
        content: '',
        status: 'generating',
        provider,
        startedAt: Date.now(),
        estimatedMs: eta,
      })

      void startJob({
        appId: app.id,
        messageId: assistantMsgId,
        provider,
        prompt: trimmed,
        previousJSX,
      })
    },
    [app, generating, appendMessage, settings]
  )

  const cancel = useCallback(() => {
    if (pending) cancelJob(pending.id)
  }, [pending])

  const cancelAll = useCallback(() => {
    if (app) cancelAllJobsForApp(app.id)
  }, [app])

  return {
    app,
    messages: app?.messages || [],
    currentJSX: app?.currentJSX || null,
    generating,
    pending,
    send,
    cancel,
    cancelAll,
  }
}

/**
 * Lightweight selector for the tab badge / gallery pulse — how many apps have
 * an active generation right now?
 */
export function useActiveGenerationCount(): number {
  return useAppStore((s) =>
    s.apps.reduce(
      (n, app) => n + (app.messages.some((m) => m.status === 'generating') ? 1 : 0),
      0
    )
  )
}
