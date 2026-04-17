import * as Haptics from 'expo-haptics'
import { useRouter } from 'expo-router'
import React from 'react'
import { StyleSheet, Text, TouchableOpacity } from 'react-native'
import { mockProfile } from '../constants/mockProfile'
import { Colors, Fonts, Radius } from '../constants/theme'

export function ProfileAvatarButton() {
  const router = useRouter()

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      hitSlop={8}
      onPress={() => {
        Haptics.selectionAsync()
        router.push('/profile')
      }}
      style={[styles.avatar, { backgroundColor: mockProfile.avatarColor }]}
    >
      <Text style={styles.initials}>{mockProfile.avatarInitials}</Text>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  avatar: {
    width: 36,
    height: 36,
    borderRadius: Radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: Colors.bg,
  },
  initials: {
    fontFamily: Fonts.sansBold,
    fontSize: 13,
    color: Colors.textInverse,
    letterSpacing: 0.2,
  },
})
