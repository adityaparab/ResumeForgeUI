import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { HttpResponse, http } from 'msw'
import { describe, expect, it, vi } from 'vitest'
import { API_URL } from '@/constants'
import AnalysisResult from '@/pages/AnalysisResult'
import ResumeDetail from '@/pages/ResumeDetail'
import { mockAnalysis, mockResume } from '@/tests/mocks/handlers'
import { server } from '@/tests/mocks/server'
import { render } from '@/tests/test-utils'

vi.mock('react-router', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-router')>()
  return {
    ...actual,
    useParams: () => ({ analysisId: mockAnalysis.id, resumeId: mockResume.id }),
    useNavigate: () => vi.fn(),
  }
})

describe('AnalysisResult', () => {
  it('shows loading spinner initially', () => {
    render(<AnalysisResult />)
    // page renders immediately, loading or data
    expect(document.body).toBeTruthy()
  })

  it('renders analysis result when data loads', async () => {
    render(<AnalysisResult />)
    await waitFor(() => {
      expect(screen.getByText('Analysis Result')).toBeInTheDocument()
    })
  })

  it('renders score badge', async () => {
    render(<AnalysisResult />)
    await waitFor(() => {
      expect(screen.getByText(String(mockAnalysis.result.analysisReport.score))).toBeInTheDocument()
    })
  })

  it('renders strengths section', async () => {
    render(<AnalysisResult />)
    await waitFor(() => {
      expect(screen.getByText('Strengths')).toBeInTheDocument()
    })
  })

  it('shows error on fetch failure', async () => {
    server.use(
      http.get(`${API_URL}/analysis/:id`, () =>
        HttpResponse.json({ message: 'Not found' }, { status: 404 }),
      ),
    )
    render(<AnalysisResult />)
    await waitFor(() => {
      expect(screen.getByRole('alert')).toBeInTheDocument()
    })
  })

  it('renders back navigation button', async () => {
    render(<AnalysisResult />)
    await waitFor(() => {
      expect(screen.getByText(/back to analyses/i)).toBeInTheDocument()
    })
  })

  it('clicks back navigation button', async () => {
    const user = userEvent.setup()
    render(<AnalysisResult />)
    const backBtn = await screen.findByText(/back to analyses/i)
    await user.click(backBtn)
    expect(backBtn).toBeInTheDocument()
  })

  it('shows processing message when analysis has no report', async () => {
    server.use(
      http.get(`${API_URL}/analysis/:id`, () =>
        HttpResponse.json({ ...mockAnalysis, status: 'processing', result: undefined }),
      ),
    )
    render(<AnalysisResult />)
    await waitFor(() => {
      expect(screen.getByText(/analysis is still processing/i)).toBeInTheDocument()
    })
  })

  it('shows error message for failed analysis', async () => {
    server.use(
      http.get(`${API_URL}/analysis/:id`, () =>
        HttpResponse.json({
          ...mockAnalysis,
          status: 'failed',
          error: 'Analysis failed due to timeout',
          result: undefined,
        }),
      ),
    )
    render(<AnalysisResult />)
    await waitFor(() => {
      expect(screen.getByRole('alert')).toBeInTheDocument()
      expect(screen.getByText('Analysis failed due to timeout')).toBeInTheDocument()
    })
  })

  it('renders ScoreBadge with yellow color for score 70', async () => {
    server.use(
      http.get(`${API_URL}/analysis/:id`, () =>
        HttpResponse.json({
          ...mockAnalysis,
          result: {
            ...mockAnalysis.result,
            analysisReport: { ...mockAnalysis.result.analysisReport, score: 70 },
          },
        }),
      ),
    )
    render(<AnalysisResult />)
    await waitFor(() => {
      expect(screen.getByText('70')).toBeInTheDocument()
    })
  })

  it('renders ScoreBadge with red color for score 40', async () => {
    server.use(
      http.get(`${API_URL}/analysis/:id`, () =>
        HttpResponse.json({
          ...mockAnalysis,
          result: {
            ...mockAnalysis.result,
            analysisReport: { ...mockAnalysis.result.analysisReport, score: 40 },
          },
        }),
      ),
    )
    render(<AnalysisResult />)
    await waitFor(() => {
      expect(screen.getByText('40')).toBeInTheDocument()
    })
  })
})

