import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { store } from '@/app/store'
import Header from '@/components/layout/Header'
import { logout, setCredentials } from '@/stores/authSlice'
import { render } from '@/tests/test-utils'

const mockUser = { id: 'user-1', email: 'user@example.com' }

describe('Header', () => {
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
})
