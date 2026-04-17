/**
 * Local models (e.g. Gemma) sometimes emit chain-of-thought / channel tags before JSX,
 * e.g. `<|channel|>thought`, "Thinking Process:", etc. That breaks Babel at (1:1).
 */
function stripLeadingReasoningLeak(raw: string): string {
  let s = raw.trimStart()
  if (!s) return raw

  // e.g. error UI pastes: "> 1 |    <|channel|>thought"
  s = s.replace(/^(?:\s*>\s*\d+\s*\|\s*)+/, '')

  // Gemma 4-style channel reasoning: <|...channel...|>thought ... <|...channel...|>
  s = s.replace(/<\|chann*el\|>\s*thought[\s\S]*?<\|chann*el\|>/gi, '')

  s = s.replace(/\x3cthink\x3e[\s\S]*?\x3c\/think\x3e/gi, '')
  s = s.replace(/<think>[\s\S]*?<\/redacted_thinking>/gi, '')
  s = s.replace(/<redacted_reasoning>[\s\S]*?<\/redacted_reasoning>/gi, '')
  s = s.replace(/<reasoning>[\s\S]*?<\/reasoning>/gi, '')

  const lines = s.split('\n')
  while (lines.length > 0) {
    const line = lines[0].trim()
    if (line === '') {
      lines.shift()
      continue
    }
    if (
      /^<\|[^|]*\|>/.test(line) ||
      /^thinking\s*process:?/i.test(line) ||
      /^#{1,6}\s*thinking/i.test(line) ||
      /^\d+\.\s*\*\*[^*]+\*\*:/.test(line)
    ) {
      lines.shift()
      continue
    }
    if (/^(okay|here|sure|i['']ll|i will|let me)\b/i.test(line) && line.length < 140) {
      lines.shift()
      continue
    }
    break
  }
  s = lines.join('\n').trimStart()

  const codeStart = s.search(
    /^\s*(?:export\s+)?(?:default\s+)?(?:function\s+\w+|const\s+\w+\s*=\s*(?:\(|function))/m
  )
  if (codeStart > 0) {
    s = s.slice(codeStart).trimStart()
  }

  return s
}

/**
 * Extract JSX code from LLM responses that may contain markdown code blocks.
 * All three providers (OpenAI, Google, Anthropic) sometimes wrap code in ```jsx blocks.
 */
export function extractJSXFromMarkdown(content: string): string {
  const stripped = stripLeadingReasoningLeak(content)

  // Try to extract from markdown code blocks (```jsx, ```javascript, ```tsx, etc.)
  const codeBlockRegex = /```(?:jsx|javascript|tsx|react|js)?\n?([\s\S]*?)```/
  const match = stripped.match(codeBlockRegex)

  if (match && match[1]) {
    return stripLeadingReasoningLeak(match[1]).trim()
  }

  // No markdown block found — assume the content is raw JSX
  return stripped.trim()
}
