import { useEffect } from 'react'
import { useAppSelector } from '@/app/hooks'
import { selectTheme } from '@/stores/uiSlice'

export default function ThemeProvider() {
  const theme = useAppSelector(selectTheme)

  useEffect(() => {
    const root = document.documentElement
    if (theme === 'system') {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
      root.classList.toggle('dark', prefersDark)
    } else {
      root.classList.toggle('dark', theme === 'dark')
    }
  }, [theme])

  return null
}
