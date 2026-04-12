import { Platform } from 'react-native'

export const Colors = {
  bg: '#0A0A0F',
  surface: '#16161F',
  surfaceElevated: '#1E1E2A',
  border: '#2A2A38',
  primary: '#7C6AF6',
  primaryMuted: 'rgba(124, 106, 246, 0.15)',
  accent: '#00D4FF',
  text: '#FFFFFF',
  textSecondary: '#8E8EA0',
  textMuted: '#5A5A6E',
  error: '#FF4D6A',
  errorBg: 'rgba(255, 77, 106, 0.1)',
  success: '#34D399',
  successBg: 'rgba(52, 211, 153, 0.1)',
  tabBar: '#0E0E14',
  tabBarBorder: '#1A1A25',
  card: '#16161F',

  providers: {
    openai: '#10A37F',
    google: '#4285F4',
    anthropic: '#D4A574',
  },
}

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
}

export const Radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 999,
}

export const Fonts = Platform.select({
  ios: {
    sans: 'System',
    mono: 'Menlo',
  },
  default: {
    sans: 'normal',
    mono: 'monospace',
  },
})
