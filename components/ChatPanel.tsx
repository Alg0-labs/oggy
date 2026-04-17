import React, { useEffect, useRef, useState } from 'react'
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { Colors, Fonts, Radius, Spacing, Type } from '../constants/theme'
import { ChatMessage } from '../store/appStore'
import { GeneratingMessage } from './GeneratingMessage'

interface Props {
  messages: ChatMessage[]
  onSend: (text: string) => void
  onCancel?: () => void
  onMessagePress?: (message: ChatMessage) => void
  generating: boolean
  placeholder?: string
  /** Optional id of the message whose JSX is currently shown in the preview. */
  activeJsxMessageId?: string
  /** Back out of the current app entirely. */
  onBack?: () => void
  /** Collapse the chat panel (keep viewing the preview). */
  onClose?: () => void
  title?: string
}

export function ChatPanel({
  messages,
  onSend,
  onCancel,
  onMessagePress,
  generating,
  placeholder = 'Refine your app…',
  activeJsxMessageId,
  onBack,
  onClose,
  title,
}: Props) {
  const [text, setText] = useState('')
  const [inputFocused, setInputFocused] = useState(false)
  const scrollRef = useRef<ScrollView>(null)

  useEffect(() => {
    requestAnimationFrame(() => scrollRef.current?.scrollToEnd({ animated: true }))
  }, [messages.length, generating])

  const handleSubmit = () => {
    const trimmed = text.trim()
    if (!trimmed || generating) return
    onSend(trimmed)
    setText('')
  }

  const canSend = text.trim().length > 0 && !generating
  const successfulAssistantIds = messages
    .filter((m) => m.role === 'assistant' && m.status === 'success')
    .map((m) => m.id)

  return (
    <KeyboardAvoidingView
      style={styles.wrap}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={90}
    >
      {/* Grabber handle */}
      <View style={styles.grabberRow}>
        <View style={styles.grabber} />
      </View>

      {(onBack || onClose || title) && (
        <View style={styles.header}>
          {onBack ? (
            <TouchableOpacity
              style={styles.headerBtn}
              onPress={onBack}
              activeOpacity={0.8}
              hitSlop={8}
            >
              <Ionicons name="chevron-back" size={18} color={Colors.textInverse} />
            </TouchableOpacity>
          ) : (
            <View style={styles.headerBtnPlaceholder} />
          )}

          {title ? (
            <View style={styles.titleWrap}>
              <Text style={styles.headerEyebrow}>Chat</Text>
              <Text style={styles.headerTitle} numberOfLines={1}>
                {title}
              </Text>
            </View>
          ) : (
            <View style={styles.flexSpacer} />
          )}

          {onClose ? (
            <TouchableOpacity
              style={styles.headerBtnGhost}
              onPress={onClose}
              activeOpacity={0.8}
              hitSlop={8}
            >
              <Ionicons name="chevron-down" size={18} color={Colors.text} />
            </TouchableOpacity>
          ) : (
            <View style={styles.headerBtnPlaceholder} />
          )}
        </View>
      )}

      <ScrollView
        ref={scrollRef}
        style={styles.list}
        contentContainerStyle={styles.listContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {messages.map((m) => {
          if (m.role === 'user') {
            return (
              <View key={m.id} style={[styles.bubbleRow, styles.userRow]}>
                <View style={[styles.bubble, styles.userBubble]}>
                  <Text style={styles.userText}>{m.content}</Text>
                </View>
              </View>
            )
          }
          if (m.status === 'generating') {
            return (
              <View key={m.id} style={styles.bubbleRow}>
                <GeneratingMessage message={m} onCancel={onCancel} />
              </View>
            )
          }
          if (m.status === 'error' || m.status === 'cancelled') {
            return (
              <View key={m.id} style={styles.bubbleRow}>
                <View style={styles.errorBubble}>
                  <Ionicons
                    name={m.status === 'cancelled' ? 'close-circle' : 'alert-circle'}
                    size={14}
                    color={Colors.danger}
                  />
                  <Text style={styles.errorText} numberOfLines={3}>
                    {m.error || (m.status === 'cancelled' ? 'Cancelled' : 'Failed')}
                  </Text>
                </View>
              </View>
            )
          }
          // success assistant message — version chip
          const versionIdx = successfulAssistantIds.indexOf(m.id)
          const isActive = m.id === activeJsxMessageId
          return (
            <View key={m.id} style={styles.bubbleRow}>
              <TouchableOpacity
                onPress={() => onMessagePress?.(m)}
                activeOpacity={0.85}
                style={[styles.versionChip, isActive && styles.versionChipActive]}
              >
                <Ionicons
                  name="sparkles"
                  size={12}
                  color={isActive ? Colors.textInverse : Colors.text}
                />
                <Text style={[styles.versionLabel, isActive && styles.versionLabelActive]}>
                  Version {versionIdx + 1}
                </Text>
                {isActive && (
                  <View style={styles.activeDot}>
                    <View style={styles.activeDotInner} />
                  </View>
                )}
              </TouchableOpacity>
            </View>
          )
        })}
      </ScrollView>

      <View style={[styles.inputRow, inputFocused && styles.inputRowFocused]}>
        <TextInput
          style={styles.input}
          value={text}
          onChangeText={setText}
          placeholder={generating ? 'Generating…' : placeholder}
          placeholderTextColor={Colors.textMuted}
          editable={!generating}
          multiline
          maxLength={500}
          returnKeyType="send"
          blurOnSubmit
          onSubmitEditing={handleSubmit}
          onFocus={() => setInputFocused(true)}
          onBlur={() => setInputFocused(false)}
        />
        <TouchableOpacity
          style={[styles.sendBtn, !canSend && styles.sendBtnDisabled]}
          onPress={handleSubmit}
          disabled={!canSend}
          activeOpacity={0.85}
        >
          <Ionicons
            name="arrow-up"
            size={18}
            color={canSend ? Colors.textInverse : Colors.textMuted}
          />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  wrap: {
    backgroundColor: Colors.surface,
    borderTopLeftRadius: Radius.xl,
    borderTopRightRadius: Radius.xl,
    borderWidth: 1,
    borderColor: Colors.border,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: -6 },
    elevation: 12,
  },
  grabberRow: {
    alignItems: 'center',
    paddingTop: 8,
    paddingBottom: 4,
  },
  grabber: {
    width: 38,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.border,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.xs,
    paddingBottom: Spacing.md,
    gap: Spacing.md,
  },
  headerBtn: {
    width: 36,
    height: 36,
    borderRadius: Radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary,
  },
  headerBtnGhost: {
    width: 36,
    height: 36,
    borderRadius: Radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: Colors.border,
  },
  headerBtnPlaceholder: {
    width: 36,
    height: 36,
  },
  titleWrap: {
    flex: 1,
    alignItems: 'center',
  },
  headerEyebrow: {
    ...Type.micro,
    color: Colors.textMuted,
    textTransform: 'uppercase',
    marginBottom: 2,
  },
  headerTitle: {
    ...Type.heading3,
    color: Colors.text,
    fontSize: 17,
    lineHeight: 20,
  },
  flexSpacer: {
    flex: 1,
  },
  list: {
    maxHeight: 280,
  },
  listContent: {
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.md,
    gap: Spacing.sm,
  },
  bubbleRow: {
    flexDirection: 'row',
    width: '100%',
  },
  userRow: {
    justifyContent: 'flex-end',
  },
  bubble: {
    maxWidth: '85%',
    paddingVertical: 10,
    paddingHorizontal: 14,
  },
  userBubble: {
    backgroundColor: Colors.primary,
    borderTopLeftRadius: Radius.lg,
    borderTopRightRadius: Radius.lg,
    borderBottomLeftRadius: Radius.lg,
    borderBottomRightRadius: 6,
  },
  userText: {
    ...Type.bodySmall,
    color: Colors.textInverse,
    fontFamily: Fonts.sansMedium,
  },
  errorBubble: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: Colors.dangerBg,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: 'rgba(226, 59, 74, 0.25)',
    maxWidth: '90%',
  },
  errorText: {
    ...Type.bodySmall,
    color: Colors.danger,
    flexShrink: 1,
    fontFamily: Fonts.sansMedium,
  },
  versionChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: Radius.pill,
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: Colors.border,
  },
  versionChipActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  versionLabel: {
    fontFamily: Fonts.sansSemi,
    fontSize: 12,
    letterSpacing: 0.2,
    color: Colors.text,
  },
  versionLabelActive: {
    color: Colors.textInverse,
  },
  activeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.teal,
    marginLeft: 2,
  },
  activeDotInner: {
    flex: 1,
    borderRadius: 3,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: Spacing.sm,
    marginHorizontal: Spacing.md,
    marginBottom: Spacing.md,
    marginTop: Spacing.xs,
    paddingLeft: 6,
    paddingRight: 6,
    paddingVertical: 6,
    borderRadius: Radius.xl,
    backgroundColor: Colors.surfaceMuted,
    borderWidth: 1.5,
    borderColor: Colors.border,
  },
  inputRowFocused: {
    borderColor: Colors.primary,
    backgroundColor: Colors.surface,
  },
  input: {
    flex: 1,
    paddingHorizontal: 12,
    paddingTop: 10,
    paddingBottom: 10,
    fontSize: 15,
    lineHeight: 20,
    color: Colors.text,
    fontFamily: Fonts.sansRegular,
    maxHeight: 100,
  },
  sendBtn: {
    width: 36,
    height: 36,
    borderRadius: Radius.pill,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendBtnDisabled: {
    backgroundColor: Colors.border,
  },
})
