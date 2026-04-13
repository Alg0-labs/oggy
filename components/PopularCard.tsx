import React from 'react'
import { Dimensions, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { Image } from 'expo-image'
import { CommunityApp } from '../constants/mockCommunity'
import { Colors, Fonts, Radius, Spacing, Type } from '../constants/theme'

const SCREEN_WIDTH = Dimensions.get('window').width
const DEFAULT_CARD_WIDTH = SCREEN_WIDTH - Spacing.lg * 2
const DEFAULT_CARD_HEIGHT = 260

interface PopularCardProps {
  app: CommunityApp
  onPress?: () => void
  cardWidth?: number
  cardHeight?: number
}

export function PopularCard({ app, onPress, cardWidth, cardHeight }: PopularCardProps) {
  const width = cardWidth ?? DEFAULT_CARD_WIDTH
  const height = cardHeight ?? DEFAULT_CARD_HEIGHT

  return (
    <TouchableOpacity
      style={[styles.card, { width, height }]}
      onPress={onPress}
      activeOpacity={0.9}
    >
      {/* Background image */}
      <Image
        source={{ uri: app.imageUrl }}
        style={StyleSheet.absoluteFill}
        contentFit="cover"
        autoplay
      />

      {/* Text content — bottom-left, editorial style */}
      <View style={styles.content}>
        <Text style={styles.title} numberOfLines={2}>
          {app.name}
        </Text>
        <Text style={styles.byline} numberOfLines={1}>
          by {app.author.handle}
        </Text>
      </View>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  card: {
    width: DEFAULT_CARD_WIDTH,
    height: DEFAULT_CARD_HEIGHT,
    borderRadius: Radius.xl,
    overflow: 'hidden',
    backgroundColor: Colors.bgDark,
  },
  content: {
    position: 'absolute',
    left: Spacing.lg,
    right: Spacing.lg,
    bottom: Spacing.lg,
  },
  title: {
    fontFamily: Fonts.displayBold,
    fontSize: 28,
    lineHeight: 32,
    letterSpacing: -0.6,
    color: Colors.textInverse,
    marginBottom: 4,
  },
  byline: {
    ...Type.bodySmall,
    color: 'rgba(255,255,255,0.72)',
  },
})
