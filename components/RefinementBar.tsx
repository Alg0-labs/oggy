import React, { useState } from 'react'
import {
  View,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { Colors, Radius, Spacing } from '../constants/theme'

interface RefinementBarProps {
  onSubmit: (prompt: string) => void
  disabled?: boolean
  placeholder?: string
}

export function RefinementBar({
  onSubmit,
  disabled,
  placeholder = 'Refine... e.g. "add a dark mode toggle"',
}: RefinementBarProps) {
  const [text, setText] = useState('')

  const handleSubmit = () => {
    const trimmed = text.trim()
    if (!trimmed || disabled) return
    onSubmit(trimmed)
    setText('')
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={90}
    >
      <View style={styles.container}>
        <TextInput
          style={styles.input}
          value={text}
          onChangeText={setText}
          placeholder={placeholder}
          placeholderTextColor={Colors.textMuted}
          editable={!disabled}
          multiline
          maxLength={500}
          returnKeyType="send"
          blurOnSubmit
          onSubmitEditing={handleSubmit}
        />
        <TouchableOpacity
          style={[styles.sendBtn, (!text.trim() || disabled) && styles.sendBtnDisabled]}
          onPress={handleSubmit}
          disabled={!text.trim() || disabled}
          activeOpacity={0.7}
        >
          <Ionicons
            name="arrow-up"
            size={18}
            color={text.trim() && !disabled ? '#FFF' : Colors.textMuted}
          />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: Spacing.sm,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    backgroundColor: Colors.surface,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  input: {
    flex: 1,
    backgroundColor: Colors.surfaceElevated,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: 14,
    paddingTop: 10,
    paddingBottom: 10,
    fontSize: 15,
    color: Colors.text,
    maxHeight: 80,
    lineHeight: 20,
  },
  sendBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendBtnDisabled: {
    backgroundColor: Colors.surfaceElevated,
  },
})
