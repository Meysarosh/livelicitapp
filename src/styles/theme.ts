export const baseTheme = {
  spacing: (factor: number) => `${factor * 4}px`,

  breakpoints: {
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
  },

  radii: {
    sm: '4px',
    md: '8px',
    lg: '12px',
    xl: '16px',
    pill: '9999px',
  },

  shadows: {
    subtle: '0 1px 3px rgba(15, 23, 42, 0.08)',
    medium: '0 10px 25px rgba(15, 23, 42, 0.12)',
  },

  typography: {
    fontFamily: `'Inter', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif`,
    fontSizeBase: '16px',
    lineHeightBase: 1.5,
    fontWeightRegular: 400,
    fontWeightMedium: 500,
    fontWeightBold: 600,
    h1Size: '24px',
    h2Size: '18px',
    pSize: '15px',
    pSmallSize: '14px',
    smallSize: '13px',
    spanSize: '12px',
  },
};

// --------------------
// LIGHT THEME
// --------------------
export const lightTheme = {
  ...baseTheme,
  colors: {
    bg: '#f3f4f6',
    bgElevated: '#ffffff',
    border: '#e5e7eb',
    text: '#111827',
    textMuted: '#6b7280',

    primary: '#2563eb',
    primaryHover: '#1d4ed8',
    secondary: '#6b7280',
    secondaryHover: '#4b5563',
    danger: '#dc2626',
    dangerHover: '#b91c1c',
    accent: '#f97316',

    // text-on-color helpers for buttons
    textOnPrimary: '#ffffff',
    textOnSecondary: '#ffffff',
    textOnDanger: '#ffffff',

    // Status / semantic tones
    successSoft: '#dcfce7', // green-100
    successStrong: '#15803d', // green-700

    warningSoft: '#fef9c3', // yellow-100
    warningStrong: '#92400e', // yellow-700

    dangerSoft: '#fee2e2', // red-100
    dangerStrong: '#b91c1c', // red-700

    accentSoft: '#ffedd5', // orange-100

    // Surfaces
    headerBg: '#ffffff',
    footerBg: '#f9fafb',

    // Forms
    inputBg: '#ffffff',
    inputBorder: '#d1d5db',
    inputFocus: '#2563eb',
  },
};

// --------------------
// DARK THEME
// --------------------
export const darkTheme = {
  ...baseTheme,
  colors: {
    bg: '#020617',
    bgElevated: '#0f172a',
    border: '#1f2937',

    text: '#e5e7eb',
    textMuted: '#9ca3af',

    primary: '#3b82f6',
    primaryHover: '#2563eb',

    // add secondary for dark theme
    secondary: '#6b7280',
    secondaryHover: '#4b5563',

    danger: '#f97316',
    dangerHover: '#ea580c',

    accent: '#22c55e',

    // text-on-color helpers for buttons in dark mode
    textOnPrimary: '#ffffff',
    textOnSecondary: '#f9fafb',
    textOnDanger: '#ffffff',

    // Status tones in dark mode
    successSoft: 'rgba(34,197,94,0.15)',
    successStrong: '#4ade80',

    warningSoft: 'rgba(250,204,21,0.12)',
    warningStrong: '#facc15',

    dangerSoft: 'rgba(239,68,68,0.15)',
    dangerStrong: '#f87171',

    accentSoft: 'rgba(249,115,22,0.15)',

    // Surfaces
    headerBg: '#020617',
    footerBg: '#020617',

    // Forms
    inputBg: '#0f172a',
    inputBorder: '#374151',
    inputFocus: '#3b82f6',
  },
};

export type AppTheme = typeof lightTheme;
