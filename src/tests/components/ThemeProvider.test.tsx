/// <reference types="vitest/globals" />

import { render } from '@/tests/test-utils'
import { store } from '@/app/store'
import { setTheme } from '@/stores/uiSlice'
import ThemeProvider from '@/components/common/ThemeProvider'

describe('ThemeProvider', () => {
  afterEach(() => {
    document.documentElement.classList.remove('dark')
  })

  it('applies dark class when theme is dark', async () => {
    store.dispatch(setTheme('dark'))
    render(<ThemeProvider />)
    // The effect runs on mount
    await vi.waitFor(() => {
      expect(document.documentElement.classList.contains('dark')).toBe(true)
    })
  })

  it('removes dark class when theme is light', async () => {
    document.documentElement.classList.add('dark')
    store.dispatch(setTheme('light'))
    render(<ThemeProvider />)
    await vi.waitFor(() => {
      expect(document.documentElement.classList.contains('dark')).toBe(false)
    })
  })

  it('applies system preference when theme is system', async () => {
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: vi.fn().mockImplementation((query: string) => ({
        matches: query === '(prefers-color-scheme: dark)',
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    })
    store.dispatch(setTheme('system'))
    render(<ThemeProvider />)
    await vi.waitFor(() => {
      expect(document.documentElement.classList.contains('dark')).toBe(true)
    })
  })
})
