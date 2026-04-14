import React from 'react'
import { StyleSheet, Text, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { YourAppsContent } from '../../components/home/YourAppsContent'
import { Colors, Spacing, Type } from '../../constants/theme'

export default function YoursScreen() {
  const insets = useSafeAreaInsets()

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Text style={styles.title}>Your apps</Text>
      </View>
      <View style={styles.content}>
        <YourAppsContent />
      </View>

    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.bg,
  },
  header: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.xs,
  },
  title: {
    ...Type.heading2,
    color: Colors.text,
    letterSpacing: -0.8,
  },
  content: {
    flex: 1,
  },
})
