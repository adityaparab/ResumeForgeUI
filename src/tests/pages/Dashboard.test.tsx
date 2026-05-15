import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { HttpResponse, http } from 'msw'
import { describe, expect, it } from 'vitest'
import { API_URL } from '@/constants'
import Dashboard from '@/pages/Dashboard'
import { server } from '../mocks/server'
import { render } from '../test-utils'

describe('Dashboard', () => {
  it('renders page heading', () => {
    render(<Dashboard />, { initialEntries: ['/'] })
    expect(screen.getByText('Dashboard')).toBeInTheDocument()
  })

  it('shows skeletons while loading', () => {
    render(<Dashboard />, { initialEntries: ['/'] })
    expect(screen.getAllByLabelText(/loading dashboard metric/i)).toHaveLength(3)
  })

  it('shows stats cards after data loads', async () => {
    server.use(
      http.get(`${API_URL}/resume`, () =>
        HttpResponse.json({ data: [], total: 3, page: 1, limit: 1 }),
      ),
      http.get(`${API_URL}/analysis`, () =>
        HttpResponse.json({ data: [], total: 7, page: 1, limit: 1 }),
      ),
    )

    render(<Dashboard />, { initialEntries: ['/'] })

    await waitFor(() => {
      expect(screen.getByText('Total Resumes')).toBeInTheDocument()
    })

    expect(screen.getByText('3')).toBeInTheDocument()
    expect(screen.getByText('Total Analyses')).toBeInTheDocument()
    expect(screen.getByText('7')).toBeInTheDocument()
    expect(screen.getByText('Workspace Activity')).toBeInTheDocument()
    expect(screen.getByText('10')).toBeInTheDocument()
  })

  it('shows error alert on failure', async () => {
    server.use(
      http.get(`${API_URL}/resume`, () => new HttpResponse(null, { status: 500 })),
      http.get(`${API_URL}/analysis`, () => new HttpResponse(null, { status: 500 })),
    )

    render(<Dashboard />, { initialEntries: ['/'] })

    await waitFor(
      () => {
        expect(screen.getByRole('alert')).toBeInTheDocument()
      },
      { timeout: 5000 },
    )
  })

  it('shows retry button on failure', async () => {
    server.use(
      http.get(`${API_URL}/resume`, () => new HttpResponse(null, { status: 500 })),
      http.get(`${API_URL}/analysis`, () => new HttpResponse(null, { status: 500 })),
    )

    render(<Dashboard />, { initialEntries: ['/'] })

    await waitFor(
      () => {
        expect(screen.getByRole('button', { name: /retry/i })).toBeInTheDocument()
      },
      { timeout: 5000 },
    )
  })

  it('shows quick action links', async () => {
    render(<Dashboard />, { initialEntries: ['/'] })

    await waitFor(() => {
      expect(screen.getAllByText('Upload Resume').length).toBeGreaterThanOrEqual(1)
      expect(screen.getAllByText('Analyze Resume').length).toBeGreaterThanOrEqual(1)
    })
  })

  it('shows derived workflow status', async () => {
    server.use(
      http.get(`${API_URL}/resume`, () =>
        HttpResponse.json({ data: [], total: 4, page: 1, limit: 1 }),
      ),
      http.get(`${API_URL}/analysis`, () =>
        HttpResponse.json({ data: [], total: 2, page: 1, limit: 1 }),
      ),
    )

    render(<Dashboard />, { initialEntries: ['/'] })

    await waitFor(() => {
      expect(screen.getByRole('region', { name: /workflow status/i })).toBeInTheDocument()
    })

    await waitFor(() => {
      expect(screen.getByText('50%')).toBeInTheDocument()
    })

    expect(screen.getByLabelText(/analysis coverage/i)).toHaveAttribute('aria-valuenow', '50')
  })

  it('does not render embedded upload or analysis workflow sections', async () => {
    render(<Dashboard />, { initialEntries: ['/'] })

    await waitFor(() => {
      expect(screen.getByRole('region', { name: /quick actions/i })).toBeInTheDocument()
    })

    expect(screen.queryByRole('region', { name: /upload a new resume/i })).not.toBeInTheDocument()
    expect(screen.queryByRole('region', { name: /start a new analysis/i })).not.toBeInTheDocument()
  })

  it('retry button is clickable', async () => {
    const user = userEvent.setup()

    server.use(
      http.get(`${API_URL}/resume`, () => new HttpResponse(null, { status: 500 })),
      http.get(`${API_URL}/analysis`, () => new HttpResponse(null, { status: 500 })),
    )

    render(<Dashboard />, { initialEntries: ['/'] })

    await waitFor(
      () => {
        expect(screen.getByRole('button', { name: /retry/i })).toBeInTheDocument()
      },
      { timeout: 5000 },
    )

    await user.click(screen.getByRole('button', { name: /retry/i }))
  })
})
