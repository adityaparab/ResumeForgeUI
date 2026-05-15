/// <reference types="vitest/globals" />

import { Badge } from '@/components/ui/badge'
import { render, screen } from '@/tests/test-utils'

describe('Badge', () => {
  it('renders children', () => {
    render(<Badge>Active</Badge>)
    expect(screen.getByText('Active')).toBeInTheDocument()
  })

  it('applies custom className', () => {
    render(<Badge className="custom-class">tag</Badge>)
    expect(screen.getByText('tag').closest('.custom-class')).toBeInTheDocument()
  })

  it.each([
    ['default'],
    ['secondary'],
    ['outline'],
    ['success'],
    ['warning'],
    ['destructive'],
  ] as const)('renders %s variant', (variant) => {
    render(<Badge variant={variant}>{variant}</Badge>)
    expect(screen.getByText(variant)).toBeInTheDocument()
  })
})
