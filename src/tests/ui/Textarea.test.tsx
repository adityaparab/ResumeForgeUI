/// <reference types="vitest/globals" />

import { Textarea } from '@/components/ui/textarea'
import { render, screen } from '@/tests/test-utils'

describe('Textarea', () => {
  it('renders a textarea element', () => {
    render(<Textarea />)
    expect(screen.getByRole('textbox')).toBeInstanceOf(HTMLTextAreaElement)
  })

  it('forwards the ref', () => {
    const ref = { current: null as HTMLTextAreaElement | null }
    render(<Textarea ref={ref} />)
    expect(ref.current).toBeInstanceOf(HTMLTextAreaElement)
  })

  it('applies custom className', () => {
    render(<Textarea className="custom-class" />)
    expect(screen.getByRole('textbox')).toHaveClass('custom-class')
  })

  it('renders as disabled', () => {
    render(<Textarea disabled />)
    expect(screen.getByRole('textbox')).toBeDisabled()
  })

  it('renders with placeholder', () => {
    render(<Textarea placeholder="Enter description" />)
    expect(screen.getByPlaceholderText('Enter description')).toBeInTheDocument()
  })

  it('renders with aria-invalid attribute', () => {
    render(<Textarea aria-invalid="true" />)
    expect(screen.getByRole('textbox')).toHaveAttribute('aria-invalid', 'true')
  })
})
