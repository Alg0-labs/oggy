import React, { useCallback, useState } from 'react'
import {
  ActionSheetIOS,
  Alert,
  Platform,
  Pressable,
  Share,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native'
import { Image } from 'expo-image'
import { Ionicons } from '@expo/vector-icons'
import * as Haptics from 'expo-haptics'
import { Colors, Fonts, Radius, Spacing, Type } from '../constants/theme'
import type { FeedComment, FeedPost } from '../constants/mockFeed'
import { CommentsSheet } from './CommentsSheet'

interface FeedCardProps {
  post: FeedPost
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

function formatCount(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`
  return `${n}`
}

function shareUrl(postId: string): string {
  return `https://oggy.app/p/${postId}`
}

export function FeedCard({ post }: FeedCardProps) {
  const [liked, setLiked] = useState(false)
  const [saved, setSaved] = useState(false)
  const [likeDelta, setLikeDelta] = useState(0)
  const [commentsOpen, setCommentsOpen] = useState(false)
  const [extraComments, setExtraComments] = useState<FeedComment[]>([])

  const totalLikes = post.likes + likeDelta
  const totalComments = post.commentCount + extraComments.length
  const { app } = post

  const toggleLike = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
    setLiked((prev) => {
      setLikeDelta(prev ? -1 : 1)
      return !prev
    })
  }, [])

  const toggleSave = useCallback(() => {
    Haptics.selectionAsync()
    setSaved((prev) => {
      const next = !prev
      Alert.alert(next ? 'Saved' : 'Removed', `${app.name} ${next ? 'added to your saves' : 'removed from your saves'}.`)
      return next
    })
  }, [app.name])

  const openComments = useCallback(() => {
    Haptics.selectionAsync()
    setCommentsOpen(true)
  }, [])

  const closeComments = useCallback(() => setCommentsOpen(false), [])

  const addComment = useCallback((c: FeedComment) => {
    setExtraComments((list) => [...list, c])
  }, [])

  const onShare = useCallback(async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
    const url = shareUrl(post.id)
    try {
      await Share.share({
        title: app.name,
        message: `Check out ${app.name} by ${app.author.handle} on Oggy — ${url}`,
        url,
      })
    } catch {
      // user-cancelled share — ignore
    }
  }, [post.id, app.name, app.author.handle])

  const onPressAuthor = useCallback(() => {
    Haptics.selectionAsync()
    Alert.alert(app.author.handle, `Profile for ${app.author.name}`, [
      { text: 'View profile', onPress: () => {} },
      { text: 'Follow', onPress: () => {} },
      { text: 'Close', style: 'cancel' },
    ])
  }, [app.author.handle, app.author.name])

  const onOpenApp = useCallback(() => {
    Haptics.selectionAsync()
    Alert.alert(app.name, app.prompt, [
      { text: 'Remix', onPress: () => {} },
      { text: 'Open preview', onPress: () => {} },
      { text: 'Close', style: 'cancel' },
    ])
  }, [app.name, app.prompt])

  const onPressMenu = useCallback(() => {
    const options = ['Copy link', 'Not interested', 'Report', 'Cancel']
    if (Platform.OS === 'ios') {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options,
          cancelButtonIndex: 3,
          destructiveButtonIndex: 2,
        },
        (i) => {
          if (i === 0) Alert.alert('Link copied', shareUrl(post.id))
          else if (i === 1) Alert.alert('Got it', "We'll show fewer posts like this.")
          else if (i === 2) Alert.alert('Reported', 'Thanks, our team will review.')
        },
      )
    } else {
      Alert.alert('Post options', app.name, [
        { text: 'Copy link', onPress: () => Alert.alert('Link copied', shareUrl(post.id)) },
        { text: 'Not interested', onPress: () => {} },
        { text: 'Report', style: 'destructive', onPress: () => {} },
        { text: 'Cancel', style: 'cancel' },
      ])
    }
  }, [post.id, app.name])

  return (
    <View style={styles.card}>
      <Pressable onPress={onPressAuthor} style={styles.header}>
        <View
          style={[styles.avatar, { backgroundColor: app.author.avatarColor }]}
        >
          <Text style={styles.avatarInitials}>{app.author.avatarInitials}</Text>
        </View>
        <View style={styles.headerText}>
          <Text style={styles.authorName}>{app.author.handle}</Text>
          <Text style={styles.postMeta}>
            {app.category} · {relativeTime(post.createdAt)}
          </Text>
        </View>
        <TouchableOpacity
          hitSlop={10}
          activeOpacity={0.7}
          onPress={onPressMenu}
        >
          <Ionicons
            name="ellipsis-horizontal"
            size={18}
            color={Colors.textMuted}
          />
        </TouchableOpacity>
      </Pressable>

      <Pressable onPress={onOpenApp} style={styles.mediaWrap}>
        <Image
          source={{ uri: app.imageUrl }}
          style={styles.media}
          contentFit="cover"
          transition={180}
        />
        <TouchableOpacity
          style={styles.appBadge}
          activeOpacity={0.85}
          onPress={onOpenApp}
        >
          <Ionicons name="apps" size={10} color={Colors.textInverse} />
          <Text style={styles.appBadgeText}>{app.name}</Text>
        </TouchableOpacity>
      </Pressable>

      <View style={styles.actions}>
        <View style={styles.actionsLeft}>
          <TouchableOpacity onPress={toggleLike} activeOpacity={0.7} hitSlop={6}>
            <Ionicons
              name={liked ? 'heart' : 'heart-outline'}
              size={26}
              color={liked ? Colors.pink : Colors.text}
            />
          </TouchableOpacity>
          <TouchableOpacity onPress={openComments} activeOpacity={0.7} hitSlop={6}>
            <Ionicons name="chatbubble-outline" size={24} color={Colors.text} />
          </TouchableOpacity>
          <TouchableOpacity onPress={onShare} activeOpacity={0.7} hitSlop={6}>
            <Ionicons name="paper-plane-outline" size={24} color={Colors.text} />
          </TouchableOpacity>
        </View>
        <TouchableOpacity onPress={toggleSave} activeOpacity={0.7} hitSlop={6}>
          <Ionicons
            name={saved ? 'bookmark' : 'bookmark-outline'}
            size={24}
            color={Colors.text}
          />
        </TouchableOpacity>
      </View>

      <Text style={styles.likes}>
        {formatCount(totalLikes)} likes · {formatCount(post.remixes)} remixes
      </Text>

      <Text style={styles.caption}>
        <Text
          style={styles.captionAuthor}
          onPress={onPressAuthor}
          suppressHighlighting
        >
          {app.author.handle}
        </Text>{' '}
        {post.caption}
      </Text>

      {totalComments > 0 && (
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={openComments}
          style={styles.viewComments}
        >
          <Text style={styles.viewCommentsText}>
            View all {totalComments} comments
          </Text>
        </TouchableOpacity>
      )}

      {[...post.topComments, ...extraComments].slice(-2).map((c) => (
        <Pressable key={c.id} onPress={openComments} style={styles.commentRow}>
          <Text style={styles.commentText}>
            <Text style={styles.commentAuthor}>{c.authorHandle}</Text> {c.text}
          </Text>
        </Pressable>
      ))}

      <Text style={styles.timestamp}>{relativeTime(post.createdAt)} ago</Text>

      <CommentsSheet
        visible={commentsOpen}
        post={post}
        extraComments={extraComments}
        onClose={closeComments}
        onAddComment={addComment}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  card: {
    paddingBottom: Spacing.lg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: Radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInitials: {
    fontFamily: Fonts.sansBold,
    fontSize: 13,
    color: Colors.textInverse,
    letterSpacing: 0.2,
  },
  headerText: {
    flex: 1,
    gap: 2,
  },
  authorName: {
    ...Type.bodySemibold,
    fontSize: 14,
    lineHeight: 18,
    color: Colors.text,
  },
  postMeta: {
    ...Type.bodySmall,
    fontSize: 12,
    lineHeight: 14,
    color: Colors.textMuted,
  },
  mediaWrap: {
    marginHorizontal: Spacing.lg,
    borderRadius: Radius.lg,
    overflow: 'hidden',
    aspectRatio: 4 / 5,
    backgroundColor: Colors.surfaceMuted,
  },
  media: {
    width: '100%',
    height: '100%',
  },
  appBadge: {
    position: 'absolute',
    bottom: 12,
    left: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(25,28,31,0.78)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: Radius.pill,
  },
  appBadgeText: {
    fontFamily: Fonts.sansSemi,
    fontSize: 11,
    color: Colors.textInverse,
    letterSpacing: -0.1,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.sm,
  },
  actionsLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 18,
  },
  likes: {
    ...Type.bodySemibold,
    fontSize: 14,
    paddingHorizontal: Spacing.lg,
    color: Colors.text,
    marginBottom: 4,
  },
  caption: {
    ...Type.body,
    fontSize: 14,
    lineHeight: 20,
    paddingHorizontal: Spacing.lg,
    color: Colors.text,
  },
  captionAuthor: {
    fontFamily: Fonts.sansSemi,
  },
  viewComments: {
    paddingHorizontal: Spacing.lg,
    paddingTop: 6,
  },
  viewCommentsText: {
    ...Type.bodySmall,
    color: Colors.textMuted,
  },
  commentRow: {
    paddingHorizontal: Spacing.lg,
    paddingTop: 4,
  },
  commentText: {
    ...Type.bodySmall,
    color: Colors.text,
    lineHeight: 18,
  },
  commentAuthor: {
    fontFamily: Fonts.sansSemi,
  },
  timestamp: {
    ...Type.micro,
    color: Colors.textMuted,
    textTransform: 'uppercase',
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.sm,
    fontSize: 10,
    letterSpacing: 1,
  },
})
