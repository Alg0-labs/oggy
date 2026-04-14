import { FontAwesome5, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons'
import React from 'react'
import { StyleSheet, Text, View } from 'react-native'
import { Colors, Fonts, Radius } from '../constants/theme'

export type BrandKey =
  | 'openai'
  | 'gemini'
  | 'anthropic'
  | 'github'
  | 'gmail'
  | 'googleCalendar'
  | 'x'

interface BrandIcon {
  bg: string
  /** Which icon family + glyph renders inside. */
  render: (size: number, color: string) => React.ReactNode
  /** Foreground color for glyph / text. */
  fg?: string
}

const BRANDS: Record<BrandKey, BrandIcon> = {
  openai: {
    bg: '#0d0d0d',
    fg: '#ffffff',
    render: (size, color) => (
      <MaterialCommunityIcons name="creation" size={size} color={color} />
    ),
  },
  gemini: {
    bg: '#1a73e8',
    fg: '#ffffff',
    render: (size, color) => (
      <MaterialCommunityIcons name="star-four-points" size={size} color={color} />
    ),
  },
  anthropic: {
    bg: '#c96442',
    fg: '#ffffff',
    render: (size, color) => (
      <Text
        style={{
          fontFamily: Fonts.displayBold,
          color,
          fontSize: size + 2,
          lineHeight: size + 4,
        }}
      >
        A
      </Text>
    ),
  },
  github: {
    bg: '#0d0d0d',
    fg: '#ffffff',
    render: (size, color) => (
      <FontAwesome5 name="github" size={size} color={color} />
    ),
  },
  gmail: {
    bg: '#ea4335',
    fg: '#ffffff',
    render: (size, color) => (
      <MaterialCommunityIcons name="gmail" size={size} color={color} />
    ),
  },
  googleCalendar: {
    bg: '#1a73e8',
    fg: '#ffffff',
    render: (size, color) => (
      <MaterialCommunityIcons name="calendar-month" size={size} color={color} />
    ),
  },
  x: {
    bg: '#0d0d0d',
    fg: '#ffffff',
    render: (size, color) => (
      <FontAwesome5 name="twitter" size={size - 2} color={color} />
    ),
  },
}

interface BrandLogoProps {
  brand: BrandKey
  size?: number
}

export function BrandLogo({ brand, size = 36 }: BrandLogoProps) {
  const meta = BRANDS[brand]
  const glyphSize = Math.round(size * 0.52)
  return (
    <View
      style={[
        styles.circle,
        { width: size, height: size, borderRadius: size / 2, backgroundColor: meta.bg },
      ]}
    >
      {meta.render(glyphSize, meta.fg ?? Colors.textInverse)}
    </View>
  )
}

const styles = StyleSheet.create({
  circle: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: Radius.pill,
  },
})
