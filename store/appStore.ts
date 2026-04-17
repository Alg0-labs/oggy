import { create } from 'zustand'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { createJSONStorage, persist } from 'zustand/middleware'

export type LLMProvider = 'openai' | 'google' | 'anthropic'

export type MessageStatus = 'generating' | 'success' | 'error' | 'cancelled'

export interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  /** Body text — for user messages, the prompt. For assistant, optional label / error text. */
  content: string
  /** Assistant messages only, populated on success. */
  jsx?: string
  status: MessageStatus
  error?: string
  provider?: LLMProvider
  startedAt?: number
  completedAt?: number
  /** ETA in ms captured at request-start. UI uses this + startedAt for countdown. */
  estimatedMs?: number
}

export interface SavedApp {
  id: string
  name: string
  messages: ChatMessage[]
  /** Latest successful assistant JSX — cached for perf / direct executor access. */
  currentJSX: string | null
  modelUsed: string
  createdDate: string
  updatedDate: string
  visibility?: 'public' | 'private'
}

export interface AppSettings {
  selectedProvider: LLMProvider
  /** EWMA per-provider generation time in ms. Feeds ETA. */
  providerEta: Record<LLMProvider, number>
}

interface AppState {
  apps: SavedApp[]
  settings: AppSettings

  // App actions
  createApp: (app: SavedApp) => void
  saveApp: (app: SavedApp) => void
  deleteApp: (id: string) => void
  getAppById: (id: string) => SavedApp | undefined
  setAppVisibility: (id: string, visibility: 'public' | 'private') => void
  renameApp: (id: string, name: string) => void

  // Message actions
  appendMessage: (appId: string, message: ChatMessage) => void
  updateMessage: (appId: string, messageId: string, patch: Partial<ChatMessage>) => void
  completeAssistantMessage: (appId: string, messageId: string, jsx: string) => void
  failAssistantMessage: (appId: string, messageId: string, error: string, status?: 'error' | 'cancelled') => void

  // ETA
  recordGenerationTime: (provider: LLMProvider, ms: number) => void

  // Settings
  setSetting: <K extends keyof AppSettings>(key: K, value: AppSettings[K]) => void
}

const DEFAULT_ETA: Record<LLMProvider, number> = {
  openai: 25000,
  google: 8000,
  anthropic: 30000,
}

/** Exponentially-weighted moving average — weight 0.3 toward new observations. */
const EWMA_ALPHA = 0.3

