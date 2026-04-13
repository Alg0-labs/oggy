import { Platform } from 'react-native'

export const Colors = {
  bg: '#ffffff',
  bgDark: '#191c1f',
  surface: '#ffffff',
  surfaceMuted: '#f4f4f4',
  surfaceElevated: '#f4f4f4',
  border: '#e6e6ea',
  borderStrong: '#191c1f',

  primary: '#191c1f',
  primaryInverse: '#ffffff',

  text: '#191c1f',
  textInverse: '#ffffff',
  textSecondary: '#505a63',
  textMuted: '#8d969e',

  blue: '#494fdf',
  blueText: '#376cd5',
  teal: '#00a87e',
  pink: '#e61e49',
  danger: '#e23b4a',
  dangerBg: 'rgba(226, 59, 74, 0.08)',
  warning: '#ec7e00',
  yellow: '#b09000',
  brown: '#936d62',

  ghostOnDark: 'rgba(244, 244, 244, 0.1)',

  tabBar: '#ffffff',
  tabBarBorder: '#e6e6ea',
  card: '#ffffff',

  providers: {
    openai: '#00a87e',
    google: '#494fdf',
    anthropic: '#936d62',
  },
}

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
  huge: 80,
}

export const Radius = {
  sm: 8,
  md: 12,
  lg: 20,
  xl: 24,
  pill: 9999,
  full: 9999,
}

export const Fonts = Platform.select({
  ios: {
    display: 'System',
    sans: 'System',
    mono: 'Menlo',
  },
  default: {
    display: 'normal',
    sans: 'normal',
    mono: 'monospace',
  },
}) as { display: string; sans: string; mono: string }

export const Type = {
  displayHero: {
    fontFamily: Fonts.display,
    fontSize: 64,
    fontWeight: '500' as const,
    lineHeight: 64,
    letterSpacing: -2.2,
  },
  display: {
    fontFamily: Fonts.display,
    fontSize: 48,
    fontWeight: '500' as const,
    lineHeight: 48,
    letterSpacing: -1.4,
  },
  heading1: {
    fontFamily: Fonts.display,
    fontSize: 34,
    fontWeight: '500' as const,
    lineHeight: 38,
    letterSpacing: -0.8,
  },
  heading2: {
    fontFamily: Fonts.display,
    fontSize: 26,
    fontWeight: '500' as const,
    lineHeight: 30,
    letterSpacing: -0.52,
  },
  heading3: {
    fontFamily: Fonts.display,
    fontSize: 20,
    fontWeight: '500' as const,
    lineHeight: 24,
    letterSpacing: -0.3,
  },
  bodyLarge: {
    fontFamily: Fonts.sans,
    fontSize: 18,
    fontWeight: '400' as const,
    lineHeight: 28,
    letterSpacing: -0.09,
  },
  body: {
    fontFamily: Fonts.sans,
    fontSize: 16,
    fontWeight: '400' as const,
    lineHeight: 24,
    letterSpacing: 0.16,
  },
  bodySemibold: {
    fontFamily: Fonts.sans,
    fontSize: 16,
    fontWeight: '600' as const,
    lineHeight: 24,
    letterSpacing: 0.16,
  },
  bodySmall: {
    fontFamily: Fonts.sans,
    fontSize: 14,
    fontWeight: '400' as const,
    lineHeight: 20,
    letterSpacing: 0.16,
  },
  label: {
    fontFamily: Fonts.display,
    fontSize: 15,
    fontWeight: '500' as const,
    lineHeight: 20,
    letterSpacing: 0,
  },
  button: {
    fontFamily: Fonts.display,
    fontSize: 16,
    fontWeight: '500' as const,
    lineHeight: 20,
    letterSpacing: 0,
  },
  micro: {
    fontFamily: Fonts.sans,
    fontSize: 11,
    fontWeight: '700' as const,
    lineHeight: 14,
    letterSpacing: 1.2,
  },
}
