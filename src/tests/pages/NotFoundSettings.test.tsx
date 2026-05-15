import { screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import NotFound from '@/pages/NotFound'
import Settings from '@/pages/Settings'
import { render, userEvent } from '@/tests/test-utils'

describe('NotFound', () => {
  it('renders 404 heading', () => {
    render(<NotFound />)
    expect(screen.getByText('404')).toBeInTheDocument()
  })

  it('renders Go Home link', () => {
    render(<NotFound />)
    expect(screen.getByRole('link', { name: /go home/i })).toBeInTheDocument()
  })

  it('renders Sign In link', () => {
    render(<NotFound />)
    expect(screen.getByRole('link', { name: /sign in/i })).toBeInTheDocument()
  })
})

describe('Settings', () => {
  it('renders settings page', () => {
    render(<Settings />)
    expect(screen.getByRole('heading', { name: /settings/i })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: /profile/i })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: /theme preference/i })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: /notifications/i })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: /api and account/i })).toBeInTheDocument()
  })

  it('allows theme preference changes', async () => {
    const user = userEvent.setup()
    render(<Settings />)

    await user.click(screen.getByRole('radio', { name: /dark/i }))

    expect(screen.getByRole('radio', { name: /dark/i })).toBeChecked()
  })
})