function updateCurrentJSX(app: SavedApp): SavedApp {
  // Latest successful assistant message wins.
  for (let i = app.messages.length - 1; i >= 0; i--) {
    const m = app.messages[i]
    if (m.role === 'assistant' && m.status === 'success' && m.jsx) {
      return { ...app, currentJSX: m.jsx }
    }
  }
  return { ...app, currentJSX: null }
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      apps: [],
      settings: {
        selectedProvider: 'openai',
        providerEta: { ...DEFAULT_ETA },
      },

      createApp: (app) => {
        set({ apps: [app, ...get().apps] })
      },

      saveApp: (app) => {
        const { apps } = get()
        const idx = apps.findIndex((a) => a.id === app.id)
        const updated = updateCurrentJSX({
          ...app,
          updatedDate: new Date().toISOString(),
        })
        if (idx >= 0) {
          const next = [...apps]
          next[idx] = updated
          set({ apps: next })
        } else {
          set({ apps: [updated, ...apps] })
        }
      },

      deleteApp: (id) => {
        set({ apps: get().apps.filter((a) => a.id !== id) })
      },

      getAppById: (id) => get().apps.find((a) => a.id === id),

      setAppVisibility: (id, visibility) => {
        set({
          apps: get().apps.map((a) =>
            a.id === id
              ? { ...a, visibility, updatedDate: new Date().toISOString() }
              : a
          ),
        })
      },

      renameApp: (id, name) => {
        set({
          apps: get().apps.map((a) =>
            a.id === id ? { ...a, name, updatedDate: new Date().toISOString() } : a
          ),
        })
      },

      appendMessage: (appId, message) => {
        set({
          apps: get().apps.map((a) =>
            a.id === appId
              ? updateCurrentJSX({
                  ...a,
                  messages: [...a.messages, message],
                  updatedDate: new Date().toISOString(),
                })
              : a
          ),
        })
      },

      updateMessage: (appId, messageId, patch) => {
        set({
          apps: get().apps.map((a) => {
            if (a.id !== appId) return a
            const messages = a.messages.map((m) =>
              m.id === messageId ? { ...m, ...patch } : m
            )
            return updateCurrentJSX({
              ...a,
              messages,
              updatedDate: new Date().toISOString(),
            })
          }),
        })
      },

      completeAssistantMessage: (appId, messageId, jsx) => {
        get().updateMessage(appId, messageId, {
          status: 'success',
          jsx,
          completedAt: Date.now(),
        })
      },

      failAssistantMessage: (appId, messageId, error, status = 'error') => {
        get().updateMessage(appId, messageId, {
          status,
          error,
          completedAt: Date.now(),
        })
      },

      recordGenerationTime: (provider, ms) => {
        set((state) => {
          const prev = state.settings.providerEta[provider] ?? DEFAULT_ETA[provider]
          const next = Math.round(prev * (1 - EWMA_ALPHA) + ms * EWMA_ALPHA)
          return {
            settings: {
              ...state.settings,
              providerEta: { ...state.settings.providerEta, [provider]: next },
            },
          }
        })
      },

      setSetting: (key, value) => {
        set((state) => ({
          settings: { ...state.settings, [key]: value },
        }))
      },
    }),
    {
      name: 'oggy-store',
      storage: createJSONStorage(() => AsyncStorage),
      version: 1,
      partialize: (state) => ({
        apps: state.apps,
        settings: state.settings,
      }),
      migrate: (persisted: any, fromVersion: number) => {
        if (!persisted) return persisted
        let state = persisted
        // v0 → v1: flatten prompt/generatedJSX into messages
        if (fromVersion < 1) {
          const apps: SavedApp[] = (state.apps || []).map((old: any) => {
            if (Array.isArray(old.messages)) return old as SavedApp
            const now = old.createdDate || new Date().toISOString()
            const messages: ChatMessage[] = []
            if (old.prompt) {
              messages.push({
                id: `msg_${old.id}_u0`,
                role: 'user',
                content: old.prompt,
                status: 'success',
              })
            }
            if (old.generatedJSX) {
              messages.push({
                id: `msg_${old.id}_a0`,
                role: 'assistant',
                content: '',
                jsx: old.generatedJSX,
                status: 'success',
                provider: old.modelUsed,
              })
            }
            return {
              id: old.id,
              name: old.name,
              messages,
              currentJSX: old.generatedJSX || null,
              modelUsed: old.modelUsed || 'openai',
              createdDate: now,
              updatedDate: old.updatedDate || now,
              visibility: old.visibility,
            }
          })
          state = {
            ...state,
            apps,
            settings: {
              selectedProvider: state.settings?.selectedProvider || 'openai',
              providerEta: state.settings?.providerEta || { ...DEFAULT_ETA },
            },
          }
        }
        return state
      },
    }
  )
)

// Derived selectors
export function isAppGenerating(app: SavedApp | undefined): boolean {
  if (!app) return false
  return app.messages.some((m) => m.status === 'generating')
}

export function getPendingMessage(app: SavedApp | undefined): ChatMessage | undefined {
  return app?.messages.find((m) => m.status === 'generating')
}

/** First user message content — used for card previews, alerts, search. */
export function getAppPrompt(app: SavedApp | undefined): string {
  if (!app) return ''
  const first = app.messages.find((m) => m.role === 'user')
  return first?.content || ''
}
