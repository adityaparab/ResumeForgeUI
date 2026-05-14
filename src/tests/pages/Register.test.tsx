/// <reference types="vitest/globals" />

import { HttpResponse, http } from 'msw'
import { API_URL } from '@/constants'
import Register from '@/pages/Register'
import { server } from '@/tests/mocks/server'
import { render, screen, userEvent, waitFor } from '@/tests/test-utils'

describe('Register page', () => {
  it('renders email, password, and confirm password fields', () => {
    render(<Register />, { initialEntries: ['/register'] })
    expect(screen.getByLabelText(/email address/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/^password$/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/confirm password/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /create account/i })).toBeInTheDocument()
  })

  it('renders the ResumeForge brand', () => {
    render(<Register />, { initialEntries: ['/register'] })
    expect(screen.getByText('ResumeForge')).toBeInTheDocument()
  })

  it('renders link to login page', () => {
    render(<Register />, { initialEntries: ['/register'] })
    expect(screen.getByRole('link', { name: /sign in/i })).toHaveAttribute('href', '/login')
  })

  it('shows validation error for empty fields on submit', async () => {
    const user = userEvent.setup()
    render(<Register />, { initialEntries: ['/register'] })

    await user.click(screen.getByRole('button', { name: /create account/i }))

    await waitFor(() => {
      expect(screen.getAllByRole('alert').length).toBeGreaterThan(0)
    })
  })

  it('shows validation error for invalid email', async () => {
    const user = userEvent.setup()
    render(<Register />, { initialEntries: ['/register'] })

    await user.type(screen.getByLabelText(/email address/i), 'notanemail')
    await user.click(screen.getByRole('button', { name: /create account/i }))

    await waitFor(() => {
      expect(screen.getByText(/invalid email/i)).toBeInTheDocument()
    })
  })

  it('shows error when passwords do not match', async () => {
    const user = userEvent.setup()
    render(<Register />, { initialEntries: ['/register'] })

    await user.type(screen.getByLabelText(/email address/i), 'test@example.com')
    await user.type(screen.getByLabelText(/^password$/i), 'password123')
    await user.type(screen.getByLabelText(/confirm password/i), 'different123')
    await user.click(screen.getByRole('button', { name: /create account/i }))

    await waitFor(() => {
      expect(screen.getByText(/passwords don't match/i)).toBeInTheDocument()
    })
  })

  it('shows validation error for short password', async () => {
    const user = userEvent.setup()
    render(<Register />, { initialEntries: ['/register'] })

    await user.type(screen.getByLabelText(/email address/i), 'test@example.com')
    await user.type(screen.getByLabelText(/^password$/i), 'short')
    await user.type(screen.getByLabelText(/confirm password/i), 'short')
    await user.click(screen.getByRole('button', { name: /create account/i }))

    await waitFor(() => {
      expect(screen.getByText(/at least 8 characters/i)).toBeInTheDocument()
    })
  })

  it('submits form with valid data', async () => {
    const user = userEvent.setup()
    render(<Register />, { initialEntries: ['/register'] })

    await user.type(screen.getByLabelText(/email address/i), 'new@example.com')
    await user.type(screen.getByLabelText(/^password$/i), 'password123')
    await user.type(screen.getByLabelText(/confirm password/i), 'password123')
    await user.click(screen.getByRole('button', { name: /create account/i }))

    await waitFor(() => {
      expect(screen.queryByText(/registration failed/i)).not.toBeInTheDocument()
    })
  })

  it('shows loading state while submitting', async () => {
    const user = userEvent.setup()
    server.use(
      http.post(`${API_URL}/auth/register`, async () => {
        await new Promise((r) => setTimeout(r, 100))
        return HttpResponse.json(
          {
            accessToken: 't',
            refreshToken: 'r',
            tokenType: 'Bearer',
            expiresIn: '15m',
            user: { id: '1', email: 'new@example.com' },
          },
          { status: 201 },
        )
      }),
    )
    render(<Register />, { initialEntries: ['/register'] })

    await user.type(screen.getByLabelText(/email address/i), 'new@example.com')
    await user.type(screen.getByLabelText(/^password$/i), 'password123')
    await user.type(screen.getByLabelText(/confirm password/i), 'password123')
    await user.click(screen.getByRole('button', { name: /create account/i }))

    expect(screen.getByText(/creating account/i)).toBeInTheDocument()
  })

  it('shows error message on registration failure', async () => {
    server.use(
      http.post(`${API_URL}/auth/register`, () => {
        return HttpResponse.json({ message: 'Email already exists' }, { status: 409 })
      }),
    )
    const user = userEvent.setup()
    render(<Register />, { initialEntries: ['/register'] })

    await user.type(screen.getByLabelText(/email address/i), 'existing@example.com')
    await user.type(screen.getByLabelText(/^password$/i), 'password123')
    await user.type(screen.getByLabelText(/confirm password/i), 'password123')
    await user.click(screen.getByRole('button', { name: /create account/i }))

    await waitFor(() => {
      expect(screen.getAllByRole('alert').length).toBeGreaterThan(0)
    })
  })
})
