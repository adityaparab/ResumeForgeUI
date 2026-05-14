import { HttpResponse, http } from 'msw'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { store } from '@/app/store'
import { API_URL } from '@/constants'
import { NotificationBell } from '@/features/common/components/NotificationBell'
import { type ActiveJob, addActiveJob, removeActiveJob, selectActiveJobs } from '@/stores/uiSlice'
import { server } from '@/tests/mocks/server'
import { fireEvent, render, screen, userEvent, waitFor } from '@/tests/test-utils'

const completedJob = {
  id: 'completed-analysis',
  type: 'analysis',
  status: 'completed',
  label: 'Completed analysis',
  createdAt: '2024-01-04T12:00:00Z',
} satisfies ActiveJob

function clearJobs() {
  selectActiveJobs(store.getState()).forEach((job) => {
    store.dispatch(removeActiveJob(job.id))
  })
}

beforeEach(() => {
  clearJobs()
})

afterEach(() => {
  clearJobs()
})

describe('NotificationBell', () => {
  it('opens an empty dropdown and closes from Escape or outside click', async () => {
    const user = userEvent.setup()
    render(<NotificationBell />)

    const button = screen.getByRole('button', { name: /notifications/i })
    expect(button).toHaveAttribute('aria-expanded', 'false')

    await user.click(button)
    expect(button).toHaveAttribute('aria-expanded', 'true')
    expect(screen.getByRole('dialog', { name: /notifications/i })).toBeInTheDocument()

    fireEvent.keyDown(document, { key: 'Escape' })
    await waitFor(() => {
      expect(screen.queryByRole('dialog', { name: /notifications/i })).not.toBeInTheDocument()
    })

    await user.click(button)
    expect(screen.getByRole('dialog', { name: /notifications/i })).toBeInTheDocument()
    fireEvent.keyDown(document, { key: 'Tab' })
    expect(screen.getByRole('dialog', { name: /notifications/i })).toBeInTheDocument()
    fireEvent.keyDown(document, { key: 'Escape' })
    await waitFor(() => {
      expect(screen.queryByRole('dialog', { name: /notifications/i })).not.toBeInTheDocument()
    })

    await user.click(button)
    expect(screen.getByRole('dialog', { name: /notifications/i })).toBeInTheDocument()
    fireEvent.pointerDown(document.body)
    await waitFor(() => {
      expect(screen.queryByRole('dialog', { name: /notifications/i })).not.toBeInTheDocument()
    })
  })

  it('sorts notifications newest first', async () => {
    const user = userEvent.setup()
    store.dispatch(
      addActiveJob({
        ...completedJob,
        id: 'old-analysis',
        label: 'Old analysis',
        createdAt: '2024-01-01T12:00:00Z',
      }),
    )
    store.dispatch(
      addActiveJob({
        ...completedJob,
        id: 'new-analysis',
        label: 'New analysis',
        createdAt: '2024-01-05T12:00:00Z',
      }),
    )

    render(<NotificationBell />)
    await user.click(screen.getByRole('button', { name: /notifications/i }))

    const links = screen.getAllByRole('link')
    expect(links[0]).toHaveTextContent('New analysis')
    expect(links[1]).toHaveTextContent('Old analysis')
  })

  it('shows unread count, marks all read, and dismisses a notification', async () => {
    const user = userEvent.setup()
    store.dispatch(addActiveJob(completedJob))

    render(<NotificationBell />)
    expect(screen.getByText('1')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: /notifications/i }))
    await user.click(screen.getByRole('button', { name: /mark all read/i }))

    await waitFor(() => {
      expect(screen.queryByText('1')).not.toBeInTheDocument()
      expect(screen.getByText('0 ongoing, 1 completed, 0 unread')).toBeInTheDocument()
    })

    await user.click(screen.getByRole('button', { name: /dismiss completed analysis/i }))
    expect(screen.getByText('No notifications')).toBeInTheDocument()
  })

  it('marks a clicked notification read and closes the dropdown', async () => {
    const user = userEvent.setup()
    store.dispatch(addActiveJob(completedJob))

    render(<NotificationBell />)
    await user.click(screen.getByRole('button', { name: /notifications/i }))
    await user.click(screen.getByText('Completed analysis'))

    await waitFor(() => {
      expect(screen.queryByRole('dialog', { name: /notifications/i })).not.toBeInTheDocument()
      expect(screen.queryByText('1')).not.toBeInTheDocument()
    })
  })

  it('clears completed notifications from the dropdown footer', async () => {
    const user = userEvent.setup()
    store.dispatch(addActiveJob(completedJob))

    render(<NotificationBell />)
    await user.click(screen.getByRole('button', { name: /notifications/i }))
    await user.click(screen.getByRole('button', { name: /clear completed/i }))

    expect(screen.getByText('No notifications')).toBeInTheDocument()
  })

  it('polls resume jobs into completed notifications with persistent toasts', async () => {
    const user = userEvent.setup()
    store.dispatch(
      addActiveJob({
        id: 'resume-processing',
        type: 'resume-upload',
        status: 'processing',
        label: 'resume-processing.pdf',
        createdAt: '2024-01-04T12:00:00Z',
      }),
    )

    render(<NotificationBell />)
    await user.click(screen.getByRole('button', { name: /notifications/i }))

    await waitFor(() => {
      expect(screen.getByText('Complete')).toBeInTheDocument()
      expect(screen.getByText('Resume extraction complete.')).toBeInTheDocument()
    })
  })

  it('polls queued resume jobs back into pending notifications', async () => {
    const user = userEvent.setup()
    server.use(
      http.get(`${API_URL}/resume/status/:id`, () =>
        HttpResponse.json({
          id: 'resume-queued',
          jobId: 'resume-queued-job',
          status: 'queued',
          originalName: 'queued.pdf',
        }),
      ),
    )
    store.dispatch(
      addActiveJob({
        id: 'resume-queued',
        type: 'resume-upload',
        status: 'processing',
        label: 'queued.pdf',
        createdAt: '2024-01-04T12:00:00Z',
      }),
    )

    render(<NotificationBell />)
    await user.click(screen.getByRole('button', { name: /notifications/i }))

    await waitFor(() => {
      expect(screen.getByText('Pending')).toBeInTheDocument()
      expect(screen.queryByText('Resume extraction complete.')).not.toBeInTheDocument()
    })
  })

  it('polls analysis jobs into failed notifications with persistent toasts', async () => {
    const user = userEvent.setup()
    server.use(
      http.get(`${API_URL}/analysis/status/:id`, () =>
        HttpResponse.json({
          id: 'analysis-failed',
          resumeId: 'resume-1',
          jobId: 'analysis-failed-job',
          status: 'failed',
        }),
      ),
    )
    store.dispatch(
      addActiveJob({
        id: 'analysis-failed',
        type: 'analysis',
        status: 'processing',
        label: 'Analysis for resume-1',
        createdAt: '2024-01-04T12:00:00Z',
      }),
    )

    render(<NotificationBell />)
    await user.click(screen.getByRole('button', { name: /notifications/i }))

    await waitFor(() => {
      expect(screen.getByText('Failed')).toBeInTheDocument()
      expect(screen.getByText('Analysis failed.')).toBeInTheDocument()
    })
  })
})
