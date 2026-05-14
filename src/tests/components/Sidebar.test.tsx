import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import Sidebar from '@/components/layout/Sidebar'
import { render } from '@/tests/test-utils'

describe('Sidebar', () => {
  it('renders nav links', () => {
    render(<Sidebar isOpen={false} onClose={() => {}} />)
    expect(screen.getByRole('link', { name: /dashboard/i })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /analyze/i })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /resumes/i })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /settings/i })).toBeInTheDocument()
  })

  it('shows mobile overlay when isOpen=true', () => {
    render(<Sidebar isOpen={true} onClose={() => {}} />)
    expect(document.querySelector('[aria-hidden="true"]')).toBeInTheDocument()
  })

  it('does not show mobile overlay when isOpen=false', () => {
    render(<Sidebar isOpen={false} onClose={() => {}} />)
    // Overlay is a fixed div with bg-black/50, not present when isOpen=false
    expect(document.querySelector('.bg-black\\/50')).not.toBeInTheDocument()
  })

  it('calls onClose when overlay is clicked', async () => {
    const user = userEvent.setup()
    let closed = false
    render(
      <Sidebar
        isOpen={true}
        onClose={() => {
          closed = true
        }}
      />,
    )
    const overlay = document.querySelector('[aria-hidden="true"]') as HTMLElement
    await user.click(overlay)
    expect(closed).toBe(true)
  })
})
