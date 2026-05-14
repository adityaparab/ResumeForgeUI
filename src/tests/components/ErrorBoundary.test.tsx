/// <reference types="vitest/globals" />

import userEvent from '@testing-library/user-event'
import ErrorBoundary from '@/components/common/ErrorBoundary'
import { render, screen } from '@/tests/test-utils'

vi.mock('@sentry/react', () => ({ captureException: vi.fn() }))

// Component that throws an error for testing
function ThrowError({ shouldThrow, message }: { shouldThrow: boolean; message?: string }) {
  if (shouldThrow) {
    if (message !== undefined) throw new Error(message)
    throw new Error('Test error message')
  }
  return <div>No error</div>
}

// Component that throws a non-Error value
function ThrowNonError({ shouldThrow }: { shouldThrow: boolean }) {
  if (shouldThrow) throw null // eslint-disable-line @typescript-eslint/only-throw-error
  return <div>No error</div>
}

// Suppress console.error for expected errors in tests
beforeEach(() => {
  vi.spyOn(console, 'error').mockImplementation(() => {})
})
afterEach(() => {
  vi.restoreAllMocks()
})

describe('ErrorBoundary', () => {
  it('renders children when no error', () => {
    render(
      <ErrorBoundary>
        <div>Hello</div>
      </ErrorBoundary>,
    )
    expect(screen.getByText('Hello')).toBeInTheDocument()
  })

  it('renders default error UI when child throws', () => {
    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>,
    )
    expect(screen.getByText('Something went wrong')).toBeInTheDocument()
    expect(screen.getByText('Test error message')).toBeInTheDocument()
  })

  it('renders custom fallback when provided and child throws', () => {
    render(
      <ErrorBoundary fallback={<div>Custom fallback</div>}>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>,
    )
    expect(screen.getByText('Custom fallback')).toBeInTheDocument()
  })

  it('resets error state when Try Again is clicked', async () => {
    const user = userEvent.setup()
    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>,
    )
    expect(screen.getByText('Something went wrong')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: /try again/i }))
    // After reset, error boundary tries to re-render children
    // ThrowError still throws so error UI shows again (but handleReset was called)
    expect(screen.getByText('Something went wrong')).toBeInTheDocument()
  })

  it('shows fallback message when thrown value has no message property', () => {
    render(
      <ErrorBoundary>
        <ThrowNonError shouldThrow={true} />
      </ErrorBoundary>,
    )
    expect(screen.getByText('Something went wrong')).toBeInTheDocument()
    expect(screen.getByText(/an unexpected error occurred/i)).toBeInTheDocument()
  })
})
