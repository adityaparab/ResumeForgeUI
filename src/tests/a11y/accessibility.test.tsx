/// <reference types="vitest/globals" />

import { axe } from 'vitest-axe'
import ErrorBoundary from '@/components/common/ErrorBoundary'
import LoadingSpinner from '@/components/common/LoadingSpinner'
import Dashboard from '@/pages/Dashboard'
import Login from '@/pages/Login'
import NotFound from '@/pages/NotFound'
import Register from '@/pages/Register'
import Settings from '@/pages/Settings'
import { render, screen } from '@/tests/test-utils'

vi.mock('@sentry/react', () => ({ captureException: vi.fn() }))

async function expectNoA11yViolations(container: Element) {
  const results = await axe(container)
  expect(
    results.violations,
    `Expected no axe violations but found:\n${results.violations.map((v) => `[${v.id}] ${v.description}`).join('\n')}`,
  ).toHaveLength(0)
}

describe('Accessibility', () => {
  describe('Login page', () => {
    it('has no axe violations', async () => {
      const { container } = render(<Login />)
      await expectNoA11yViolations(container)
    })
  })

  describe('Register page', () => {
    it('has no axe violations', async () => {
      const { container } = render(<Register />)
      await expectNoA11yViolations(container)
    })
  })

  describe('NotFound page', () => {
    it('has no axe violations', async () => {
      const { container } = render(<NotFound />)
      await expectNoA11yViolations(container)
    })
  })

  describe('Dashboard page', () => {
    it('has no axe violations after stats load', async () => {
      const { container } = render(<Dashboard />)
      await screen.findByText('Workspace Activity')
      await expectNoA11yViolations(container)
    })
  })

  describe('Settings page', () => {
    it('has no axe violations', async () => {
      const { container } = render(<Settings />)
      await expectNoA11yViolations(container)
    })
  })

  describe('LoadingSpinner', () => {
    it('has no axe violations', async () => {
      const { container } = render(<LoadingSpinner />)
      await expectNoA11yViolations(container)
    })
  })

  describe('ErrorBoundary', () => {
    it('has no axe violations in normal state', async () => {
      const { container } = render(
        <ErrorBoundary>
          <p>Content</p>
        </ErrorBoundary>,
      )
      await expectNoA11yViolations(container)
    })
  })
})
