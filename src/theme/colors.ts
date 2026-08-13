// Central theme tokens for You Free. Keep the palette small and reuse these
// everywhere instead of hard-coding hex values in components.
export const colors = {
  background: '#F7F8FA',
  surface: '#FFFFFF',
  border: '#E4E7EC',
  textPrimary: '#14171F',
  textSecondary: '#5B6472',
  textMuted: '#9AA2AF',

  // Brand — warm, "let's hang out" energy.
  primary: '#FF7A45',
  primaryMuted: '#FFE7DB',
  onPrimary: '#FFFFFF',

  // Golf sub-brand accent (kept distinct from the family/free-date flow).
  golf: '#2E7D5B',
  golfMuted: '#DFF3E8',
  onGolf: '#FFFFFF',

  success: '#2E7D5B',
  danger: '#D6483F',
  dangerMuted: '#FBE4E2',
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
} as const;

export const radius = {
  sm: 8,
  md: 12,
  lg: 20,
  pill: 999,
} as const;

export const typography = {
  title: { fontSize: 28, fontWeight: '700' as const },
  heading: { fontSize: 20, fontWeight: '700' as const },
  subheading: { fontSize: 16, fontWeight: '600' as const },
  body: { fontSize: 15, fontWeight: '400' as const },
  caption: { fontSize: 13, fontWeight: '400' as const },
};
