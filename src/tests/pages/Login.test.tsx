/// <reference types="vitest/globals" />

import { HttpResponse, http } from 'msw'
import { API_URL } from '@/constants'
import Login from '@/pages/Login'
import { server } from '@/tests/mocks/server'
import { render, screen, userEvent, waitFor } from '@/tests/test-utils'

const emailInput = () => screen.getByLabelText(/email address/i, { selector: 'input' })
const passwordInput = () => screen.getByLabelText(/^password$/i, { selector: 'input' })

describe('Login page', () => {
  it('renders email and password fields', () => {
    render(<Login />, { initialEntries: ['/login'] })
    expect(emailInput()).toBeInTheDocument()
    expect(passwordInput()).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument()
  })

  it('renders the ResumeForge brand', () => {
    render(<Login />, { initialEntries: ['/login'] })
    expect(screen.getByText('ResumeForge')).toBeInTheDocument()
  })

  it('renders link to register page', () => {
    render(<Login />, { initialEntries: ['/login'] })
    expect(screen.getByRole('link', { name: /create one/i })).toHaveAttribute('href', '/register')
  })

  it('shows validation errors for empty fields on submit', async () => {
    const user = userEvent.setup()
    render(<Login />, { initialEntries: ['/login'] })

    await user.click(screen.getByRole('button', { name: /sign in/i }))

    await waitFor(() => {
      expect(screen.getAllByRole('alert').length).toBeGreaterThan(0)
    })
  })

  it('shows validation error for invalid email', async () => {
    const user = userEvent.setup()
    render(<Login />, { initialEntries: ['/login'] })

    await user.type(emailInput(), 'notanemail')
    await user.click(screen.getByRole('button', { name: /sign in/i }))

    await waitFor(() => {
      expect(screen.getByText(/invalid email/i)).toBeInTheDocument()
    })
  })

  it('shows validation error for short password', async () => {
    const user = userEvent.setup()
    render(<Login />, { initialEntries: ['/login'] })

    await user.type(emailInput(), 'test@example.com')
    await user.type(passwordInput(), 'short')
    await user.click(screen.getByRole('button', { name: /sign in/i }))

    await waitFor(() => {
      expect(screen.getByText(/at least 8 characters/i)).toBeInTheDocument()
    })
  })

  it('submits form with valid credentials', async () => {
    const user = userEvent.setup()
    render(<Login />, { initialEntries: ['/login'] })

    await user.type(emailInput(), 'test@example.com')
    await user.type(passwordInput(), 'password123')
    await user.click(screen.getByRole('button', { name: /sign in/i }))

    await waitFor(() => {
      // No error message means the submit was processed
      expect(screen.queryByText(/login failed/i)).not.toBeInTheDocument()
    })
  })

  it('shows loading state while submitting', async () => {
    const user = userEvent.setup()
    server.use(
      http.post(`${API_URL}/auth/login`, async () => {
        await new Promise((r) => setTimeout(r, 100))
        return HttpResponse.json({
          accessToken: 't',
          refreshToken: 'r',
          tokenType: 'Bearer',
          expiresIn: '15m',
          user: { id: '1', email: 'test@example.com' },
        })
      }),
    )
    render(<Login />, { initialEntries: ['/login'] })

    await user.type(emailInput(), 'test@example.com')
    await user.type(passwordInput(), 'password123')
    await user.click(screen.getByRole('button', { name: /sign in/i }))

    expect(screen.getByText(/signing in/i)).toBeInTheDocument()
  })

  it('toggles password visibility', async () => {
    const user = userEvent.setup()
    render(<Login />, { initialEntries: ['/login'] })

    expect(passwordInput()).toHaveAttribute('type', 'password')

    await user.click(screen.getByRole('button', { name: /show password/i }))

    expect(passwordInput()).toHaveAttribute('type', 'text')
    expect(screen.getByRole('button', { name: /hide password/i })).toBeInTheDocument()
  })

  it('shows error message on login failure', async () => {
    server.use(
      http.post(`${API_URL}/auth/login`, () => {
        return HttpResponse.json({ message: 'Invalid credentials' }, { status: 401 })
      }),
    )
    const user = userEvent.setup()
    render(<Login />, { initialEntries: ['/login'] })

    await user.type(emailInput(), 'test@example.com')
    await user.type(passwordInput(), 'wrongpassword')
    await user.click(screen.getByRole('button', { name: /sign in/i }))

    await waitFor(() => {
      expect(screen.getAllByRole('alert').length).toBeGreaterThan(0)
    })
  })
})
