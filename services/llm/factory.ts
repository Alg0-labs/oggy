import { LLMProvider, LLMService } from './index'
import { OpenAILLMService } from './openai'
import { GoogleLLMService } from './google'
import { AnthropicLLMService } from './anthropic'
import { OfflineLLMService } from './offline'

export function createLLMService(
  provider: LLMProvider,
  apiKey: string,
  modelId?: string
): LLMService {
  switch (provider) {
    case 'openai':
      return new OpenAILLMService(apiKey)
    case 'google':
      return new GoogleLLMService(apiKey)
    case 'anthropic':
      return new AnthropicLLMService(apiKey)
    case 'offline':
      if (!modelId) throw new Error('Model ID required for offline mode')
      return new OfflineLLMService(modelId)
    default:
      throw new Error(`Unknown provider: ${provider}`)
  }
}
