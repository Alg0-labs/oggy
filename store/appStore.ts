import { create } from 'zustand'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { createJSONStorage, persist } from 'zustand/middleware'

export interface SavedApp {
  id: string
  name: string
  prompt: string
  generatedJSX: string
  createdDate: string
  updatedDate: string
  modelUsed: string
  status: 'success' | 'error'
  errorMessage?: string
}

export interface AppSettings {
  offlineMode: boolean
  selectedModel: 'e4b' | 'e8b'
  selectedProvider: 'openai' | 'google' | 'anthropic'
}

export interface GenerationState {
  status: 'idle' | 'generating' | 'success' | 'error'
  prompt: string | null
  generatedJSX: string | null
  error: string | null
}

interface AppState {
  apps: SavedApp[]
  generation: GenerationState
  settings: AppSettings
  isOfflineModelDownloaded: Record<string, boolean>

  // App actions
  saveApp: (app: SavedApp) => void
  deleteApp: (id: string) => void
  getAppById: (id: string) => SavedApp | undefined

  // Generation actions
  startGeneration: (prompt: string) => void
  completeGeneration: (jsx: string) => void
  failGeneration: (error: string) => void
  resetGeneration: () => void

  // Settings
  setSetting: <K extends keyof AppSettings>(key: K, value: AppSettings[K]) => void
  setModelStatus: (quantization: string, downloaded: boolean) => void
}

const initialGeneration: GenerationState = {
  status: 'idle',
  prompt: null,
  generatedJSX: null,
  error: null,
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      apps: [],
      generation: initialGeneration,
      settings: {
        offlineMode: false,
        selectedModel: 'e4b',
        selectedProvider: 'openai',
      },
      isOfflineModelDownloaded: {},

      saveApp: (app: SavedApp) => {
        const { apps } = get()
        const idx = apps.findIndex((a) => a.id === app.id)
        if (idx >= 0) {
          const updated = [...apps]
          updated[idx] = { ...app, updatedDate: new Date().toISOString() }
          set({ apps: updated })
        } else {
          set({ apps: [...apps, app] })
        }
      },

      deleteApp: (id: string) => {
        set({ apps: get().apps.filter((a) => a.id !== id) })
      },

      getAppById: (id: string) => {
        return get().apps.find((a) => a.id === id)
      },

      startGeneration: (prompt: string) => {
        set({
          generation: { status: 'generating', prompt, generatedJSX: null, error: null },
        })
      },

      completeGeneration: (jsx: string) => {
        set((state) => ({
          generation: { ...state.generation, status: 'success', generatedJSX: jsx, error: null },
        }))
      },

      failGeneration: (error: string) => {
        set((state) => ({
          generation: { ...state.generation, status: 'error', error },
        }))
      },

      resetGeneration: () => {
        set({ generation: initialGeneration })
      },

      setSetting: (key, value) => {
        set((state) => ({
          settings: { ...state.settings, [key]: value },
        }))
      },

      setModelStatus: (quantization: string, downloaded: boolean) => {
        set((state) => ({
          isOfflineModelDownloaded: {
            ...state.isOfflineModelDownloaded,
            [quantization]: downloaded,
          },
        }))
      },
    }),
    {
      name: 'oggy-store',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        apps: state.apps,
        settings: state.settings,
        isOfflineModelDownloaded: state.isOfflineModelDownloaded,
      }),
    }
  )
)
