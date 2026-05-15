import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it } from 'vitest'
import { store } from '@/app/store'
import Header from '@/components/layout/Header'
import { THEME_KEY } from '@/constants'
import { setTheme } from '@/stores/uiSlice'
import { render } from '@/tests/test-utils'

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

  it('does not show user email in the header', () => {
    render(<Header />)
    expect(screen.queryByText(/@/)).not.toBeInTheDocument()
  })

  it('renders notifications button', () => {
    render(<Header />)
    expect(screen.getByRole('button', { name: /notifications/i })).toBeInTheDocument()
  })

  it('does not render a sign-out button in the header', () => {
    render(<Header />)
    expect(screen.queryByRole('button', { name: /sign out/i })).not.toBeInTheDocument()
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

  it('renders GitHub repositories button', () => {
    render(<Header />)
    expect(screen.getByRole('button', { name: /github repositories/i })).toBeInTheDocument()
  })

  it('opens GitHub menu with UI and Server options', async () => {
    const user = userEvent.setup()
    render(<Header />)
    await user.click(screen.getByRole('button', { name: /github repositories/i }))
    expect(screen.getByRole('menuitem', { name: /^ui$/i })).toBeInTheDocument()
    expect(screen.getByRole('menuitem', { name: /^server$/i })).toBeInTheDocument()
  })

  it('closes GitHub menu when an item is clicked', async () => {
    const user = userEvent.setup()
    render(<Header />)
    await user.click(screen.getByRole('button', { name: /github repositories/i }))
    await user.click(screen.getByRole('menuitem', { name: /^server$/i }))
    await waitFor(() => {
      expect(screen.queryByRole('menuitem', { name: /^server$/i })).not.toBeInTheDocument()
    })
  })

  it('UI GitHub link points to the correct repo', async () => {
    const user = userEvent.setup()
    render(<Header />)
    await user.click(screen.getByRole('button', { name: /github repositories/i }))
    const uiLink = screen.getByRole('menuitem', { name: /^ui$/i })
    expect(uiLink).toHaveAttribute('href', 'https://github.com/adityaparab/ResumeForgeUI')
    expect(uiLink).toHaveAttribute('target', '_blank')
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
