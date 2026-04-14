import React from 'react'
import { StyleSheet, Text, View } from 'react-native'
import { Colors, Spacing, Type } from '../../constants/theme'

interface ScreenHeaderProps {
  title?: string
  left?: React.ReactNode
  right?: React.ReactNode
}

export function ScreenHeader({ title, left, right }: ScreenHeaderProps) {
  return (
    <View style={styles.container}>
      <View style={styles.side}>{left}</View>
      {title ? <Text style={styles.title}>{title}</Text> : <View />}
      <View style={[styles.side, styles.right]}>{right}</View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
  },
  side: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  right: {
    justifyContent: 'flex-end',
  },
  title: {
    ...Type.button,
    color: Colors.text,
  },
})
