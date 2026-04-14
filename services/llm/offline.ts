import { LLMService, getSystemPrompt, getRefineSystemPrompt } from './index'
import { extractJSXFromMarkdown } from './utils'
import * as OggyMLX from '../../modules/oggy-mlx'

export class OfflineLLMService implements LLMService {
  private modelId: string

  constructor(modelId: string) {
    if (!OggyMLX.isAvailable()) {
      throw new Error('Offline mode requires a development build. Run: npx expo run:ios')
    }
    this.modelId = modelId
  }

  async generateJSX(prompt: string): Promise<string> {
    await OggyMLX.loadModel(this.modelId)
    const response = await OggyMLX.generate(getSystemPrompt(), prompt, 4096, 0.7)
    return extractJSXFromMarkdown(response)
  }

  async refineJSX(currentCode: string, refinementPrompt: string): Promise<string> {
    await OggyMLX.loadModel(this.modelId)
    const response = await OggyMLX.generate(
      getRefineSystemPrompt(currentCode),
      refinementPrompt,
      4096,
      0.7
    )
    return extractJSXFromMarkdown(response)
  }

  async testConnection(): Promise<boolean> {
    return OggyMLX.isModelDownloaded(this.modelId)
  }
}
