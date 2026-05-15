import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { HttpResponse, http } from 'msw'
import { describe, expect, it } from 'vitest'
import { API_URL } from '@/constants'
import { AnalyzeForm } from '@/features/analysis/components/AnalyzeForm'
import { server } from '../mocks/server'
import { render } from '../test-utils'

const completedResumeListResponse = {
  data: [
    {
      id: 'resume-1',
      userId: 'user-1',
      originalName: 'my-resume.pdf',
      mimeType: 'application/pdf',
      status: 'completed',
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z',
    },
  ],
  total: 1,
  page: 1,
  limit: 100,
}

describe('AnalyzeForm', () => {
  it('renders resume select and job description textarea', async () => {
    render(<AnalyzeForm />, { initialEntries: ['/analysis'] })
    expect(screen.getByLabelText('Resume')).toBeInTheDocument()
    expect(screen.getByLabelText('Job Description')).toBeInTheDocument()
  })

  it('shows "Loading resumes" while fetching', () => {
    render(<AnalyzeForm />, { initialEntries: ['/analysis'] })
    expect(screen.getByText(/loading resumes/i)).toBeInTheDocument()
  })

  it('populates resume dropdown with completed resumes', async () => {
    server.use(http.get(`${API_URL}/resume`, () => HttpResponse.json(completedResumeListResponse)))

    render(<AnalyzeForm />, { initialEntries: ['/analysis'] })

    await waitFor(() => {
      expect(screen.getByRole('option', { name: 'my-resume.pdf' })).toBeInTheDocument()
    })
  })

  it('shows "no completed resumes" message when list is empty', async () => {
    server.use(
      http.get(`${API_URL}/resume`, () =>
        HttpResponse.json({ data: [], total: 0, page: 1, limit: 100 }),
      ),
    )

    render(<AnalyzeForm />, { initialEntries: ['/analysis'] })

    await waitFor(() => {
      expect(screen.getByText(/no completed resumes/i)).toBeInTheDocument()
    })
  })

  it('shows validation error for empty resume selection on submit', async () => {
    const user = userEvent.setup()
    server.use(http.get(`${API_URL}/resume`, () => HttpResponse.json(completedResumeListResponse)))

    render(<AnalyzeForm />, { initialEntries: ['/analysis'] })

    await waitFor(() => {
      expect(screen.getByRole('option', { name: 'my-resume.pdf' })).toBeInTheDocument()
    })

    // Leave resume unselected, type short job description
    await user.type(screen.getByLabelText('Job Description'), 'short')
    await user.click(screen.getByRole('button', { name: /analyze/i }))

    await waitFor(() => {
      expect(screen.getAllByRole('alert').length).toBeGreaterThan(0)
    })
  })

  it('shows validation error for short job description', async () => {
    const user = userEvent.setup()
    server.use(http.get(`${API_URL}/resume`, () => HttpResponse.json(completedResumeListResponse)))

    render(<AnalyzeForm />, { initialEntries: ['/analysis'] })

    await waitFor(() => {
      expect(screen.getByRole('option', { name: 'my-resume.pdf' })).toBeInTheDocument()
    })

    await user.selectOptions(screen.getByLabelText('Resume'), 'resume-1')
    await user.type(screen.getByLabelText('Job Description'), 'too short')
    await user.click(screen.getByRole('button', { name: /analyze/i }))

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent(/at least 20/i)
    })
  })

  it('submits successfully with valid inputs', async () => {
    const user = userEvent.setup()
    server.use(http.get(`${API_URL}/resume`, () => HttpResponse.json(completedResumeListResponse)))

    render(<AnalyzeForm />, { initialEntries: ['/analysis'] })

    await waitFor(() => {
      expect(screen.getByRole('option', { name: 'my-resume.pdf' })).toBeInTheDocument()
    })

    const longDescription =
      'This is a very detailed job description with lots of relevant information and keywords'
    await user.selectOptions(screen.getByLabelText('Resume'), 'resume-1')
    await user.type(screen.getByLabelText('Job Description'), longDescription)
    await user.click(screen.getByRole('button', { name: /analyze/i }))

    await waitFor(() => {
      expect(screen.getByText(/analysis started/i)).toBeInTheDocument()
    })
    expect(screen.queryByText(/resume id is required/i)).not.toBeInTheDocument()
    expect(screen.queryByText(/at least 20/i)).not.toBeInTheDocument()
  })

  it('shows loading state while submitting', async () => {
    const user = userEvent.setup()
    server.use(
      http.get(`${API_URL}/resume`, () => HttpResponse.json(completedResumeListResponse)),
      http.post(`${API_URL}/analysis`, async () => {
        await new Promise((resolve) => setTimeout(resolve, 200))
        return HttpResponse.json({ id: 'a1', jobId: 'j1', status: 'queued' }, { status: 201 })
      }),
    )

    render(<AnalyzeForm />, { initialEntries: ['/analysis'] })

    await waitFor(() => {
      expect(screen.getByRole('option', { name: 'my-resume.pdf' })).toBeInTheDocument()
    })

    await user.selectOptions(screen.getByLabelText('Resume'), 'resume-1')
    await user.type(
      screen.getByLabelText('Job Description'),
      'This is a very detailed job description that exceeds twenty characters',
    )
    await user.click(screen.getByRole('button', { name: /analyze/i }))

    expect(screen.getByRole('button', { name: /starting analysis/i })).toBeInTheDocument()
  })

  it('resets form when Reset button is clicked', async () => {
    const user = userEvent.setup()
    server.use(http.get(`${API_URL}/resume`, () => HttpResponse.json(completedResumeListResponse)))

    render(<AnalyzeForm />, { initialEntries: ['/analysis'] })

    await waitFor(() => {
      expect(screen.getByRole('option', { name: 'my-resume.pdf' })).toBeInTheDocument()
    })

    const textarea = screen.getByLabelText('Job Description')
    await user.type(textarea, 'Some text')
    expect(textarea).toHaveValue('Some text')

    await user.click(screen.getByRole('button', { name: /reset/i }))
    expect(textarea).toHaveValue('')
  })

  it('shows error toast when analysis creation fails', async () => {
    const user = userEvent.setup()
    server.use(
      http.get(`${API_URL}/resume`, () => HttpResponse.json(completedResumeListResponse)),
      http.post(`${API_URL}/analysis`, () =>
        HttpResponse.json({ message: 'Failed to create analysis' }, { status: 500 }),
      ),
    )

    render(<AnalyzeForm />, { initialEntries: ['/analysis'] })

    await waitFor(() => {
      expect(screen.getByRole('option', { name: 'my-resume.pdf' })).toBeInTheDocument()
    })

    const longDescription =
      'This is a very detailed job description with lots of relevant information'
    await user.selectOptions(screen.getByLabelText('Resume'), 'resume-1')
    await user.type(screen.getByLabelText('Job Description'), longDescription)
    await user.click(screen.getByRole('button', { name: /analyze/i }))

    await waitFor(() => {
      expect(screen.queryByRole('button', { name: /analyzing/i })).not.toBeInTheDocument()
    })
  })
})
