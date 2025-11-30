export const baseTheme = {
  spacing: (factor: number) => `${factor * 4}px`,

  // breakpoints
  breakpoints: {
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
  },

  // border radii
  radii: {
    sm: '4px',
    md: '8px',
    lg: '12px',
    xl: '16px',
    pill: '9999px',
  },

  // shadows
  shadows: {
    subtle: '0 1px 3px rgba(15, 23, 42, 0.08)',
    medium: '0 10px 25px rgba(15, 23, 42, 0.12)',
  },

  // typography
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

export const lightTheme = {
  ...baseTheme,
  colors: {
    bg: '#f3f4f6',
    bgElevated: '#f4f4f4ff',
    border: '#e5e7eb',
    text: '#111827',
    textMuted: '#6b7280',
    primary: '#2563eb',
    primaryHover: '#1d4ed8',
    danger: '#dc2626',
    dangerHover: '#b91c1c',
    accent: '#f97316',
    // surfaces
    headerBg: '#ffffff',
    footerBg: '#f9fafb',
    // forms
    inputBg: '#ffffff',
    inputBorder: '#d1d5db',
    inputFocus: '#2563eb',
  },
};

export const darkTheme = {
  ...baseTheme,
  colors: {
    bg: '#020617',
    bgElevated: '#020617',
    border: '#1f2937',
    text: '#e5e7eb',
    textMuted: '#9ca3af',
    primary: '#3b82f6',
    primaryHover: '#2563eb',
    danger: '#f97316',
    dangerHover: '#ea580c',
    accent: '#22c55e',
    headerBg: '#020617',
    footerBg: '#020617',
    inputBg: '#020617',
    inputBorder: '#374151',
    inputFocus: '#3b82f6',
  },
};

export type AppTheme = typeof lightTheme;
