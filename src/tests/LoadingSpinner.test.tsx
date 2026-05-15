/// <reference types="vitest/globals" />

import LoadingSpinner from '@/components/common/LoadingSpinner'
import { render, screen } from '@/tests/test-utils'

describe('LoadingSpinner', () => {
  it('renders with default props', () => {
    render(<LoadingSpinner />)
    const spinner = screen.getByRole('status')
    expect(spinner).toBeInTheDocument()
    expect(spinner).toHaveAttribute('aria-label', 'Loading')
  })

  it('renders with custom label', () => {
    render(<LoadingSpinner label="Fetching data..." />)
    expect(screen.getByText('Fetching data...')).toBeInTheDocument()
  })

  it('renders with custom size', () => {
    render(<LoadingSpinner size="lg" />)
    const spinner = screen.getByRole('status')
    expect(spinner).toBeInTheDocument()
  })
})
