import { screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { NotificationDropdown } from '@/features/common/components/NotificationDropdown'
import type { ActiveJob } from '@/stores/uiSlice'
import { render, userEvent } from '@/tests/test-utils'

const jobs = [
  {
    id: 'analysis-1',
    type: 'analysis',
    status: 'processing',
    label: 'Quarterly analysis',
    createdAt: '2024-01-04T12:00:00Z',
  },
  {
    id: 'analysis-2',
    type: 'analysis',
    status: 'completed',
    label: 'Finished analysis',
    createdAt: '2024-01-03T12:00:00Z',
    readAt: '2024-01-04T12:05:00Z',
  },
  {
    id: 'resume-1',
    type: 'resume-upload',
    status: 'pending',
    label: 'resume.pdf',
    createdAt: '2024-01-02T12:00:00Z',
  },
  {
    id: 'resume-2',
    type: 'resume-upload',
    status: 'failed',
    label: 'broken.pdf',
    createdAt: '2024-01-01T12:00:00Z',
  },
] satisfies ActiveJob[]

const readProcessingJob = {
  id: 'analysis-read',
  type: 'analysis',
  status: 'processing',
  label: 'Quarterly analysis',
  createdAt: '2024-01-04T12:00:00Z',
  readAt: '2024-01-04T12:05:00Z',
} satisfies ActiveJob

function renderDropdown(overrides?: Partial<Parameters<typeof NotificationDropdown>[0]>) {
  const props = {
    jobs,
    unreadCount: 3,
    ongoingCount: 2,
    completedCount: 2,
    onMarkAllRead: vi.fn(),
    onMarkAsRead: vi.fn(),
    onDismiss: vi.fn(),
    onClearCompleted: vi.fn(),
    onClose: vi.fn(),
    ...overrides,
  }

  render(<NotificationDropdown {...props} />)
  return props
}

describe('NotificationDropdown', () => {
  it('shows an empty state when there are no notifications', () => {
    renderDropdown({ jobs: [], unreadCount: 0, ongoingCount: 0, completedCount: 0 })

    expect(screen.getByRole('dialog', { name: /notifications/i })).toBeInTheDocument()
    expect(screen.getByText('No notifications')).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /mark all read/i })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /clear completed/i })).not.toBeInTheDocument()
  })

  it('renders job links and calls dropdown actions', async () => {
    const user = userEvent.setup()
    const props = renderDropdown()

    expect(screen.getByText('2 ongoing, 2 completed, 3 unread')).toBeInTheDocument()
    expect(screen.getByText('Processing')).toBeInTheDocument()
    expect(screen.getByText('Complete')).toBeInTheDocument()
    expect(screen.getByText('Pending')).toBeInTheDocument()
    expect(screen.getByText('Failed')).toBeInTheDocument()
    expect(screen.getByText('Quarterly analysis').closest('a')).toHaveAttribute(
      'href',
      '/analysis/stream/analysis-1',
    )
    expect(screen.getByText('Finished analysis').closest('a')).toHaveAttribute(
      'href',
      '/analysis/analysis-2',
    )
    expect(screen.getByText('resume.pdf').closest('a')).toHaveAttribute(
      'href',
      '/resume/stream/resume-1',
    )
    expect(screen.getByText('broken.pdf').closest('a')).toHaveAttribute('href', '/resume/resume-2')

    await user.click(screen.getByRole('button', { name: /mark all read/i }))
    expect(props.onMarkAllRead).toHaveBeenCalledTimes(1)

    await user.click(screen.getByRole('button', { name: /dismiss broken\.pdf/i }))
    expect(props.onDismiss).toHaveBeenCalledWith('resume-2')

    await user.click(screen.getByRole('button', { name: /clear completed/i }))
    expect(props.onClearCompleted).toHaveBeenCalledTimes(1)

    const analysisLink = screen.getByText('Quarterly analysis').closest('a')
    expect(analysisLink).not.toBeNull()
    await user.click(analysisLink as HTMLAnchorElement)
    expect(props.onMarkAsRead).toHaveBeenCalledWith('analysis-1')
    expect(props.onClose).toHaveBeenCalledTimes(1)
  })

  it('hides read and clear actions when all visible jobs are active and read', () => {
    renderDropdown({
      jobs: [readProcessingJob],
      unreadCount: 0,
      ongoingCount: 1,
      completedCount: 0,
    })

    expect(screen.queryByRole('button', { name: /mark all read/i })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /clear completed/i })).not.toBeInTheDocument()
    expect(screen.getByText('Quarterly analysis')).toBeInTheDocument()
  })
})
