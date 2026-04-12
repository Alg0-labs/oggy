import { LLMService, getSystemPrompt } from './index'
import { extractJSXFromMarkdown } from './utils'

export class OpenAILLMService implements LLMService {
  private apiKey: string
  private model: string = 'gpt-4'
  private baseURL: string = 'https://api.openai.com/v1'

  constructor(apiKey: string, model?: string) {
    if (!apiKey) throw new Error('OpenAI API key is required')
    this.apiKey = apiKey
    if (model) this.model = model
  }

  async generateJSX(userPrompt: string): Promise<string> {
    const response = await fetch(`${this.baseURL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        model: this.model,
        messages: [
          { role: 'system', content: getSystemPrompt() },
          { role: 'user', content: userPrompt },
        ],
        temperature: 0.7,
        max_tokens: 4096,
      }),
    })

    if (!response.ok) {
      const err = await response.json().catch(() => ({}))
      throw new Error(`OpenAI ${response.status}: ${err.error?.message || 'Unknown error'}`)
    }

    const data = await response.json()
    const content = data.choices?.[0]?.message?.content
    if (!content) throw new Error('Empty response from OpenAI')

    return extractJSXFromMarkdown(content)
  }

  async testConnection(): Promise<boolean> {
    try {
      const res = await fetch(`${this.baseURL}/models`, {
        headers: { Authorization: `Bearer ${this.apiKey}` },
      })
      return res.ok
    } catch {
      return false
    }
  }
}
