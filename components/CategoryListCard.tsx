import React from 'react'
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native'
import { Image } from 'expo-image'
import { BlurView } from 'expo-blur'
import { CommunityApp } from '../constants/mockCommunity'
import { Colors, Radius, Type } from '../constants/theme'

interface CategoryListCardProps {
  app: CommunityApp
  onPress?: () => void
}

export function CategoryListCard({ app, onPress }: CategoryListCardProps) {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.88}>
      <BlurView tint="light" intensity={24} style={StyleSheet.absoluteFill} />

      <View style={styles.row}>
        <View style={styles.thumbWrap}>
          <Image
            source={{ uri: app.imageUrl }}
            style={styles.thumb}
            contentFit="cover"
            transition={150}
          />
        </View>

        <View style={styles.body}>
          <Text style={styles.name} numberOfLines={1}>
            {app.name}
          </Text>
          <Text style={styles.author} numberOfLines={1}>
            {app.author.handle}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(25,28,31,0.06)',
    backgroundColor: 'rgba(255,255,255,0.6)',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    padding: 12,
  },
  thumbWrap: {
    width: 64,
    height: 64,
    borderRadius: Radius.md,
    overflow: 'hidden',
    backgroundColor: Colors.surfaceMuted,
  },
  thumb: {
    width: '100%',
    height: '100%',
  },
  body: {
    flex: 1,
    minWidth: 0,
    gap: 4,
  },
  name: {
    ...Type.heading3,
    fontSize: 18,
    lineHeight: 22,
    color: Colors.text,
    letterSpacing: -0.4,
  },
  author: {
    ...Type.bodySmall,
    fontSize: 13,
    color: Colors.textMuted,
    letterSpacing: -0.1,
  },
})
