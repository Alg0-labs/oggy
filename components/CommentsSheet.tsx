import React, { useCallback, useState } from 'react'
import {
  FlatList,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import * as Haptics from 'expo-haptics'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Colors, Fonts, Radius, Spacing, Type } from '../constants/theme'
import type { FeedComment, FeedPost } from '../constants/mockFeed'
import { mockProfile } from '../constants/mockProfile'

interface CommentsSheetProps {
  visible: boolean
  post: FeedPost
  extraComments: FeedComment[]
  onClose: () => void
  onAddComment: (c: FeedComment) => void
}

function relativeTime(iso: string): string {
  const now = new Date('2026-04-14T12:00:00Z').getTime()
  const then = new Date(iso).getTime()
  const mins = Math.max(1, Math.round((now - then) / 60000))
  if (mins < 60) return `${mins}m`
  const hrs = Math.round(mins / 60)
  if (hrs < 24) return `${hrs}h`
  return `${Math.round(hrs / 24)}d`
}

export function CommentsSheet({
  visible,
  post,
  extraComments,
  onClose,
  onAddComment,
}: CommentsSheetProps) {
  const insets = useSafeAreaInsets()
  const [draft, setDraft] = useState('')
  const [likedIds, setLikedIds] = useState<Record<string, boolean>>({})

  const allComments = [...post.topComments, ...extraComments]

  const submit = useCallback(() => {
    const text = draft.trim()
    if (!text) return
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
    onAddComment({
      id: `cm_local_${Date.now()}`,
      authorHandle: mockProfile.handle,
      authorInitials: mockProfile.avatarInitials,
      authorColor: Colors.primary,
      text,
      createdAt: new Date().toISOString(),
    })
    setDraft('')
  }, [draft, onAddComment])

  const toggleLike = (id: string) => {
    Haptics.selectionAsync()
    setLikedIds((m) => ({ ...m, [id]: !m[id] }))
  }

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        <View style={styles.handle} />
        <View style={styles.header}>
          <Text style={styles.title}>Comments</Text>
          <TouchableOpacity onPress={onClose} hitSlop={10} activeOpacity={0.7}>
            <Ionicons name="close" size={22} color={Colors.text} />
          </TouchableOpacity>
        </View>

        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={{ flex: 1 }}
          keyboardVerticalOffset={0}
        >
          <FlatList
            data={allComments}
            keyExtractor={(c) => c.id}
            contentContainerStyle={styles.list}
            ListHeaderComponent={
              <View style={styles.captionRow}>
                <View
                  style={[
                    styles.avatar,
                    { backgroundColor: post.app.author.avatarColor },
                  ]}
                >
                  <Text style={styles.avatarInitials}>
                    {post.app.author.avatarInitials}
                  </Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.commentText}>
                    <Text style={styles.commentAuthor}>
                      {post.app.author.handle}
                    </Text>{' '}
                    {post.caption}
                  </Text>
                  <Text style={styles.meta}>
                    {relativeTime(post.createdAt)} · author
                  </Text>
                </View>
              </View>
            }
            renderItem={({ item }) => (
              <View style={styles.commentItem}>
                <View
                  style={[
                    styles.avatar,
                    { backgroundColor: item.authorColor },
                  ]}
                >
                  <Text style={styles.avatarInitials}>
                    {item.authorInitials}
                  </Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.commentText}>
                    <Text style={styles.commentAuthor}>
                      {item.authorHandle}
                    </Text>{' '}
                    {item.text}
                  </Text>
                  <View style={styles.commentActions}>
                    <Text style={styles.meta}>
                      {relativeTime(item.createdAt)}
                    </Text>
                    <Pressable onPress={() => toggleLike(item.id)} hitSlop={8}>
                      <Text style={styles.metaAction}>
                        {likedIds[item.id] ? 'Unlike' : 'Like'}
                      </Text>
                    </Pressable>
                    <Pressable hitSlop={8}>
                      <Text style={styles.metaAction}>Reply</Text>
                    </Pressable>
                  </View>
                </View>
                <TouchableOpacity
                  onPress={() => toggleLike(item.id)}
                  hitSlop={8}
                  activeOpacity={0.7}
                >
                  <Ionicons
                    name={likedIds[item.id] ? 'heart' : 'heart-outline'}
                    size={16}
                    color={likedIds[item.id] ? Colors.pink : Colors.textMuted}
                  />
                </TouchableOpacity>
              </View>
            )}
            ListEmptyComponent={
              <Text style={styles.empty}>
                No comments yet. Be the first to reply.
              </Text>
            }
          />

          <View style={[styles.inputRow, { paddingBottom: insets.bottom + 8 }]}>
            <View style={[styles.avatar, styles.meAvatar]}>
              <Text style={styles.avatarInitials}>
                {mockProfile.avatarInitials}
              </Text>
            </View>
            <TextInput
              style={styles.input}
              placeholder="Add a comment…"
              placeholderTextColor={Colors.textMuted}
              value={draft}
              onChangeText={setDraft}
              multiline
              returnKeyType="send"
              onSubmitEditing={submit}
            />
            <TouchableOpacity
              onPress={submit}
              disabled={!draft.trim()}
              activeOpacity={0.7}
              style={[styles.send, !draft.trim() && styles.sendDisabled]}
            >
              <Ionicons
                name="arrow-up"
                size={18}
                color={Colors.textInverse}
              />
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.bg,
  },
  handle: {
    alignSelf: 'center',
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.border,
    marginTop: 8,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.border,
  },
  title: {
    ...Type.heading3,
    color: Colors.text,
  },
  list: {
    padding: Spacing.lg,
    gap: Spacing.lg,
  },
  captionRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.sm,
    paddingBottom: Spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.border,
  },
  commentItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.sm,
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: Radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  meAvatar: {
    backgroundColor: Colors.primary,
  },
  avatarInitials: {
    fontFamily: Fonts.sansBold,
    fontSize: 11,
    color: Colors.textInverse,
    letterSpacing: 0.2,
  },
  commentText: {
    ...Type.bodySmall,
    fontSize: 14,
    lineHeight: 19,
    color: Colors.text,
  },
  commentAuthor: {
    fontFamily: Fonts.sansSemi,
  },
  commentActions: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginTop: 4,
  },
  meta: {
    ...Type.bodySmall,
    fontSize: 12,
    color: Colors.textMuted,
  },
  metaAction: {
    ...Type.bodySmall,
    fontSize: 12,
    fontFamily: Fonts.sansSemi,
    color: Colors.textMuted,
  },
  empty: {
    ...Type.body,
    color: Colors.textMuted,
    textAlign: 'center',
    paddingTop: Spacing.xl,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: Colors.border,
    backgroundColor: Colors.bg,
  },
  input: {
    flex: 1,
    minHeight: 40,
    maxHeight: 120,
    paddingHorizontal: Spacing.md,
    paddingVertical: 10,
    borderRadius: Radius.lg,
    backgroundColor: Colors.surfaceMuted,
    fontFamily: Fonts.sansRegular,
    fontSize: 14,
    color: Colors.text,
  },
  send: {
    width: 36,
    height: 36,
    borderRadius: Radius.pill,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendDisabled: {
    opacity: 0.35,
  },
})
