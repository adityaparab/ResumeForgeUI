import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'
import Sidebar from '@/components/layout/Sidebar'
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

describe('Sidebar', () => {
  afterEach(() => {
    mockDesktopViewport(false)
  })

  it('renders nav links', () => {
    mockDesktopViewport(true)
    render(<Sidebar isOpen={false} onClose={() => {}} />)
    expect(screen.getByRole('link', { name: /dashboard/i })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /analyze/i })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /resumes/i })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /settings/i })).toBeInTheDocument()
  })

  it('shows mobile overlay when isOpen=true', () => {
    mockDesktopViewport(false)
    render(<Sidebar isOpen={true} onClose={() => {}} />)
    expect(getDrawerBackdrop()).toBeVisible()
  })

  it('does not show mobile overlay when isOpen=false', () => {
    mockDesktopViewport(false)
    render(<Sidebar isOpen={false} onClose={() => {}} />)
    expect(getDrawerBackdrop()).not.toBeVisible()
  })

  it('calls onClose when overlay is clicked', async () => {
    mockDesktopViewport(false)
    const user = userEvent.setup()
    let closed = false
    render(
      <Sidebar
        isOpen={true}
        onClose={() => {
          closed = true
        }}
      />,
    )
    await user.click(getDrawerBackdrop())
    expect(closed).toBe(true)
  })
})
