import { Ionicons } from '@expo/vector-icons'
import React from 'react'
import { StyleSheet, Text, TouchableOpacity, type ViewStyle } from 'react-native'
import { Colors, Radius, Spacing, Type, ACTIVE_OPACITY } from '../../constants/theme'

type IoniconName = keyof typeof Ionicons.glyphMap
type Variant = 'primary' | 'outline' | 'ghost' | 'danger'
type Size = 'sm' | 'md' | 'lg'

interface PillButtonProps {
  label: string
  variant?: Variant
  size?: Size
  icon?: IoniconName
  iconRight?: IoniconName
  active?: boolean
  disabled?: boolean
  onPress?: () => void
  style?: ViewStyle
}

const SIZE_STYLES: Record<Size, { px: number; py: number; fontSize: number }> = {
  sm: { px: 14, py: 8, fontSize: 13 },
  md: { px: 18, py: 10, fontSize: 14 },
  lg: { px: 28, py: 16, fontSize: 16 },
}

export function PillButton({
  label,
  variant = 'primary',
  size = 'md',
  icon,
  iconRight,
  active,
  disabled,
  onPress,
  style,
}: PillButtonProps) {
  const s = SIZE_STYLES[size]
  const v = getVariantStyle(variant, active)

  return (
    <TouchableOpacity
      style={[
        styles.base,
        {
          paddingHorizontal: s.px,
          paddingVertical: s.py,
          backgroundColor: v.bg,
          borderColor: v.border,
          borderWidth: v.borderWidth,
        },
        disabled && styles.disabled,
        style,
      ]}
      onPress={onPress}
      activeOpacity={ACTIVE_OPACITY}
      disabled={disabled}
    >
      {icon && <Ionicons name={icon} size={s.fontSize} color={v.text} />}
      <Text style={[styles.label, { fontSize: s.fontSize, color: v.text }]}>
        {label}
      </Text>
      {iconRight && <Ionicons name={iconRight} size={s.fontSize} color={v.text} />}
    </TouchableOpacity>
  )
}

function getVariantStyle(variant: Variant, active?: boolean) {
  switch (variant) {
    case 'primary':
      return {
        bg: Colors.primary,
        text: Colors.textInverse,
        border: Colors.primary,
        borderWidth: 0,
      }
    case 'outline':
      if (active) {
        return {
          bg: Colors.primary,
          text: Colors.textInverse,
          border: Colors.primary,
          borderWidth: 2,
        }
      }
      return {
        bg: 'transparent',
        text: Colors.text,
        border: Colors.border,
        borderWidth: 2,
      }
    case 'ghost':
      return {
        bg: 'transparent',
        text: Colors.text,
        border: 'transparent',
        borderWidth: 0,
      }
    case 'danger':
      return {
        bg: 'transparent',
        text: Colors.danger,
        border: 'transparent',
        borderWidth: 0,
      }
  }
}

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    borderRadius: Radius.pill,
  },
  label: {
    ...Type.buttonSmall,
  },
  disabled: {
    opacity: 0.4,
  },
})
