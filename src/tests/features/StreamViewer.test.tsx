import { act, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { StreamViewer } from '@/features/common/components/StreamViewer'
import type { StreamStatus } from '@/features/common/hooks/useStreamJob'

const defaultProps = {
  title: 'Test Stream',
  status: 'idle' as StreamStatus,
  fullText: '',
  error: null,
}

describe('StreamViewer', () => {
  it('renders the title', () => {
    render(<StreamViewer {...defaultProps} />)
    expect(screen.getByText('Test Stream')).toBeInTheDocument()
  })

  it('renders subtitle when provided', () => {
    render(<StreamViewer {...defaultProps} subtitle="subtitle text" />)
    expect(screen.getByText('subtitle text')).toBeInTheDocument()
  })

  it('shows idle status label', () => {
    render(<StreamViewer {...defaultProps} status="idle" />)
    expect(screen.getByText('Waiting…')).toBeInTheDocument()
  })

  it('shows connecting status label', () => {
    render(<StreamViewer {...defaultProps} status="connecting" />)
    expect(screen.getByText('Connecting…')).toBeInTheDocument()
  })

  it('shows streaming status label', () => {
    render(<StreamViewer {...defaultProps} status="streaming" />)
    expect(screen.getByText('Processing…')).toBeInTheDocument()
  })

  it('shows done status label', () => {
    render(<StreamViewer {...defaultProps} status="done" />)
    expect(screen.getByText('Complete')).toBeInTheDocument()
  })

  it('shows failed status label', () => {
    render(<StreamViewer {...defaultProps} status="failed" />)
    expect(screen.getByText('Failed')).toBeInTheDocument()
  })

  it('renders fullText in output', () => {
    render(<StreamViewer {...defaultProps} fullText="Hello world output" />)
    expect(screen.getByText('Hello world output')).toBeInTheDocument()
    expect(screen.getByLabelText('Stream output')).toBeInTheDocument()
  })

  it('keeps stream output exposed as a polite live log', () => {
    render(<StreamViewer {...defaultProps} fullText="Hello world output" />)
    const output = screen.getByRole('log', { name: /stream output/i })
    expect(output).toHaveAttribute('aria-live', 'polite')
  })

  it('shows progress and status text while connecting', () => {
    render(<StreamViewer {...defaultProps} status="connecting" />)
    expect(screen.getByRole('progressbar', { name: /connecting.*progress/i })).toBeInTheDocument()
    expect(screen.getByRole('status')).toHaveTextContent(/connecting to the live job stream/i)
  })

  it('shows waiting message when no text and not failed', () => {
    render(<StreamViewer {...defaultProps} status="connecting" fullText="" />)
    expect(screen.getByText(/waiting for output/i)).toBeInTheDocument()
  })

  it('shows error alert when status is failed with error', () => {
    render(<StreamViewer {...defaultProps} status="failed" error="Something went wrong" />)
    expect(screen.getByRole('alert')).toHaveTextContent('Something went wrong')
  })

  it('calls onDone when status changes to done', async () => {
    const onDone = vi.fn()
    const { rerender } = render(
      <StreamViewer {...defaultProps} status="streaming" onDone={onDone} />,
    )
    await act(async () => {
      rerender(<StreamViewer {...defaultProps} status="done" onDone={onDone} />)
    })
    expect(onDone).toHaveBeenCalledTimes(1)
  })

  it('auto-scrolls when streaming text changes', async () => {
    const { rerender } = render(
      <StreamViewer {...defaultProps} status="streaming" fullText="one" />,
    )
    const output = screen.getByLabelText('Stream output')
    Object.defineProperty(output, 'scrollHeight', { configurable: true, value: 120 })
    await act(async () => {
      rerender(<StreamViewer {...defaultProps} status="streaming" fullText="one\ntwo" />)
    })
    expect(output.scrollTop).toBe(120)
  })
})
