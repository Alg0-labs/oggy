import { NativeModule, requireNativeModule, EventEmitter } from 'expo-modules-core'

interface DownloadProgressEvent {
  modelId: string
  progress: number
}

interface OggyMLXModuleType extends NativeModule {
  downloadModel(modelId: string): Promise<void>
  cancelDownload(modelId: string): Promise<void>
  deleteModel(modelId: string): Promise<void>
  isModelDownloaded(modelId: string): Promise<boolean>
  getModelSizeOnDisk(modelId: string): Promise<number>
  loadModel(modelId: string): Promise<void>
  unloadModel(): Promise<void>
  isModelLoaded(): Promise<boolean>
  generate(
    systemPrompt: string,
    userPrompt: string,
    maxTokens: number,
    temperature: number
  ): Promise<string>
}

let OggyMLXModule: OggyMLXModuleType | null = null

try {
  OggyMLXModule = requireNativeModule<OggyMLXModuleType>('OggyMLX')
} catch {
  // Native module not available (Expo Go / web)
}

export function isAvailable(): boolean {
  return OggyMLXModule !== null
}

export async function downloadModel(modelId: string): Promise<void> {
  if (!OggyMLXModule) throw new Error('Offline mode requires a development build. Run: npx expo run:ios')
  return OggyMLXModule.downloadModel(modelId)
}

export async function cancelDownload(modelId: string): Promise<void> {
  if (!OggyMLXModule) throw new Error('Native module not available')
  return OggyMLXModule.cancelDownload(modelId)
}

export async function deleteModel(modelId: string): Promise<void> {
  if (!OggyMLXModule) throw new Error('Native module not available')
  return OggyMLXModule.deleteModel(modelId)
}

export async function isModelDownloaded(modelId: string): Promise<boolean> {
  if (!OggyMLXModule) return false
  return OggyMLXModule.isModelDownloaded(modelId)
}

export async function getModelSizeOnDisk(modelId: string): Promise<number> {
  if (!OggyMLXModule) return 0
  return OggyMLXModule.getModelSizeOnDisk(modelId)
}

export async function loadModel(modelId: string): Promise<void> {
  if (!OggyMLXModule) throw new Error('Native module not available')
  return OggyMLXModule.loadModel(modelId)
}

export async function unloadModel(): Promise<void> {
  if (!OggyMLXModule) throw new Error('Native module not available')
  return OggyMLXModule.unloadModel()
}

export async function isModelLoaded(): Promise<boolean> {
  if (!OggyMLXModule) return false
  return OggyMLXModule.isModelLoaded()
}

export async function generate(
  systemPrompt: string,
  userPrompt: string,
  maxTokens: number = 4096,
  temperature: number = 0.7
): Promise<string> {
  if (!OggyMLXModule) throw new Error('Native module not available')
  return OggyMLXModule.generate(systemPrompt, userPrompt, maxTokens, temperature)
}

export function addDownloadProgressListener(
  listener: (event: DownloadProgressEvent) => void
): { remove: () => void } {
  if (!OggyMLXModule) return { remove: () => {} }
  const emitter = new EventEmitter(OggyMLXModule)
  const sub = emitter.addListener('onDownloadProgress', listener)
  return sub
}

export const MODEL_IDS = {
  E4B: 'gemma-3-4b-it-4bit',
  E8B: 'gemma-3-8b-it-4bit',
} as const

export const MODEL_INFO: Record<string, { name: string; size: string; sizeBytes: number }> = {
  [MODEL_IDS.E4B]: { name: 'Gemma 3 4B', size: '~2.5 GB', sizeBytes: 2_500_000_000 },
  [MODEL_IDS.E8B]: { name: 'Gemma 3 8B', size: '~5 GB', sizeBytes: 5_000_000_000 },
}
