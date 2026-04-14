import { Ionicons } from '@expo/vector-icons'
import React from 'react'
import { StyleSheet, TouchableOpacity, type ViewStyle } from 'react-native'
import { Colors, Radius, ACTIVE_OPACITY, HIT_SLOP } from '../../constants/theme'

type IoniconName = keyof typeof Ionicons.glyphMap

type Size = 'sm' | 'md' | 'lg'
type Variant = 'muted' | 'glass' | 'inverse'

interface IconButtonProps {
  icon: IoniconName
  size?: Size
  variant?: Variant
  onPress?: () => void
  disabled?: boolean
  style?: ViewStyle
}

const SIZES: Record<Size, { box: number; icon: number }> = {
  sm: { box: 36, icon: 18 },
  md: { box: 40, icon: 20 },
  lg: { box: 44, icon: 22 },
}

const VARIANT_STYLES: Record<Variant, { bg: string; color: string }> = {
  muted: { bg: Colors.surfaceMuted, color: Colors.text },
  glass: { bg: 'rgba(25,28,31,0.06)', color: Colors.text },
  inverse: { bg: Colors.primary, color: Colors.textInverse },
}

export function IconButton({
  icon,
  size = 'md',
  variant = 'muted',
  onPress,
  disabled,
  style,
}: IconButtonProps) {
  const s = SIZES[size]
  const v = VARIANT_STYLES[variant]
  return (
    <TouchableOpacity
      style={[
        styles.base,
        { width: s.box, height: s.box, backgroundColor: v.bg },
        disabled && styles.disabled,
        style,
      ]}
      onPress={onPress}
      activeOpacity={ACTIVE_OPACITY}
      hitSlop={HIT_SLOP}
      disabled={disabled}
    >
      <Ionicons name={icon} size={s.icon} color={v.color} />
    </TouchableOpacity>
  )
}

export function IconButtonSpacer({ size = 'md' }: { size?: Size }) {
  const s = SIZES[size]
  return <TouchableOpacity style={{ width: s.box, height: s.box }} disabled />
}

const styles = StyleSheet.create({
  base: {
    borderRadius: Radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  disabled: {
    opacity: 0.4,
  },
})
