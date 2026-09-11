// Design tokens pulled directly from the TabTalk .dc.html source of truth.
export const colors = {
  appBg: '#eeece6',
  surface: '#ffffff',
  surfaceMuted: '#f2f0f7',
  surfaceMuted2: '#f7f5fb',
  surfaceMuted3: '#faf9fc',

  border: '#ece8f7',
  borderLight: '#f0eef7',
  borderLighter: '#f4f2f9',

  ink: '#201a3d',
  inkHigh: '#241c4a',
  textMuted: '#8a83a8',
  textMuted2: '#6c6788',
  textMuted3: '#4b4468',
  textMuted4: '#5b5578',
  textFaint: '#b1abc7',
  textDisabled: '#a49dc0',
  textPlaceholder: '#c8c3dc',

  primaryDark: '#241c4a',
  primaryMid: '#4b3f95',
  primary: '#6152b0',
  primaryLight: '#7566c7',
  primaryLighter: '#8a6fd6',

  success: '#4f9d74',
  successBg: '#e7f4ec',
  warning: '#d79b3f',
  warningBg: '#fbf0e2',
  danger: '#c4573f',
  dangerBg: '#f4e4e0',

  chipInactiveBg: '#f2f0f7',
  chipInactiveText: '#4b4468',

  white: '#ffffff',
} as const;

export const gradients = {
  primary: [colors.primaryDark, colors.primary] as const,
  splash: [colors.primaryDark, colors.primaryMid, colors.primaryLight] as const,
  hero: ['#1c1540', '#3a2f7d', '#6152b0', '#8a6fd6'] as const,
};

export const radii = {
  xs: 8,
  sm: 10,
  md: 12,
  lg: 14,
  xl: 16,
  xxl: 18,
  xxxl: 20,
  huge: 24,
  card: 36,
  pill: 999,
};

export const spacing = {
  xs: 4,
  sm: 6,
  md: 8,
  lg: 12,
  xl: 16,
  xxl: 20,
  xxxl: 24,
};

export const fonts = {
  heading: 'Manrope_800ExtraBold',
  headingBold: 'Manrope_700Bold',
  headingMedium: 'Manrope_500Medium',
  body: 'Inter_400Regular',
  bodyMedium: 'Inter_500Medium',
  bodySemibold: 'Inter_600SemiBold',
  bodyBold: 'Inter_700Bold',
};

export const shadow = {
  card: {
    shadowColor: '#241c4a',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 4,
  },
  soft: {
    shadowColor: '#241c4a',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 2,
  },
  button: {
    shadowColor: '#241c4a',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.28,
    shadowRadius: 16,
    elevation: 6,
  },
};
