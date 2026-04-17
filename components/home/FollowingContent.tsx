import React from 'react'
import { StyleSheet, View } from 'react-native'
import Animated from 'react-native-reanimated'
import type { AnimatedScrollViewProps } from 'react-native-reanimated'
import { FeedCard } from '../FeedCard'
import { feedPosts } from '../../constants/mockFeed'
import { Spacing } from '../../constants/theme'

const FEED_CONFIG = {
  showLikeCount: false,
  commentsEnabled: false,
}

interface FollowingContentProps {
  topInset?: number
  onScroll?: AnimatedScrollViewProps['onScroll']
}

export function FollowingContent({ topInset = 0, onScroll }: FollowingContentProps) {
  return (
    <Animated.FlatList
      data={feedPosts}
      keyExtractor={(p) => p.id}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={[styles.list, { paddingTop: topInset + Spacing.md }]}
      ItemSeparatorComponent={() => <View style={styles.divider} />}
      onScroll={onScroll}
      scrollEventThrottle={16}
      renderItem={({ item }) => (
        <FeedCard
          post={item}
          showLikeCount={FEED_CONFIG.showLikeCount}
          commentsEnabled={FEED_CONFIG.commentsEnabled}
        />
      )}
    />
  )
}

const styles = StyleSheet.create({
  list: {
    paddingBottom: 200,
  },
  divider: {
    height: Spacing.sm,
  },
})
