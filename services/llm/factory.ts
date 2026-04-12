import { LLMProvider, LLMService } from './index'
import { OpenAILLMService } from './openai'
import { GoogleLLMService } from './google'
import { AnthropicLLMService } from './anthropic'

export function createLLMService(provider: LLMProvider, apiKey: string): LLMService {
  switch (provider) {
    case 'openai':
      return new OpenAILLMService(apiKey)
    case 'google':
      return new GoogleLLMService(apiKey)
    case 'anthropic':
      return new AnthropicLLMService(apiKey)
    case 'offline':
      throw new Error('Offline mode coming in Phase 2')
    default:
      throw new Error(`Unknown provider: ${provider}`)
  }
}
