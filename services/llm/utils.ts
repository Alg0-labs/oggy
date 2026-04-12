/**
 * Extract JSX code from LLM responses that may contain markdown code blocks.
 * All three providers (OpenAI, Google, Anthropic) sometimes wrap code in ```jsx blocks.
 */
export function extractJSXFromMarkdown(content: string): string {
  // Try to extract from markdown code blocks (```jsx, ```javascript, ```tsx, etc.)
  const codeBlockRegex = /```(?:jsx|javascript|tsx|react|js)?\n?([\s\S]*?)```/
  const match = content.match(codeBlockRegex)

  if (match && match[1]) {
    return match[1].trim()
  }

  // No markdown block found — assume the content is raw JSX
  return content.trim()
}
