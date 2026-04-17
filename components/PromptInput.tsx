import React, { forwardRef } from 'react'
import {
  View,
  TextInput,
  Text,
  StyleSheet,
  TextInputProps,
} from 'react-native'
import { Colors, Radius, Spacing, Type } from '../constants/theme'

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
    ...Type.micro,
    color: Colors.textMuted,
    textTransform: 'uppercase',
    marginBottom: Spacing.sm,
  },
  input: {
    backgroundColor: Colors.surfaceMuted,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    paddingVertical: Spacing.md,
    ...Type.bodyLarge,
    color: Colors.text,
    minHeight: 140,
  },
})
