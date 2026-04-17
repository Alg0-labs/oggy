export interface ValidationResult {
  valid: boolean
  errors: string[]
  warnings: string[]
  componentName?: string
}

class JSXValidator {
  private allowedComponents = new Set([
    'View',
    'Text',
    'TextInput',
    'TouchableOpacity',
    'ScrollView',
    'FlatList',
    'StyleSheet',
    'Alert',
    'Button',
    'Image',
    'ImageBackground',
    'Switch',
    'Pressable',
    'ActivityIndicator',
    'Modal',
    'SafeAreaView',
    'Animated',
    'React',
    'useState',
    'useEffect',
    'useRef',
    'useCallback',
    'console',
  ])

  private forbiddenPatterns = [
    /fetch\s*\(/,
    /axios\s*\./,
    /import\s+/,
    /require\s*\(/,
    /NativeModules/,
    /\.private/,
    /eval\s*\(/,
    /Function\s*\(/,
    /__native/,
    /\.native\./,
  ]

  private dangerousFunctions = ['eval', 'Function']

  validate(code: string): ValidationResult {
    const errors: string[] = []
    const warnings: string[] = []
    let componentName: string | undefined

    // Check if code is empty
    if (!code || code.trim().length === 0) {
      errors.push('Code is empty')
      return { valid: false, errors, warnings }
    }

    // Extract component name
    const componentNameMatch = code.match(
      /(?:function|const)\s+([A-Z]\w*)\s*(?:\(|=)/
    )
    if (componentNameMatch) {
      componentName = componentNameMatch[1]
    } else {
      warnings.push('No component function found. Expected App, MyApp, etc.')
    }

    // Check for forbidden patterns
    for (const pattern of this.forbiddenPatterns) {
      if (pattern.test(code)) {
        errors.push(`Forbidden pattern detected: ${pattern.source}`)
      }
    }

    // Check for dangerous functions
    for (const fn of this.dangerousFunctions) {
      const regex = new RegExp(`\\b${fn}\\s*\\(`)
      if (regex.test(code)) {
        errors.push(`Dangerous function not allowed: ${fn}`)
      }
    }

    // Note: brace/paren balance checks are intentionally omitted here.
    // They produce false positives on string literals and template expressions.
    // Real syntax errors are caught by the Babel transform step instead.

    // Try to detect JSX syntax errors (basic check)
    if (!code.includes('return') && !code.includes('React.createElement')) {
      warnings.push('Code may not return any JSX')
    }

    // Check that code returns JSX or React elements
    const hasReturn = /return\s*(<|React\.createElement)/m.test(code)
    if (!hasReturn && !code.includes('return null')) {
      warnings.push('Code should return JSX elements')
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings,
      componentName,
    }
  }

  extractComponentName(code: string): string | null {
    const match = code.match(/(?:function|const)\s+([A-Z]\w*)\s*(?:\(|=)/)
    return match ? match[1] : null
  }

  cleanCode(code: string): string {
    // Remove import statements
    let cleaned = code.replace(/import\s+.*?from\s+['"].*?['"];?\n?/g, '')

    // Remove export default
    cleaned = cleaned.replace(/export\s+default\s+/g, '')

    // Remove other exports
    cleaned = cleaned.replace(/export\s+(?:function|const)\s+/g, '$&')

    return cleaned.trim()
  }
}

export const jsxValidator = new JSXValidator()
