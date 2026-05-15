/// <reference types="vitest/globals" />

import { store } from '@/app/store'
import ThemeProvider, { resolvePaletteMode } from '@/components/common/ThemeProvider'
import { setTheme } from '@/stores/uiSlice'
import { render } from '@/tests/test-utils'

describe('ThemeProvider', () => {
  afterEach(() => {
    document.documentElement.classList.remove('dark')
    document.documentElement.removeAttribute('data-mui-color-scheme')
    document.documentElement.style.colorScheme = ''
  })

  it('resolves explicit theme preferences', () => {
    expect(resolvePaletteMode('dark', false)).toBe('dark')
    expect(resolvePaletteMode('light', true)).toBe('light')
    expect(resolvePaletteMode('system', true)).toBe('dark')
    expect(resolvePaletteMode('system', false)).toBe('light')
  })

  it('applies the dark MUI color scheme without relying on the Tailwind dark class', async () => {
    store.dispatch(setTheme('dark'))
    render(
      <ThemeProvider>
        <div>Theme child</div>
      </ThemeProvider>,
    )

    await vi.waitFor(() => {
      expect(document.documentElement.dataset.muiColorScheme).toBe('dark')
    })
    expect(document.documentElement.style.colorScheme).toBe('dark')
    expect(document.documentElement.classList.contains('dark')).toBe(false)
  })

  it('applies the light MUI color scheme', async () => {
    document.documentElement.classList.add('dark')
    store.dispatch(setTheme('light'))
    render(
      <ThemeProvider>
        <div>Theme child</div>
      </ThemeProvider>,
    )

    await vi.waitFor(() => {
      expect(document.documentElement.dataset.muiColorScheme).toBe('light')
    })
    expect(document.documentElement.style.colorScheme).toBe('light')
    expect(document.documentElement.classList.contains('dark')).toBe(false)
  })

  it('applies system preference through the MUI color scheme bridge', async () => {
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
    render(
      <ThemeProvider>
        <div>Theme child</div>
      </ThemeProvider>,
    )

    await vi.waitFor(() => {
      expect(document.documentElement.dataset.muiColorScheme).toBe('dark')
    })
    expect(document.documentElement.classList.contains('dark')).toBe(false)
  })
})
