export const Typography = {
  display: {
    fontFamily: 'Manrope_700Bold',
    fontSize: 56,
    lineHeight: 64,
    letterSpacing: -0.32,
  },
  displaySmall: {
    fontFamily: 'Manrope_700Bold',
    fontSize: 36,
    lineHeight: 44,
    letterSpacing: -0.2,
  },
  headline: {
    fontFamily: 'Manrope_600SemiBold',
    fontSize: 28,
    lineHeight: 36,
    letterSpacing: -0.16,
  },
  headlineSmall: {
    fontFamily: 'Manrope_600SemiBold',
    fontSize: 24,
    lineHeight: 32,
    letterSpacing: 0,
  },
  titleLarge: {
    fontFamily: 'Inter_500Medium',
    fontSize: 22,
    lineHeight: 28,
    letterSpacing: 0,
  },
  title: {
    fontFamily: 'Inter_500Medium',
    fontSize: 18,
    lineHeight: 24,
    letterSpacing: 0,
  },
  titleSmall: {
    fontFamily: 'Inter_500Medium',
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 0.1,
  },
  bodyLarge: {
    fontFamily: 'Inter_400Regular',
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: 0.5,
  },
  body: {
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 0.14,
  },
  bodySmall: {
    fontFamily: 'Inter_400Regular',
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: 0.4,
  },
  labelLarge: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 0.1,
  },
  label: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: 0.36,
  },
  labelSmall: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 11,
    lineHeight: 16,
    letterSpacing: 0.5,
  },
} as const;

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  '2xl': 40,
  '3xl': 48,
  '4xl': 64,
  '5xl': 80,
  screenGutter: 24,
  interElement: 16,
  sectionGap: 56,
} as const;

export const Radius = {
  sm: 4,
  md: 8,
  lg: 16,
  xl: 24,
  '2xl': 32,
  full: 9999,
} as const;
