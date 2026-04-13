import React from 'react'
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
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
      <TouchableOpacity style={styles.button} onPress={onBack} activeOpacity={0.85}>
        <Ionicons name="chevron-back" size={20} color={Colors.textInverse} />
      </TouchableOpacity>

      {title && (
        <View style={styles.titleWrap}>
          <Text style={styles.title} numberOfLines={1}>
            {title}
          </Text>
        </View>
      )}

      <View style={styles.right}>
        {onToggleVisibility && (
          <TouchableOpacity
            style={styles.button}
            onPress={onToggleVisibility}
            activeOpacity={0.85}
          >
            <Ionicons
              name={isPublic ? 'globe-outline' : 'lock-closed'}
              size={18}
              color={Colors.textInverse}
            />
          </TouchableOpacity>
        )}
        {onDelete && (
          <TouchableOpacity style={styles.button} onPress={onDelete} activeOpacity={0.85}>
            <Ionicons name="trash-outline" size={18} color={Colors.textInverse} />
          </TouchableOpacity>
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
  button: {
    width: 44,
    height: 44,
    borderRadius: Radius.pill,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
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
    ...Type.button,
    color: Colors.textInverse,
    fontSize: 14,
  },
  right: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
})
