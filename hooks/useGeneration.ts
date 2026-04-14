import { useCallback } from 'react'
import { useAppStore, SavedApp } from '../store/appStore'
import { keychainManager } from '../services/storage/keychain'
import { createLLMService } from '../services/llm/factory'
import { MODEL_IDS } from '../modules/oggy-mlx'

function getModelIdForSetting(selectedModel: 'e4b' | 'e8b'): string {
  return selectedModel === 'e4b' ? MODEL_IDS.E4B : MODEL_IDS.E8B
}

export function useGeneration() {
  const generation = useAppStore((s) => s.generation)
  const settings = useAppStore((s) => s.settings)
  const startGeneration = useAppStore((s) => s.startGeneration)
  const completeGeneration = useAppStore((s) => s.completeGeneration)
  const failGeneration = useAppStore((s) => s.failGeneration)
  const resetGeneration = useAppStore((s) => s.resetGeneration)
  const saveApp = useAppStore((s) => s.saveApp)

  const getLLMService = useCallback(async () => {
    if (settings.offlineMode) {
      const modelId = getModelIdForSetting(settings.selectedModel)
      return createLLMService('offline', '', modelId)
    }
    const provider = settings.selectedProvider
    const apiKey = await keychainManager.retrieveAPIKey(provider)
    if (!apiKey) {
      throw new Error(`No API key found for ${provider}. Add one in Settings.`)
    }
    return createLLMService(provider, apiKey)
  }, [settings.offlineMode, settings.selectedModel, settings.selectedProvider])

  const generate = useCallback(
    async (prompt: string) => {
      startGeneration(prompt)
      try {
        const llm = await getLLMService()
        const jsx = await llm.generateJSX(prompt)
        completeGeneration(jsx)
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Generation failed'
        failGeneration(message)
      }
    },
    [getLLMService, startGeneration, completeGeneration, failGeneration]
  )

  const refine = useCallback(
    async (currentCode: string, refinementPrompt: string) => {
      startGeneration(refinementPrompt)
      try {
        const llm = await getLLMService()
        const jsx = await llm.refineJSX(currentCode, refinementPrompt)
        completeGeneration(jsx)
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Refinement failed'
        failGeneration(message)
      }
    },
    [getLLMService, startGeneration, completeGeneration, failGeneration]
  )

  const save = useCallback(
    async (name: string) => {
      if (!generation.generatedJSX || !generation.prompt) return

      const now = new Date().toISOString()
      const modelUsed = settings.offlineMode
        ? `offline:${settings.selectedModel}`
        : settings.selectedProvider

      const app: SavedApp = {
        id: `app_${Date.now()}`,
        name,
        prompt: generation.prompt,
        generatedJSX: generation.generatedJSX,
        createdDate: now,
        updatedDate: now,
        modelUsed,
        status: 'success',
      }

      saveApp(app)
      resetGeneration()
    },
    [generation, settings, saveApp, resetGeneration]
  )

  return {
    ...generation,
    generate,
    refine,
    save,
    reset: resetGeneration,
  }
}
