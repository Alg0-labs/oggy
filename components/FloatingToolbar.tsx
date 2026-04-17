import React from 'react'
import {
  View,
  Text,
  StyleSheet,
} from 'react-native'
import { IconButton } from './ui'
import { Colors, Radius, Spacing, Type } from '../constants/theme'

interface FloatingToolbarProps {
  title?: string
  onBack: () => void
  onDelete?: () => void
  visibility?: 'public' | 'private'
  onToggleVisibility?: () => void
}

export function FloatingToolbar({
  title,
  onBack,
  onDelete,
  visibility,
  onToggleVisibility,
}: FloatingToolbarProps) {
  const isPublic = visibility === 'public'
  return (
    <View style={styles.container}>
      <IconButton icon="chevron-back" size="lg" variant="inverse" onPress={onBack} />

      {title && (
        <View style={styles.titleWrap}>
          <Text style={styles.title} numberOfLines={1}>
            {title}
          </Text>
        </View>
      )}

      <View style={styles.right}>
        {onToggleVisibility && (
          <IconButton
            icon={isPublic ? 'globe-outline' : 'lock-closed'}
            size="lg"
            variant="inverse"
            onPress={onToggleVisibility}
          />
        )}
        {onDelete && (
          <IconButton icon="trash-outline" size="lg" variant="inverse" onPress={onDelete} />
        )}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 54,
    left: Spacing.md,
    right: Spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.sm,
    zIndex: 50,
  },
  titleWrap: {
    flex: 1,
    paddingHorizontal: Spacing.md,
    paddingVertical: 10,
    borderRadius: Radius.pill,
    backgroundColor: Colors.primary,
    alignItems: 'center',
  },
  title: {
    ...Type.buttonSmall,
    color: Colors.textInverse,
  },
  right: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
})
