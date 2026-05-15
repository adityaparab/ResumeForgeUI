import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it } from 'vitest'
import { store } from '@/app/store'
import Header from '@/components/layout/Header'
import { THEME_KEY } from '@/constants'
import { logout, setCredentials } from '@/stores/authSlice'
import { setTheme } from '@/stores/uiSlice'
import { render } from '@/tests/test-utils'

const mockUser = { id: 'user-1', email: 'user@example.com' }

describe('Header', () => {
  afterEach(() => {
    document.documentElement.classList.remove('dark')
    document.documentElement.removeAttribute('data-mui-color-scheme')
    document.documentElement.style.colorScheme = ''
    store.dispatch(setTheme('system'))
    localStorage.removeItem(THEME_KEY)
  })

  it('renders ResumeForge brand name', () => {
    render(<Header />)
    expect(screen.getByText('ResumeForge')).toBeInTheDocument()
  })

  it('shows user email when logged in', () => {
    store.dispatch(
      setCredentials({ user: mockUser, accessToken: 'token', refreshToken: 'refresh' }),
    )
    render(<Header />)
    expect(screen.getByText(mockUser.email)).toBeInTheDocument()
    store.dispatch(logout())
  })

  it('renders notifications button', () => {
    render(<Header />)
    expect(screen.getByRole('button', { name: /notifications/i })).toBeInTheDocument()
  })

  it('renders logout button', () => {
    render(<Header />)
    expect(screen.getByRole('button', { name: /sign out/i })).toBeInTheDocument()
  })

  it('calls onToggleSidebar when hamburger is clicked', async () => {
    const user = userEvent.setup()
    let clicked = false
    render(
      <Header
        onToggleSidebar={() => {
          clicked = true
        }}
      />,
    )
    await user.click(screen.getByRole('button', { name: /toggle sidebar/i }))
    expect(clicked).toBe(true)
  })

  it('triggers logout mutation on sign out button click', async () => {
    const user = userEvent.setup()
    store.dispatch(
      setCredentials({ user: mockUser, accessToken: 'token', refreshToken: 'refresh' }),
    )
    render(<Header />)
    await user.click(screen.getByRole('button', { name: /sign out/i }))
    // logout mutation fires, no error thrown
    store.dispatch(logout())
  })

  it('toggles theme when dark mode button is clicked', async () => {
    const user = userEvent.setup()
    store.dispatch(setTheme('light'))
    render(<Header />)
    expect(screen.getByRole('button', { name: /switch to dark mode/i })).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: /switch to dark mode/i }))
    await vi.waitFor(() => {
      expect(document.documentElement.dataset.muiColorScheme).toBe('dark')
    })
    expect(document.documentElement).not.toHaveClass('dark')
    expect(localStorage.getItem(THEME_KEY)).toBe('dark')

    await user.click(screen.getByRole('button', { name: /switch to light mode/i }))
    await vi.waitFor(() => {
      expect(screen.getByRole('button', { name: /switch to dark mode/i })).toBeInTheDocument()
      expect(document.documentElement.dataset.muiColorScheme).toBe('light')
    })
    expect(localStorage.getItem(THEME_KEY)).toBe('light')
  })
})
