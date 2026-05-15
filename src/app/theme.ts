import { alpha, createTheme, type PaletteMode } from '@mui/material/styles'

const fontFamily = ['Inter', 'Roboto', 'Helvetica', 'Arial', 'sans-serif'].join(',')

export function createResumeForgeTheme(mode: PaletteMode) {
  const isDark = mode === 'dark'

  return createTheme({
    palette: {
      mode,
      primary: {
        main: isDark ? '#2dd4bf' : '#00796b',
        light: isDark ? '#5eead4' : '#26a69a',
        dark: isDark ? '#0f766e' : '#004d40',
        contrastText: isDark ? '#052f2b' : '#ffffff',
      },
      secondary: {
        main: isDark ? '#a5b4fc' : '#4f46e5',
        light: isDark ? '#c7d2fe' : '#818cf8',
        dark: isDark ? '#6366f1' : '#3730a3',
        contrastText: isDark ? '#111827' : '#ffffff',
      },
      success: {
        main: isDark ? '#34d399' : '#059669',
        contrastText: isDark ? '#052e1b' : '#ffffff',
      },
      warning: {
        main: isDark ? '#fbbf24' : '#d97706',
        contrastText: isDark ? '#2f1d04' : '#ffffff',
      },
      error: {
        main: isDark ? '#fb7185' : '#dc2626',
        contrastText: isDark ? '#3f0713' : '#ffffff',
      },
      info: {
        main: isDark ? '#38bdf8' : '#0284c7',
        contrastText: isDark ? '#082f49' : '#ffffff',
      },
      background: {
        default: isDark ? '#0f172a' : '#f6f8fb',
        paper: isDark ? '#111827' : '#ffffff',
      },
      text: {
        primary: isDark ? '#f8fafc' : '#111827',
        secondary: isDark ? '#cbd5e1' : '#5b6472',
      },
      divider: isDark ? alpha('#cbd5e1', 0.16) : alpha('#111827', 0.1),
    },
    shape: {
      borderRadius: 8,
    },
    typography: {
      fontFamily,
      h1: { fontSize: '2.25rem', fontWeight: 700, lineHeight: 1.15, letterSpacing: 0 },
      h2: { fontSize: '1.875rem', fontWeight: 700, lineHeight: 1.2, letterSpacing: 0 },
      h3: { fontSize: '1.5rem', fontWeight: 700, lineHeight: 1.25, letterSpacing: 0 },
      h4: { fontSize: '1.25rem', fontWeight: 700, lineHeight: 1.3, letterSpacing: 0 },
      h5: { fontSize: '1.125rem', fontWeight: 700, lineHeight: 1.35, letterSpacing: 0 },
      h6: { fontSize: '1rem', fontWeight: 700, lineHeight: 1.4, letterSpacing: 0 },
      subtitle1: { fontSize: '1rem', fontWeight: 600, letterSpacing: 0 },
      subtitle2: { fontSize: '0.875rem', fontWeight: 600, letterSpacing: 0 },
      body1: { fontSize: '0.9375rem', lineHeight: 1.6, letterSpacing: 0 },
      body2: { fontSize: '0.875rem', lineHeight: 1.55, letterSpacing: 0 },
      button: { fontWeight: 700, letterSpacing: 0, textTransform: 'none' },
      caption: { fontSize: '0.75rem', lineHeight: 1.45, letterSpacing: 0 },
      overline: {
        fontSize: '0.75rem',
        fontWeight: 700,
        letterSpacing: 0,
        textTransform: 'uppercase',
      },
    },
    components: {
      MuiButton: {
        defaultProps: {
          disableElevation: true,
        },
        styleOverrides: {
          root: {
            borderRadius: 8,
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: ({ theme }) => ({
            border: `1px solid ${theme.palette.divider}`,
            borderRadius: 8,
            boxShadow: isDark
              ? '0 18px 44px rgba(0, 0, 0, 0.22)'
              : '0 18px 44px rgba(15, 23, 42, 0.06)',
          }),
        },
      },
      MuiPaper: {
        styleOverrides: {
          rounded: {
            borderRadius: 8,
          },
        },
      },
      MuiTextField: {
        defaultProps: {
          variant: 'outlined',
          size: 'small',
          fullWidth: true,
        },
      },
      MuiAlert: {
        styleOverrides: {
          root: {
            borderRadius: 8,
          },
        },
      },
      MuiChip: {
        styleOverrides: {
          root: {
            fontWeight: 700,
          },
        },
      },
    },
  })
}
