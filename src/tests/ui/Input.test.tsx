/// <reference types="vitest/globals" />

import { Input } from '@/components/ui/input'
import { render, screen } from '@/tests/test-utils'

describe('Input', () => {
  it('renders an input element', () => {
    render(<Input />)
    expect(screen.getByRole('textbox')).toBeInTheDocument()
  })

  it('forwards the ref', () => {
    const ref = { current: null as HTMLInputElement | null }
    render(<Input ref={ref} />)
    expect(ref.current).toBeInstanceOf(HTMLInputElement)
  })

  it('applies custom className', () => {
    render(<Input className="custom-class" />)
    expect(screen.getByRole('textbox')).toHaveClass('custom-class')
  })

  it('renders with type password', () => {
    render(<Input type="password" data-testid="pw" />)
    expect(document.querySelector('input[type="password"]')).toBeInTheDocument()
  })

  it('renders as disabled', () => {
    render(<Input disabled />)
    expect(screen.getByRole('textbox')).toBeDisabled()
  })

  it('renders with placeholder', () => {
    render(<Input placeholder="Enter value" />)
    expect(screen.getByPlaceholderText('Enter value')).toBeInTheDocument()
  })

  it('renders with aria-invalid attribute', () => {
    render(<Input aria-invalid="true" />)
    expect(screen.getByRole('textbox')).toHaveAttribute('aria-invalid', 'true')
  })
})
