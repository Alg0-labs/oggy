import * as Babel from '@babel/standalone'

export interface TransformResult {
  success: boolean
  code?: string
  error?: string
}

class JSXTransformer {
  transform(jsxCode: string): TransformResult {
    try {
      const result = Babel.transform(jsxCode, {
        presets: ['react'],
        filename: 'generated-app.jsx',
        // Force script mode so Babel doesn't emit "use strict" or CJS/ESM
        // wrappers that break `new Function`-based execution and cause
        // "Property 'X' doesn't exist" errors in the sandbox.
        sourceType: 'script',
      })

      if (!result.code) {
        return {
          success: false,
          error: 'Babel transformation returned no code',
        }
      }

      return {
        success: true,
        code: result.code,
      }
    } catch (error: any) {
      return {
        success: false,
        error: `Babel transformation failed: ${error.message || String(error)}`,
      }
    }
  }

  validateTransform(code: string): boolean {
    const result = this.transform(code)
    return result.success
  }
}

export const jsxTransformer = new JSXTransformer()
