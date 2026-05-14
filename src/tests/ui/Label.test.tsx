/// <reference types="vitest/globals" />

import { Label } from '@/components/ui/label'
import { render, screen } from '@/tests/test-utils'

describe('Label', () => {
  it('renders a label element', () => {
    render(<Label>Email</Label>)
    expect(screen.getByText('Email')).toBeInTheDocument()
  })

  it('associates with an input via htmlFor', () => {
    render(
      <>
        <Label htmlFor="email">Email</Label>
        <input id="email" />
      </>,
    )
    expect(screen.getByLabelText('Email')).toBeInTheDocument()
  })

  it('applies custom className', () => {
    render(<Label className="custom-class">Label</Label>)
    expect(screen.getByText('Label')).toHaveClass('custom-class')
  })

  it('forwards the ref', () => {
    const ref = { current: null as HTMLLabelElement | null }
    render(<Label ref={ref}>Label</Label>)
    expect(ref.current).toBeInstanceOf(HTMLLabelElement)
  })
})
