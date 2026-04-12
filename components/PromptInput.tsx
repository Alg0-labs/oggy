import React, { forwardRef } from 'react'
import {
  View,
  TextInput,
  Text,
  StyleSheet,
  TextInputProps,
} from 'react-native'
import { Colors, Radius, Spacing } from '../constants/theme'

interface PromptInputProps extends TextInputProps {
  label?: string
}

export const PromptInput = forwardRef<TextInput, PromptInputProps>(
  ({ label, style, ...props }, ref) => {
    return (
      <View style={styles.wrapper}>
        {label && <Text style={styles.label}>{label}</Text>}
        <TextInput
          ref={ref}
          style={[styles.input, style]}
          placeholderTextColor={Colors.textMuted}
          multiline
          textAlignVertical="top"
          {...props}
        />
      </View>
    )
  }
)

PromptInput.displayName = 'PromptInput'

const styles = StyleSheet.create({
  wrapper: {
    width: '100%',
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textSecondary,
    marginBottom: Spacing.sm,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  input: {
    backgroundColor: Colors.surfaceElevated,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: Spacing.md,
    fontSize: 16,
    color: Colors.text,
    minHeight: 120,
    lineHeight: 24,
  },
})
