import React, { useEffect, useRef } from 'react'
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { Colors, Radius, Spacing } from '../constants/theme'

interface ImmersiveToolbarProps {
  visible: boolean
  title?: string
  onBack: () => void
  onRefine?: () => void
  onDelete?: () => void
}

export function ImmersiveToolbar({
  visible,
  title,
  onBack,
  onRefine,
  onDelete,
}: ImmersiveToolbarProps) {
  const opacity = useRef(new Animated.Value(0)).current
  const translateY = useRef(new Animated.Value(-20)).current

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: visible ? 1 : 0,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: visible ? 0 : -20,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start()
  }, [visible, opacity, translateY])

  return (
    <Animated.View
      style={[
        styles.container,
        {
          opacity,
          transform: [{ translateY }],
        },
      ]}
      pointerEvents={visible ? 'auto' : 'none'}
    >
      <TouchableOpacity style={styles.button} onPress={onBack} activeOpacity={0.7}>
        <Ionicons name="chevron-back" size={20} color={Colors.text} />
      </TouchableOpacity>

      {title && (
        <Text style={styles.title} numberOfLines={1}>
          {title}
        </Text>
      )}

      <View style={styles.actions}>
        {onRefine && (
          <TouchableOpacity style={styles.button} onPress={onRefine} activeOpacity={0.7}>
            <Ionicons name="brush-outline" size={18} color={Colors.primary} />
          </TouchableOpacity>
        )}
        {onDelete && (
          <TouchableOpacity style={styles.button} onPress={onDelete} activeOpacity={0.7}>
            <Ionicons name="trash-outline" size={18} color={Colors.error} />
          </TouchableOpacity>
        )}
      </View>
    </Animated.View>
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
    backgroundColor: 'rgba(30, 30, 42, 0.9)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(42, 42, 56, 0.8)',
  },
  title: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
    color: Colors.text,
    textAlign: 'center',
    marginHorizontal: Spacing.sm,
  },
  actions: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
})
