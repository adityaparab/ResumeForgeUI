import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { store } from '@/app/store'
import Sidebar, { getUserInitials } from '@/components/layout/Sidebar'
import { logout, setCredentials } from '@/stores/authSlice'
import { render } from '@/tests/test-utils'

const mockUser = { id: 'user-1', email: 'john.doe@example.com' }

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

function renderSidebar(overrides?: { isOpen?: boolean; isCollapsed?: boolean }) {
  return render(
    <Sidebar
      isOpen={overrides?.isOpen ?? false}
      onClose={() => {}}
      isCollapsed={overrides?.isCollapsed ?? false}
      onToggleCollapse={() => {}}
    />,
  )
}

describe('getUserInitials', () => {
  it('returns two initials for name.surname format', () => {
    expect(getUserInitials('john.doe@example.com')).toBe('JD')
  })

  it('returns two initials for name_surname format', () => {
    expect(getUserInitials('jane_smith@test.com')).toBe('JS')
  })

  it('returns two initials for name-surname format', () => {
    expect(getUserInitials('alice-bob@test.com')).toBe('AB')
  })

  it('returns first two chars when no separator', () => {
    expect(getUserInitials('user@example.com')).toBe('US')
  })

  it('returns uppercase', () => {
    expect(getUserInitials('ab@c.com')).toBe('AB')
  })
})

describe('Sidebar', () => {
  afterEach(() => {
    mockDesktopViewport(false)
    store.dispatch(logout())
  })

  it('renders nav links (no Settings in nav)', () => {
    mockDesktopViewport(true)
    renderSidebar()
    expect(screen.getByRole('link', { name: /dashboard/i })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /analyze/i })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /resumes/i })).toBeInTheDocument()
    expect(screen.queryByRole('link', { name: /settings/i })).not.toBeInTheDocument()
  })

  it('shows mobile overlay when isOpen=true', () => {
    mockDesktopViewport(false)
    renderSidebar({ isOpen: true })
    expect(getDrawerBackdrop()).toBeVisible()
  })

  it('does not show mobile overlay when isOpen=false', () => {
    mockDesktopViewport(false)
    renderSidebar({ isOpen: false })
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
        isCollapsed={false}
        onToggleCollapse={() => {}}
      />,
    )
    await user.click(getDrawerBackdrop())
    expect(closed).toBe(true)
  })

  it('calls onToggleCollapse when collapse button is clicked on desktop', async () => {
    mockDesktopViewport(true)
    const user = userEvent.setup()
    let toggled = false
    render(
      <Sidebar
        isOpen={false}
        onClose={() => {}}
        isCollapsed={false}
        onToggleCollapse={() => {
          toggled = true
        }}
      />,
    )
    await user.click(screen.getByRole('button', { name: /collapse sidebar/i }))
    expect(toggled).toBe(true)
  })

  it('shows expand button when collapsed on desktop', () => {
    mockDesktopViewport(true)
    renderSidebar({ isCollapsed: true })
    expect(screen.getByRole('button', { name: /expand sidebar/i })).toBeInTheDocument()
  })

  it('shows settings icon button', () => {
    mockDesktopViewport(true)
    renderSidebar()
    expect(screen.getByRole('button', { name: /settings menu/i })).toBeInTheDocument()
  })

  it('opens settings menu on settings icon click', async () => {
    mockDesktopViewport(true)
    const user = userEvent.setup()
    renderSidebar()
    await user.click(screen.getByRole('button', { name: /settings menu/i }))
    expect(screen.getByRole('menuitem', { name: /profile/i })).toBeInTheDocument()
    expect(screen.getByRole('menuitem', { name: /sign out/i })).toBeInTheDocument()
  })

  it('closes settings menu when clicking outside', async () => {
    mockDesktopViewport(true)
    const user = userEvent.setup()
    renderSidebar()
    await user.click(screen.getByRole('button', { name: /settings menu/i }))
    expect(screen.getByRole('menuitem', { name: /profile/i })).toBeInTheDocument()
    await user.keyboard('{Escape}')
    await waitFor(() => {
      expect(screen.queryByRole('menuitem', { name: /profile/i })).not.toBeInTheDocument()
    })
  })

  it('navigates to /settings when Profile is clicked', async () => {
    mockDesktopViewport(true)
    const user = userEvent.setup()
    renderSidebar()
    await user.click(screen.getByRole('button', { name: /settings menu/i }))
    await user.click(screen.getByRole('menuitem', { name: /profile/i }))
    await waitFor(() => {
      expect(screen.queryByRole('menuitem', { name: /profile/i })).not.toBeInTheDocument()
    })
  })

  it('shows user letter avatar at bottom when logged in', () => {
    store.dispatch(setCredentials({ user: mockUser, accessToken: 'tok', refreshToken: 'ref' }))
    mockDesktopViewport(true)
    renderSidebar()
    expect(screen.getByText('JD')).toBeInTheDocument()
  })

  it('shows ? avatar when user is not logged in', () => {
    mockDesktopViewport(true)
    renderSidebar()
    expect(screen.getByText('?')).toBeInTheDocument()
  })
})
