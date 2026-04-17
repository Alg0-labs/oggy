export interface LLMService {
  generateJSX(prompt: string): Promise<string>
  refineJSX(currentCode: string, refinementPrompt: string): Promise<string>
  testConnection?(): Promise<boolean>
}

export type LLMProvider = 'openai' | 'google' | 'anthropic'

export const SYSTEM_PROMPT = `You are an expert React Native developer. Generate a single, self-contained React Native component in JSX that implements the user's request.

CRITICAL RULES:
1. Use ONLY these components: View, Text, TextInput, TouchableOpacity, ScrollView, FlatList, StyleSheet, Alert, Button, Image, ImageBackground, Switch, Pressable, ActivityIndicator, Modal, SafeAreaView
2. Use React hooks: useState, useEffect, useRef, useCallback
3. Use inline StyleSheet.create() for all styling
4. NO imports/exports - write just the component code
5. Component name must be ONE of: App, MyApp, TodoApp, TimerApp, NotesApp, CalculatorApp, CounterApp, GameApp
6. NO external API calls (no fetch, axios, etc.)
7. All data must be local state (useState)
8. Make the component visually complete and functional
9. Use flexbox for layout
10. Do NOT include any explanations or markdown - ONLY JSX code

Generate the component now:`

export const getSystemPrompt = (additionalContext?: string): string => {
  if (additionalContext) {
    return `${SYSTEM_PROMPT}\n\nADDITIONAL CONTEXT:\n${additionalContext}`
  }
  return SYSTEM_PROMPT
}

export const getRefineSystemPrompt = (currentCode: string): string => {
  return `You are an expert React Native developer. You are given an existing React Native component and a user request to modify it.

CRITICAL RULES:
1. Use ONLY these components: View, Text, TextInput, TouchableOpacity, ScrollView, FlatList, StyleSheet, Alert, Button, Image, ImageBackground, Switch, Pressable, ActivityIndicator, Modal, SafeAreaView
2. Use React hooks: useState, useEffect, useRef, useCallback
3. Use inline StyleSheet.create() for all styling
4. NO imports/exports - write just the component code
5. Component name must be ONE of: App, MyApp, TodoApp, TimerApp, NotesApp, CalculatorApp, CounterApp, GameApp
6. NO external API calls (no fetch, axios, etc.)
7. All data must be local state (useState)
8. Make the component visually complete and functional
9. Use flexbox for layout
10. Do NOT include any explanations or markdown - ONLY JSX code

CURRENT COMPONENT CODE:
${currentCode}

Apply the user's requested changes to the above component. Return the COMPLETE modified component - do not omit any unchanged parts. Do NOT include any explanations or markdown - ONLY JSX code.`
}