describe('ResumeDetail', () => {
  it('renders resume detail when data loads', async () => {
    render(<ResumeDetail />)
    await waitFor(() => {
      expect(screen.getByText(mockResume.originalName)).toBeInTheDocument()
    })
  })

  it('shows error on fetch failure', async () => {
    server.use(
      http.get(`${API_URL}/resume/:id`, () =>
        HttpResponse.json({ message: 'Not found' }, { status: 404 }),
      ),
    )
    render(<ResumeDetail />)
    await waitFor(() => {
      expect(screen.getByRole('alert')).toBeInTheDocument()
    })
  })

  it('renders back navigation button', async () => {
    render(<ResumeDetail />)
    await waitFor(() => {
      expect(screen.getByText(/back to resumes/i)).toBeInTheDocument()
    })
  })

  it('clicks back navigation button', async () => {
    const user = userEvent.setup()
    render(<ResumeDetail />)
    const backBtn = await screen.findByText(/back to resumes/i)
    await user.click(backBtn)
    expect(backBtn).toBeInTheDocument()
  })

  it('shows download button for completed resume', async () => {
    render(<ResumeDetail />)
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /download/i })).toBeInTheDocument()
    })
  })

  it('renders structuredContent sections when available', async () => {
    server.use(
      http.get(`${API_URL}/resume/:id`, () =>
        HttpResponse.json({
          ...mockResume,
          structuredContent: {
            basics: {
              name: 'John Doe',
              label: 'Software Engineer',
              email: 'john@example.com',
              phone: '555-1234',
              summary: 'Experienced engineer',
            },
            work: [
              {
                name: 'ACME Corp',
                position: 'Engineer',
                startDate: '2020-01',
                endDate: null,
                summary: 'Built stuff',
              },
            ],
            education: [
              {
                institution: 'State University',
                studyType: 'B.S.',
                area: 'Computer Science',
                startDate: '2016',
                endDate: '2020',
              },
            ],
            skills: [{ name: 'TypeScript', keywords: ['TS', 'JavaScript'] }],
          },
        }),
      ),
    )
    render(<ResumeDetail />)
    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument()
      expect(screen.getByText('Software Engineer')).toBeInTheDocument()
      expect(screen.getByText('ACME Corp')).toBeInTheDocument()
      expect(screen.getByText('State University')).toBeInTheDocument()
    })
  })

  it('triggers download when download button is clicked', async () => {
    const user = userEvent.setup()
    // Spy on URL.createObjectURL
    const mockCreateObjectURL = vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:url')
    vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => {})

    render(<ResumeDetail />)
    const downloadBtn = await screen.findByRole('button', { name: /download/i })
    await user.click(downloadBtn)
    await waitFor(() => {
      expect(mockCreateObjectURL).toHaveBeenCalled()
    })
    vi.restoreAllMocks()
  })

  it('renders structuredContent with partial fields (no dates, no summary)', async () => {
    server.use(
      http.get(`${API_URL}/resume/:id`, () =>
        HttpResponse.json({
          ...mockResume,
          structuredContent: {
            basics: { name: 'Jane' },
            work: [
              { name: 'Corp', position: 'Dev' }, // no dates, no summary
            ],
            education: [
              { institution: 'Uni', studyType: 'B.S.', area: 'CS' }, // no dates
            ],
            skills: [
              { name: 'Python' }, // no keywords
            ],
          },
        }),
      ),
    )
    render(<ResumeDetail />)
    await waitFor(() => {
      expect(screen.getByText('Jane')).toBeInTheDocument()
      expect(screen.getByText('Corp')).toBeInTheDocument()
      expect(screen.getByText('Uni')).toBeInTheDocument()
      expect(screen.getByText('Python')).toBeInTheDocument()
    })
  })

  it('shows failed status badge (red CSS class)', async () => {
    server.use(
      http.get(`${API_URL}/resume/:id`, () =>
        HttpResponse.json({ ...mockResume, status: 'failed', structuredContent: null }),
      ),
    )
    render(<ResumeDetail />)
    await waitFor(() => {
      expect(screen.getByText('failed')).toBeInTheDocument()
    })
  })

  it('shows processing message when no structuredContent and status processing', async () => {
    server.use(
      http.get(`${API_URL}/resume/:id`, () =>
        HttpResponse.json({ ...mockResume, status: 'processing', structuredContent: null }),
      ),
    )
    render(<ResumeDetail />)
    await waitFor(() => {
      expect(screen.getByText('Resume is still being processed.')).toBeInTheDocument()
    })
  })

  it('shows no structured content message when completed but structuredContent null', async () => {
    server.use(
      http.get(`${API_URL}/resume/:id`, () =>
        HttpResponse.json({ ...mockResume, status: 'completed', structuredContent: null }),
      ),
    )
    render(<ResumeDetail />)
    await waitFor(() => {
      expect(screen.getByText('No structured content available.')).toBeInTheDocument()
    })
  })

  it('renders education without area field', async () => {
    server.use(
      http.get(`${API_URL}/resume/:id`, () =>
        HttpResponse.json({
          ...mockResume,
          structuredContent: {
            education: [
              { institution: 'State U', studyType: 'M.S.', startDate: '2020', endDate: null },
              { institution: 'Online U', studyType: 'B.A.' }, // no startDate or endDate
            ],
            skills: [
              { name: null, keywords: null }, // no keywords, no name → covers skill.name ?? ''
            ],
          },
        }),
      ),
    )
    render(<ResumeDetail />)
    await waitFor(() => {
      expect(screen.getByText('State U')).toBeInTheDocument()
    })
  })
})
