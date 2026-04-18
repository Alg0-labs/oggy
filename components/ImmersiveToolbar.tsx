import React, { useEffect, useRef } from 'react'
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { Colors, Fonts, Radius, Spacing, Type } from '../constants/theme'

interface ImmersiveToolbarProps {
  visible: boolean
  title?: string
  onBack: () => void
  onRefine?: () => void
  onDelete?: () => void
  refineActive?: boolean
  visibility?: 'public' | 'private'
  onToggleVisibility?: () => void
}

export function ImmersiveToolbar({
  visible,
  title,
  onBack,
  onRefine,
  onDelete,
  refineActive,
  visibility,
  onToggleVisibility,
}: ImmersiveToolbarProps) {
  const opacity = useRef(new Animated.Value(0)).current
  const translateY = useRef(new Animated.Value(-16)).current

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: visible ? 1 : 0,
        duration: 220,
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: visible ? 0 : -16,
        duration: 220,
        useNativeDriver: true,
      }),
    ]).start()
  }, [visible, opacity, translateY])

  return (
    <Animated.View
      style={[
        styles.wrap,
        {
          opacity,
          transform: [{ translateY }],
        },
      ]}
      pointerEvents={visible ? 'auto' : 'none'}
    >
      <View style={styles.bar}>
        {/* Back — primary dark pill */}
        <TouchableOpacity
          style={styles.primaryBtn}
          onPress={onBack}
          activeOpacity={0.85}
          hitSlop={8}
        >
          <Ionicons name="chevron-back" size={18} color={Colors.textInverse} />
        </TouchableOpacity>

        {/* Title — display font, single line */}
        {title ? (
          <View style={styles.titleWrap}>
            <Text style={styles.title} numberOfLines={1}>
              {title}
            </Text>
          </View>
        ) : (
          <View style={styles.flexSpacer} />
        )}

        {/* Right actions — ghost pills */}
        <View style={styles.actions}>
          {onToggleVisibility && (
            <TouchableOpacity
              style={styles.ghostBtn}
              onPress={onToggleVisibility}
              activeOpacity={0.85}
              hitSlop={6}
            >
              <Ionicons
                name={visibility === 'public' ? 'globe-outline' : 'lock-closed-outline'}
                size={16}
                color={Colors.text}
              />
            </TouchableOpacity>
          )}
          {onRefine && (
            <TouchableOpacity
              style={[styles.ghostBtn, refineActive && styles.ghostBtnActive]}
              onPress={onRefine}
              activeOpacity={0.85}
              hitSlop={6}
            >
              <Ionicons
                name="chatbubble-ellipses-outline"
                size={16}
                color={refineActive ? Colors.textInverse : Colors.text}
              />
            </TouchableOpacity>
          )}
          {onDelete && (
            <TouchableOpacity
              style={styles.ghostBtn}
              onPress={onDelete}
              activeOpacity={0.85}
              hitSlop={6}
            >
              <Ionicons name="trash-outline" size={16} color={Colors.danger} />
            </TouchableOpacity>
          )}
        </View>
      </View>
    </Animated.View>
  )
}

const styles = StyleSheet.create({
  wrap: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    paddingTop: 48,
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.sm,
    zIndex: 50,
  },
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    backgroundColor: Colors.surface,
    borderRadius: Radius.pill,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingVertical: 6,
    paddingLeft: 6,
    paddingRight: 8,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 4 },
    elevation: 8,
  },
  primaryBtn: {
    width: 36,
    height: 36,
    borderRadius: Radius.pill,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ghostBtn: {
    width: 32,
    height: 32,
    borderRadius: Radius.pill,
    backgroundColor: Colors.surfaceMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ghostBtnActive: {
    backgroundColor: Colors.primary,
  },
  titleWrap: {
    flex: 1,
    paddingHorizontal: Spacing.xs,
  },
  title: {
    fontFamily: Fonts.displaySemi,
    fontSize: 15,
    lineHeight: 18,
    color: Colors.text,
    letterSpacing: -0.2,
  },
  flexSpacer: {
    flex: 1,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
})
