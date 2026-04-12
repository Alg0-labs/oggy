import React from 'react'
import * as RN from 'react-native'
import { jsxTransformer } from './transformer'
import { jsxValidator } from './validator'

export interface ExecutionContext {
  React: typeof React
  useState: typeof React.useState
  useEffect: typeof React.useEffect
  useRef: typeof React.useRef
  useCallback: typeof React.useCallback
  View: typeof RN.View
  Text: typeof RN.Text
  TextInput: typeof RN.TextInput
  TouchableOpacity: typeof RN.TouchableOpacity
  ScrollView: typeof RN.ScrollView
  FlatList: typeof RN.FlatList
  StyleSheet: typeof RN.StyleSheet
  Alert: typeof RN.Alert
  Button: typeof RN.Button
  Image: typeof RN.Image
  ImageBackground: typeof RN.ImageBackground
  Switch: typeof RN.Switch
  Pressable: typeof RN.Pressable
  ActivityIndicator: typeof RN.ActivityIndicator
  Modal: typeof RN.Modal
  SafeAreaView: typeof RN.SafeAreaView
  Animated: typeof RN.Animated
  console: typeof console
}

export interface ExecutionResult {
  success: boolean
  component?: React.ComponentType
  error?: string
}

class JSXExecutor {
  private createExecutionContext(): ExecutionContext {
    return {
      React,
      useState: React.useState,
      useEffect: React.useEffect,
      useRef: React.useRef,
      useCallback: React.useCallback,
      View: RN.View,
      Text: RN.Text,
      TextInput: RN.TextInput,
      TouchableOpacity: RN.TouchableOpacity,
      ScrollView: RN.ScrollView,
      FlatList: RN.FlatList,
      StyleSheet: RN.StyleSheet,
      Alert: RN.Alert,
      Button: RN.Button,
      Image: RN.Image,
      ImageBackground: RN.ImageBackground,
      Switch: RN.Switch,
      Pressable: RN.Pressable,
      ActivityIndicator: RN.ActivityIndicator,
      Modal: RN.Modal,
      SafeAreaView: RN.SafeAreaView,
      Animated: RN.Animated,
      console,
    }
  }

  execute(jsx: string): ExecutionResult {
    try {
      // 1. Validate JSX syntax
      const validation = jsxValidator.validate(jsx)
      if (!validation.valid) {
        return {
          success: false,
          error: `Validation failed: ${validation.errors.join(', ')}`,
        }
      }

      // 2. Clean the code
      const cleanedCode = jsxValidator.cleanCode(jsx)

      // 3. Transform JSX to JavaScript
      const transformResult = jsxTransformer.transform(cleanedCode)
      if (!transformResult.success) {
        return {
          success: false,
          error: transformResult.error || 'Transform failed',
        }
      }

      const transformedCode = transformResult.code!

      // 4. Wrap code to find component
      const wrappedCode = `
        ${transformedCode}

        // Try to find the exported component
        if (typeof App !== 'undefined') return App;
        if (typeof MyApp !== 'undefined') return MyApp;
        if (typeof TodoApp !== 'undefined') return TodoApp;
        if (typeof TimerApp !== 'undefined') return TimerApp;
        if (typeof NotesApp !== 'undefined') return NotesApp;
        if (typeof CalculatorApp !== 'undefined') return CalculatorApp;
        if (typeof CounterApp !== 'undefined') return CounterApp;
        if (typeof GameApp !== 'undefined') return GameApp;

        // Fallback: return a component showing an error
        return function DefaultApp() {
          return React.createElement(
            View,
            { style: { flex: 1, justifyContent: 'center', alignItems: 'center' } },
            React.createElement(Text, null, 'Could not find component function')
          );
        };
      `

      // 5. Create execution context
      const context = this.createExecutionContext()
      const contextKeys = Object.keys(context)
      const contextValues = Object.values(context)

      // 6. Execute code
      const componentFunction = new Function(...contextKeys, wrappedCode)
      const GeneratedComponent = componentFunction(...contextValues)

      if (!GeneratedComponent) {
        return {
          success: false,
          error: 'Component function execution returned no component',
        }
      }

      return {
        success: true,
        component: GeneratedComponent,
      }
    } catch (error: any) {
      const errorMessage = error instanceof Error ? error.message : String(error)
      return {
        success: false,
        error: `Execution error: ${errorMessage}`,
      }
    }
  }
}

export const jsxExecutor = new JSXExecutor()
