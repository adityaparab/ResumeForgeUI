import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'
import MainLayout from '@/components/layout/MainLayout'
import { render } from '@/tests/test-utils'

function mockDesktopViewport(matches: boolean) {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation((query: string) => ({
      matches: query.includes('min-width') ? matches : false,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  })
}

function getDrawerBackdrop() {
  return document.querySelector('.MuiBackdrop-root') as HTMLElement
}

describe('MainLayout', () => {
  afterEach(() => {
    mockDesktopViewport(false)
  })

  it('renders header and sidebar', () => {
    mockDesktopViewport(true)
    render(<MainLayout />)
    expect(screen.getByRole('banner')).toBeInTheDocument()
    expect(screen.getByRole('navigation')).toBeInTheDocument()
  })

  it('toggles sidebar on hamburger click', async () => {
    mockDesktopViewport(false)
    const user = userEvent.setup()
    render(<MainLayout />)
    const toggleBtn = screen.getByRole('button', { name: /toggle sidebar/i })
    expect(getDrawerBackdrop()).not.toBeVisible()
    await user.click(toggleBtn)
    expect(getDrawerBackdrop()).toBeVisible()
  })

  it('closes sidebar when overlay is clicked', async () => {
    mockDesktopViewport(false)
    const user = userEvent.setup()
    render(<MainLayout />)
    const toggleBtn = screen.getByRole('button', { name: /toggle sidebar/i })
    await user.click(toggleBtn)
    const overlay = getDrawerBackdrop()
    await user.click(overlay)
    await waitFor(() => {
      expect(getDrawerBackdrop()).not.toBeVisible()
    })
  })
})
