export const Colors = {
  primary: '#3730A3',
  primaryContainer: '#4F4BBC',
  primaryFixed: '#E2DFFF',
  primaryFixedDim: '#C3C0FF',
  onPrimary: '#FFFFFF',
  onPrimaryContainer: '#D0CDFF',
  onPrimaryFixed: '#0F0069',
  onPrimaryFixedVariant: '#3B35A7',

  secondary: '#505F76',
  secondaryContainer: '#D0E1FB',
  secondaryFixed: '#D3E4FE',
  secondaryFixedDim: '#B7C8E1',
  onSecondary: '#FFFFFF',
  onSecondaryContainer: '#54647A',

  tertiary: '#6C3400',
  tertiaryContainer: '#8F4700',
  tertiaryFixed: '#FFDCC6',
  tertiaryFixedDim: '#FFB784',
  onTertiary: '#FFFFFF',
  onTertiaryContainer: '#FFC7A2',

  surface: '#F7F9FB',
  surfaceBright: '#F7F9FB',
  surfaceDim: '#D8DADC',
  surfaceContainer: '#ECEEF0',
  surfaceContainerHigh: '#E6E8EA',
  surfaceContainerHighest: '#E0E3E5',
  surfaceContainerLow: '#F2F4F6',
  surfaceContainerLowest: '#FFFFFF',
  surfaceTint: '#544FC0',
  surfaceVariant: '#E0E3E5',

  onSurface: '#191C1E',
  onSurfaceVariant: '#454652',

  background: '#F7F9FB',
  onBackground: '#191C1E',

  error: '#BA1A1A',
  errorContainer: '#FFDAD6',
  onError: '#FFFFFF',
  onErrorContainer: '#93000A',

  outline: '#757684',
  outlineVariant: '#C5C5D4',

  inverseSurface: '#2D3133',
  inverseOnSurface: '#EFF1F3',
  inversePrimary: '#C3C0FF',
} as const;

export type ColorToken = keyof typeof Colors;
