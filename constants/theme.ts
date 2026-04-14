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

// Google Fonts — loaded in app/_layout.tsx.
// Display: Space Grotesk (editorial geometric grotesque, Aeonik-like).
// Body/UI: Inter.
export const Fonts = {
  displayMedium: 'SpaceGrotesk_500Medium',
  displaySemi: 'SpaceGrotesk_600SemiBold',
  displayBold: 'SpaceGrotesk_700Bold',
  sansRegular: 'Inter_400Regular',
  sansMedium: 'Inter_500Medium',
  sansSemi: 'Inter_600SemiBold',
  sansBold: 'Inter_700Bold',
  mono: 'Menlo',
}

export const Type = {
  displayHero: {
    fontFamily: Fonts.displayMedium,
    fontSize: 64,
    lineHeight: 64,
    letterSpacing: -2.2,
  },
  display: {
    fontFamily: Fonts.displayMedium,
    fontSize: 48,
    lineHeight: 48,
    letterSpacing: -1.4,
  },
  heading1: {
    fontFamily: Fonts.displayMedium,
    fontSize: 34,
    lineHeight: 38,
    letterSpacing: -0.8,
  },
  heading2: {
    fontFamily: Fonts.displayMedium,
    fontSize: 26,
    lineHeight: 30,
    letterSpacing: -0.52,
  },
  heading3: {
    fontFamily: Fonts.displayMedium,
    fontSize: 20,
    lineHeight: 24,
    letterSpacing: -0.3,
  },
  bodyLarge: {
    fontFamily: Fonts.sansRegular,
    fontSize: 18,
    lineHeight: 28,
    letterSpacing: -0.09,
  },
  body: {
    fontFamily: Fonts.sansRegular,
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: -0.08,
  },
  bodySemibold: {
    fontFamily: Fonts.sansSemi,
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: -0.08,
  },
  bodySmall: {
    fontFamily: Fonts.sansRegular,
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: -0.05,
  },
  label: {
    fontFamily: Fonts.sansMedium,
    fontSize: 15,
    lineHeight: 20,
    letterSpacing: 0,
  },
  button: {
    fontFamily: Fonts.sansMedium,
    fontSize: 16,
    lineHeight: 20,
    letterSpacing: -0.1,
  },
  micro: {
    fontFamily: Fonts.sansBold,
    fontSize: 11,
    lineHeight: 14,
    letterSpacing: 1.2,
  },
}
