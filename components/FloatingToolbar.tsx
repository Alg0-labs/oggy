import React from 'react'
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { Colors, Radius, Spacing } from '../constants/theme'

interface FloatingToolbarProps {
  title?: string
  onBack: () => void
  onDelete?: () => void
}

export function FloatingToolbar({ title, onBack, onDelete }: FloatingToolbarProps) {
  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.button} onPress={onBack} activeOpacity={0.7}>
        <Ionicons name="chevron-back" size={20} color={Colors.text} />
      </TouchableOpacity>

      {title && (
        <Text style={styles.title} numberOfLines={1}>
          {title}
        </Text>
      )}

      <View style={styles.right}>
        {onDelete && (
          <TouchableOpacity style={styles.button} onPress={onDelete} activeOpacity={0.7}>
            <Ionicons name="trash-outline" size={18} color={Colors.error} />
          </TouchableOpacity>
        )}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 54,
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.sm,
    backgroundColor: 'rgba(10, 10, 15, 0.85)',
    zIndex: 50,
  },
  button: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.surfaceElevated,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  title: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
    color: Colors.text,
    textAlign: 'center',
    marginHorizontal: Spacing.sm,
  },
  right: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
})
