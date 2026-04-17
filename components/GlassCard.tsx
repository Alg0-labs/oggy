import { BlurView } from 'expo-blur'
import React from 'react'
import { Platform, StyleSheet, View, ViewProps, ViewStyle } from 'react-native'
import { Radius } from '../constants/theme'

interface GlassCardProps extends ViewProps {
  tint?: 'light' | 'danger'
  radius?: number
  style?: ViewStyle | ViewStyle[]
}

export function GlassCard({
  tint = 'light',
  radius = Radius.lg,
  style,
  children,
  ...rest
}: GlassCardProps) {
  return (
    <View
      style={[
        styles.base,
        { borderRadius: radius },
        tint === 'danger' ? styles.dangerShadow : styles.lightShadow,
        style,
      ]}
      {...rest}
    >
      <View style={[styles.clip, { borderRadius: radius }]}>
        <BlurView
          intensity={Platform.OS === 'ios' ? 60 : 40}
          tint={Platform.OS === 'ios' ? 'systemUltraThinMaterialLight' : 'light'}
          style={StyleSheet.absoluteFill}
        />
        <View
          style={[
            StyleSheet.absoluteFill,
            tint === 'danger' ? styles.washDanger : styles.washLight,
          ]}
        />
        <View
          style={[
            StyleSheet.absoluteFill,
            { borderRadius: radius },
            styles.hairline,
            tint === 'danger' && styles.hairlineDanger,
          ]}
        />
        {children}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  base: {
    overflow: 'visible',
  },
  clip: {
    overflow: 'hidden',
  },
  lightShadow: {
    shadowColor: '#a0a8b0',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 14,
    elevation: 2,
  },
  dangerShadow: {
    shadowColor: '#e23b4a',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 2,
  },
  washLight: {
    backgroundColor: 'rgba(255,255,255,0.45)',
  },
  washDanger: {
    backgroundColor: 'rgba(226,59,74,0.05)',
  },
  hairline: {
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255,255,255,0.85)',
  },
  hairlineDanger: {
    borderColor: 'rgba(226,59,74,0.25)',
  },
})
