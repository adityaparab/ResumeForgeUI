import { CssBaseline, useMediaQuery } from '@mui/material'
import { ThemeProvider as MuiThemeProvider, type PaletteMode } from '@mui/material/styles'
import { type ReactNode, useEffect, useMemo } from 'react'
import { useAppSelector } from '@/app/hooks'
import { createResumeForgeTheme } from '@/app/theme'
import { selectTheme, type Theme } from '@/stores/uiSlice'

interface ThemeProviderProps {
  children?: ReactNode
}

export function resolvePaletteMode(theme: Theme, prefersDark: boolean): PaletteMode {
  if (theme === 'system') return prefersDark ? 'dark' : 'light'
  return theme
}

export default function ThemeProvider({ children }: ThemeProviderProps) {
  const themePreference = useAppSelector(selectTheme)
  const prefersDark = useMediaQuery('(prefers-color-scheme: dark)', { noSsr: true })
  const mode = resolvePaletteMode(themePreference, prefersDark)
  const theme = useMemo(() => createResumeForgeTheme(mode), [mode])

  useEffect(() => {
    const root = document.documentElement
    root.classList.remove('dark')
    root.dataset.muiColorScheme = mode
    root.style.colorScheme = mode
  }, [mode])

  return (
    <MuiThemeProvider theme={theme}>
      <CssBaseline enableColorScheme />
      {children}
    </MuiThemeProvider>
  )
}
