import { screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import NotFound from '@/pages/NotFound'
import Settings from '@/pages/Settings'
import { render } from '@/tests/test-utils'

describe('NotFound', () => {
  it('renders 404 heading', () => {
    render(<NotFound />)
    expect(screen.getByText('404')).toBeInTheDocument()
  })

  it('renders Go Home link', () => {
    render(<NotFound />)
    expect(screen.getByRole('link', { name: /go home/i })).toBeInTheDocument()
  })
})

describe('Settings', () => {
  it('renders settings page', () => {
    render(<Settings />)
    expect(screen.getByText(/settings/i)).toBeInTheDocument()
  })
})
