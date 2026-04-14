import { LLMService, getSystemPrompt, getRefineSystemPrompt } from './index'
import { extractJSXFromMarkdown } from './utils'

export class AnthropicLLMService implements LLMService {
  private apiKey: string
  private model: string = 'claude-sonnet-4-20250514'
  private baseURL: string = 'https://api.anthropic.com/v1'

  constructor(apiKey: string, model?: string) {
    if (!apiKey) throw new Error('Anthropic API key is required')
    this.apiKey = apiKey
    if (model) this.model = model
  }

  async generateJSX(userPrompt: string): Promise<string> {
    const response = await fetch(`${this.baseURL}/messages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': this.apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: this.model,
        max_tokens: 4096,
        system: getSystemPrompt(),
        messages: [{ role: 'user', content: userPrompt }],
      }),
    })

    if (!response.ok) {
      const err = await response.json().catch(() => ({}))
      throw new Error(`Anthropic ${response.status}: ${err.error?.message || 'Unknown error'}`)
    }

    const data = await response.json()
    const textBlock = data.content?.find((b: any) => b.type === 'text')
    if (!textBlock?.text) throw new Error('Empty response from Anthropic')

    return extractJSXFromMarkdown(textBlock.text)
  }

  async refineJSX(currentCode: string, refinementPrompt: string): Promise<string> {
    const response = await fetch(`${this.baseURL}/messages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': this.apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: this.model,
        max_tokens: 4096,
        system: getRefineSystemPrompt(currentCode),
        messages: [{ role: 'user', content: refinementPrompt }],
      }),
    })

    if (!response.ok) {
      const err = await response.json().catch(() => ({}))
      throw new Error(`Anthropic ${response.status}: ${err.error?.message || 'Unknown error'}`)
    }

    const data = await response.json()
    const textBlock = data.content?.find((b: any) => b.type === 'text')
    if (!textBlock?.text) throw new Error('Empty response from Anthropic')

    return extractJSXFromMarkdown(textBlock.text)
  }

  async testConnection(): Promise<boolean> {
    try {
      const res = await fetch(`${this.baseURL}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': this.apiKey,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          model: this.model,
          max_tokens: 1,
          messages: [{ role: 'user', content: 'hi' }],
        }),
      })
      return res.ok
    } catch {
      return false
    }
  }
}
