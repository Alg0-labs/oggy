import React, { useEffect, useState } from 'react'
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
} from 'react-native'
import { jsxExecutor } from '../services/jsx/executor'

interface DynamicJSXExecutorProps {
  code: string
  onError?: (error: string) => void
}

export const DynamicJSXExecutor: React.FC<DynamicJSXExecutorProps> = ({
  code,
  onError,
}) => {
  const [Component, setComponent] = useState<React.ComponentType | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    try {
      setIsLoading(true)
      setError(null)

      const result = jsxExecutor.execute(code)

      if (result.success && result.component) {
        setComponent(() => result.component!)
      } else {
        const errorMessage = result.error || 'Failed to execute app'
        setError(errorMessage)
        onError?.(errorMessage)
      }
    } catch (err: any) {
      const errorMessage =
        err instanceof Error ? err.message : 'Unknown error occurred'
      setError(errorMessage)
      onError?.(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }, [code, onError])

  if (isLoading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Loading app...</Text>
      </View>
    )
  }

  if (error) {
    return (
      <ScrollView style={styles.errorContainer}>
        <Text style={styles.errorTitle}>⚠️ Execution Error</Text>
        <Text style={styles.errorMessage}>{error}</Text>
        <View style={styles.errorHint}>
          <Text style={styles.hintText}>
            Try regenerating the app with clearer instructions.
          </Text>
        </View>
      </ScrollView>
    )
  }

  if (!Component) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorMessage}>Unable to load app</Text>
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <Component />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  errorContainer: {
    flex: 1,
    backgroundColor: '#FFF3CD',
    padding: 20,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#856404',
    marginBottom: 12,
  },
  errorMessage: {
    fontSize: 14,
    color: '#856404',
    lineHeight: 20,
    marginBottom: 16,
    fontFamily: 'Menlo',
  },
  errorHint: {
    backgroundColor: '#FFFFFF',
    padding: 12,
    borderRadius: 8,
    marginTop: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#FF3B30',
  },
  hintText: {
    fontSize: 13,
    color: '#8E8E93',
    fontStyle: 'italic',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#8E8E93',
  },
})
