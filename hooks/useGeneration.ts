import { useCallback } from 'react'
import { useAppStore, SavedApp } from '../store/appStore'
import { keychainManager } from '../services/storage/keychain'
import { createLLMService } from '../services/llm/factory'

export function useGeneration() {
  const generation = useAppStore((s) => s.generation)
  const settings = useAppStore((s) => s.settings)
  const startGeneration = useAppStore((s) => s.startGeneration)
  const completeGeneration = useAppStore((s) => s.completeGeneration)
  const failGeneration = useAppStore((s) => s.failGeneration)
  const resetGeneration = useAppStore((s) => s.resetGeneration)
  const saveApp = useAppStore((s) => s.saveApp)

  const generate = useCallback(
    async (prompt: string) => {
      startGeneration(prompt)

      try {
        const provider = settings.selectedProvider
        const apiKey = await keychainManager.retrieveAPIKey(provider)

        if (!apiKey) {
          throw new Error(`No API key found for ${provider}. Add one in Settings.`)
        }

        const llm = createLLMService(provider, apiKey)
        const jsx = await llm.generateJSX(prompt)
        completeGeneration(jsx)
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Generation failed'
        failGeneration(message)
      }
    },
    [settings.selectedProvider, startGeneration, completeGeneration, failGeneration]
  )

  const save = useCallback(
    async (name: string) => {
      if (!generation.generatedJSX || !generation.prompt) return

      const now = new Date().toISOString()
      const app: SavedApp = {
        id: `app_${Date.now()}`,
        name,
        prompt: generation.prompt,
        generatedJSX: generation.generatedJSX,
        createdDate: now,
        updatedDate: now,
        modelUsed: settings.selectedProvider,
        status: 'success',
      }

      saveApp(app)
      resetGeneration()
    },
    [generation, settings.selectedProvider, saveApp, resetGeneration]
  )

  return {
    ...generation,
    generate,
    save,
    reset: resetGeneration,
  }
}
