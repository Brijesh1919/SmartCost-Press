/**
 * theme.js
 * Industrial Blue Press Utility Design Tokens
 * Extracted directly from Stitch Project 9223740624035460481
 */

export const LightTheme = {
  isDark: false,
  colors: {
    // Brand & interactive
    primary: '#004AC6',
    primaryContainer: '#2563EB',
    onPrimary: '#FFFFFF',
    onPrimaryContainer: '#EEEFFF',
    primaryFixed: '#DBE1FF',
    primaryFixedDim: '#B4C5FF',

    secondary: '#0058BE',
    secondaryContainer: '#2170E4',
    onSecondary: '#FFFFFF',

    tertiary: '#17365D', // Deep Industrial Navy
    onTertiary: '#FFFFFF',
    tertiaryContainer: '#526E98',

    // Surfaces & cards
    background: '#F8FAFC',
    surface: '#FAF8FF',
    surfaceCard: '#FFFFFF',
    surfaceContainerLow: '#F2F3FF',
    surfaceContainer: '#EAEDFF',
    surfaceContainerHigh: '#E2E7FF',
    surfaceContainerHighest: '#DAE2FD',

    // Paper Ledger Input styling (distinct shop-floor paper ledger feel)
    surfaceInputLedger: '#FFF8DF',
    inputBorder: '#BDC9D6',
    inputBorderFocus: '#2563EB',

    // Typography
    textPrimary: '#0F172A',
    textSecondary: '#64748B',
    textMuted: '#94A3B8',
    divider: '#E2E8F0',
    outline: '#737686',

    // Semantics
    success: '#22C55E',
    successSurface: '#E7F6ED',
    successText: '#166534',
    successBorder: '#22C55E',

    warning: '#F59E0B',
    warningSurface: '#FEF3C7',
    warningText: '#92400E',

    danger: '#EF4444',
    dangerSurface: '#FEE2E2',
    dangerText: '#B91C1C'
  },

  borderRadius: {
    sm: 4,
    md: 8,
    lg: 12,
    xl: 16,
    full: 9999
  },

  spacing: {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 24,
    xxl: 32
  }
};

export const DarkTheme = {
  isDark: true,
  colors: {
    primary: '#3B82F6',
    primaryContainer: '#2563EB',
    onPrimary: '#FFFFFF',
    onPrimaryContainer: '#EEEFFF',
    primaryFixed: '#1E3A8A',
    primaryFixedDim: '#1D4ED8',

    secondary: '#60A5FA',
    secondaryContainer: '#1D4ED8',
    onSecondary: '#0F172A',

    tertiary: '#0F172A',
    onTertiary: '#F8FAFC',
    tertiaryContainer: '#1E293B',

    background: '#0B0F19',
    surface: '#111827',
    surfaceCard: '#1E293B',
    surfaceContainerLow: '#151E2E',
    surfaceContainer: '#1F2937',
    surfaceContainerHigh: '#374151',
    surfaceContainerHighest: '#4B5563',

    surfaceInputLedger: '#1E293B',
    inputBorder: '#475569',
    inputBorderFocus: '#3B82F6',

    textPrimary: '#F8FAFC',
    textSecondary: '#94A3B8',
    textMuted: '#64748B',
    divider: '#334155',
    outline: '#64748B',

    success: '#4ADE80',
    successSurface: '#064E3B',
    successText: '#6EE7B7',
    successBorder: '#10B981',

    warning: '#FBBF24',
    warningSurface: '#78350F',
    warningText: '#FDE68A',

    danger: '#F87171',
    dangerSurface: '#7F1D1D',
    dangerText: '#FECACA'
  },

  borderRadius: {
    sm: 4,
    md: 8,
    lg: 12,
    xl: 16,
    full: 9999
  },

  spacing: {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 24,
    xxl: 32
  }
};

