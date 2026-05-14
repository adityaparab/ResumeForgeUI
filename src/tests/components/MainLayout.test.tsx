import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import MainLayout from '@/components/layout/MainLayout'
import { render } from '@/tests/test-utils'

describe('MainLayout', () => {
  it('renders header and sidebar', () => {
    render(<MainLayout />)
    expect(screen.getByRole('banner')).toBeInTheDocument()
    expect(screen.getByRole('navigation')).toBeInTheDocument()
  })

  it('toggles sidebar on hamburger click', async () => {
    const user = userEvent.setup()
    render(<MainLayout />)
    const toggleBtn = screen.getByRole('button', { name: /toggle sidebar/i })
    // Before click, overlay not shown
    expect(document.querySelector('.bg-black\\/50')).not.toBeInTheDocument()
    await user.click(toggleBtn)
    // After click, overlay shown
    expect(document.querySelector('.bg-black\\/50')).toBeInTheDocument()
  })

  it('closes sidebar when overlay is clicked', async () => {
    const user = userEvent.setup()
    render(<MainLayout />)
    const toggleBtn = screen.getByRole('button', { name: /toggle sidebar/i })
    await user.click(toggleBtn)
    const overlay = document.querySelector('.bg-black\\/50')
    expect(overlay).toBeInTheDocument()
    await user.click(overlay!)
    expect(document.querySelector('.bg-black\\/50')).not.toBeInTheDocument()
  })
})
