import { LLMService, getSystemPrompt, getRefineSystemPrompt } from './index'
import { extractJSXFromMarkdown } from './utils'

export class GoogleLLMService implements LLMService {
  private apiKey: string
  private model: string = 'gemini-3-flash-preview'
  private baseURL: string = 'https://generativelanguage.googleapis.com/v1beta'

  constructor(apiKey: string, model?: string) {
    if (!apiKey) throw new Error('Google AI API key is required')
    this.apiKey = apiKey
    if (model) this.model = model
  }

  async generateJSX(userPrompt: string, signal?: AbortSignal): Promise<string> {
    const url = `${this.baseURL}/models/${this.model}:generateContent?key=${this.apiKey}`

    const response = await fetch(url, {
      method: 'POST',
      signal,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        systemInstruction: {
          parts: [{ text: getSystemPrompt() }],
        },
        contents: [
          {
            role: 'user',
            parts: [{ text: userPrompt }],
          },
        ],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 32768,
          topP: 0.9,
        },
      }),
    })

    if (!response.ok) {
      const err = await response.json().catch(() => ({}))
      throw new Error(`Google AI ${response.status}: ${err.error?.message || 'Unknown error'}`)
    }

    const data = await response.json()
    const content = data.candidates?.[0]?.content?.parts?.[0]?.text
    if (!content) throw new Error('Empty response from Google AI')

    return extractJSXFromMarkdown(content)
  }

  async refineJSX(currentCode: string, refinementPrompt: string, signal?: AbortSignal): Promise<string> {
    const url = `${this.baseURL}/models/${this.model}:generateContent?key=${this.apiKey}`

    const response = await fetch(url, {
      method: 'POST',
      signal,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        systemInstruction: {
          parts: [{ text: getRefineSystemPrompt(currentCode) }],
        },
        contents: [
          {
            role: 'user',
            parts: [{ text: refinementPrompt }],
          },
        ],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 32768,
          topP: 0.9,
        },
      }),
    })

    if (!response.ok) {
      const err = await response.json().catch(() => ({}))
      throw new Error(`Google AI ${response.status}: ${err.error?.message || 'Unknown error'}`)
    }

    const data = await response.json()
    const content = data.candidates?.[0]?.content?.parts?.[0]?.text
    if (!content) throw new Error('Empty response from Google AI')

    return extractJSXFromMarkdown(content)
  }

  async testConnection(): Promise<boolean> {
    try {
      const res = await fetch(`${this.baseURL}/models?key=${this.apiKey}`)
      return res.ok
    } catch {
      return false
    }
  }
}
