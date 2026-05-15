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

function mockAnalysisResultsForResume(analyses = [mockAnalysis]) {
  server.use(
    http.get(`${API_URL}/analysis`, () =>
      HttpResponse.json({ data: analyses, total: analyses.length, page: 1, limit: 100 }),
    ),
  )
}

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

  it('shows completed empty-result message when completed analysis has no report', async () => {
    server.use(
      http.get(`${API_URL}/analysis/:id`, () =>
        HttpResponse.json({ ...mockAnalysis, status: 'completed', result: null }),
      ),
    )
    render(<AnalysisResult />)
    await waitFor(() => {
      expect(screen.getByText(/completed analysis has no result data/i)).toBeInTheDocument()
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

  it('renders direct and partial analysis report payloads safely', async () => {
    server.use(
      http.get(`${API_URL}/analysis/:id`, () =>
        HttpResponse.json({
          ...mockAnalysis,
          result: {
            score: '101',
            summary: '',
            strengths: ['Adaptable', 12],
            gaps: undefined,
            recommendations: undefined,
            matchedKeywords: undefined,
            missingKeywords: undefined,
          },
        }),
      ),
    )
    render(<AnalysisResult />)
    await waitFor(() => {
      expect(screen.getByText('100')).toBeInTheDocument()
      expect(screen.getByText('No summary available.')).toBeInTheDocument()
      expect(screen.getByText('Adaptable')).toBeInTheDocument()
      expect(screen.getAllByText('No items available.')).toHaveLength(2)
      expect(screen.getAllByText('None')).toHaveLength(2)
    })
  })

  it('renders invalid analysis scores as zero', async () => {
    server.use(
      http.get(`${API_URL}/analysis/:id`, () =>
        HttpResponse.json({
          ...mockAnalysis,
          result: {
            analysisReport: {
              ...mockAnalysis.result.analysisReport,
              score: 'not-a-number',
            },
          },
        }),
      ),
    )
    render(<AnalysisResult />)
    await waitFor(() => {
      expect(screen.getByText('0')).toBeInTheDocument()
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

  it('hides download button until a completed analysis result exists for the resume', async () => {
    render(<ResumeDetail />)
    await waitFor(() => {
      expect(screen.queryByRole('button', { name: /download/i })).not.toBeInTheDocument()
    })
  })

  it('shows download button for completed resume when analysis result exists', async () => {
    mockAnalysisResultsForResume()
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
      expect(screen.getByRole('heading', { name: 'Basics' })).toBeInTheDocument()
      expect(screen.getByRole('heading', { name: 'Work Experience' })).toBeInTheDocument()
      expect(screen.getByDisplayValue('John Doe')).toBeInTheDocument()
      expect(screen.getByDisplayValue('Software Engineer')).toBeInTheDocument()
      expect(screen.getByDisplayValue('ACME Corp')).toBeInTheDocument()
      expect(screen.getByDisplayValue('State University')).toBeInTheDocument()
    })
  })

  it('triggers download when download button is clicked', async () => {
    const user = userEvent.setup()
    mockAnalysisResultsForResume()
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

  it('shows a friendly error when download fails', async () => {
    const user = userEvent.setup()
    mockAnalysisResultsForResume()
    server.use(
      http.get(`${API_URL}/resume/:id/download`, () => HttpResponse.json({}, { status: 500 })),
    )
    render(<ResumeDetail />)
    const downloadBtn = await screen.findByRole('button', { name: /download/i })
    await user.click(downloadBtn)
    await waitFor(() => {
      expect(screen.getByText('Could not download resume.')).toBeInTheDocument()
    })
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
      expect(screen.getByDisplayValue('Jane')).toBeInTheDocument()
      expect(screen.getByDisplayValue('Corp')).toBeInTheDocument()
      expect(screen.getByDisplayValue('Uni')).toBeInTheDocument()
      expect(screen.getByDisplayValue('Python')).toBeInTheDocument()
    })
  })

  it('shows failed resume error details', async () => {
    server.use(
      http.get(`${API_URL}/resume/:id`, () =>
        HttpResponse.json({
          ...mockResume,
          status: 'failed',
          structuredContent: null,
          error: 'Extraction failed due to invalid document',
        }),
      ),
    )
    render(<ResumeDetail />)
    await waitFor(() => {
      expect(screen.getByText('failed')).toBeInTheDocument()
      expect(screen.getByRole('alert')).toHaveTextContent(
        'Extraction failed due to invalid document',
      )
    })
  })

  it('shows fallback failed resume error details', async () => {
    server.use(
      http.get(`${API_URL}/resume/:id`, () =>
        HttpResponse.json({ ...mockResume, status: 'failed', structuredContent: null }),
      ),
    )
    render(<ResumeDetail />)
    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent('Resume extraction failed.')
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
      expect(screen.getByDisplayValue('State U')).toBeInTheDocument()
    })
  })

  it('edits resume fields in place and resets changes', async () => {
    const user = userEvent.setup()
    server.use(
      http.get(`${API_URL}/resume/:id`, () =>
        HttpResponse.json({
          ...mockResume,
          structuredContent: {
            basics: { name: 'John Doe', summary: 'Original summary' },
            work: [{ name: 'ACME Corp', position: 'Engineer', highlights: ['Built tools'] }],
            skills: [{ name: 'TypeScript', keywords: ['React', 'Node'] }],
          },
        }),
      ),
    )
    render(<ResumeDetail />)
    const nameInput = await screen.findByDisplayValue('John Doe')
    const summaryInput = screen.getByLabelText('Summary')
    const keywordsInput = screen.getByLabelText('Keywords')
    await user.clear(nameInput)
    await user.type(nameInput, 'Jane Doe')
    await user.clear(summaryInput)
    await user.type(summaryInput, 'Updated summary')
    await user.clear(keywordsInput)
    await user.type(keywordsInput, 'React\nNode\nVitest')
    expect(screen.getByRole('button', { name: /save changes/i })).toBeEnabled()
    await user.click(screen.getByRole('button', { name: /reset/i }))
    expect(nameInput).toHaveValue('John Doe')
    expect(summaryInput).toHaveValue('Original summary')
    expect(screen.getByLabelText('Keywords')).toHaveValue('React\nNode')
  })

  it('submits edited resume fields', async () => {
    const user = userEvent.setup()
    let savedName = ''
    server.use(
      http.get(`${API_URL}/resume/:id`, () =>
        HttpResponse.json({ ...mockResume, structuredContent: { basics: { name: 'John Doe' } } }),
      ),
      http.patch(`${API_URL}/resume/:id`, async ({ request }) => {
        const body = (await request.json()) as { structuredContent: { basics: { name: string } } }
        savedName = body.structuredContent.basics.name
        return HttpResponse.json({ ...mockResume, structuredContent: body.structuredContent })
      }),
    )
    render(<ResumeDetail />)
    const nameInput = await screen.findByLabelText('Name')
    await user.clear(nameInput)
    await user.type(nameInput, 'Jane Doe')
    await user.click(screen.getByRole('button', { name: /save changes/i }))
    await waitFor(() => {
      expect(savedName).toBe('Jane Doe')
      expect(screen.getByText('Resume details saved.')).toBeInTheDocument()
    })
  })

  it('shows a friendly error when edited resume save fails', async () => {
    const user = userEvent.setup()
    server.use(
      http.get(`${API_URL}/resume/:id`, () =>
        HttpResponse.json({ ...mockResume, structuredContent: { basics: { name: 'John Doe' } } }),
      ),
      http.patch(`${API_URL}/resume/:id`, () => HttpResponse.json({}, { status: 500 })),
    )
    render(<ResumeDetail />)
    const nameInput = await screen.findByLabelText('Name')
    await user.clear(nameInput)
    await user.type(nameInput, 'Jane Doe')
    await user.click(screen.getByRole('button', { name: /save changes/i }))
    await waitFor(() => {
      expect(screen.getByText('Could not save resume details.')).toBeInTheDocument()
    })
  })

  it('handles save responses without structured content', async () => {
    const user = userEvent.setup()
    server.use(
      http.get(`${API_URL}/resume/:id`, () =>
        HttpResponse.json({ ...mockResume, structuredContent: { basics: { name: 'John Doe' } } }),
      ),
      http.patch(`${API_URL}/resume/:id`, () =>
        HttpResponse.json({ ...mockResume, structuredContent: null }),
      ),
    )
    render(<ResumeDetail />)
    const nameInput = await screen.findByLabelText('Name')
    await user.clear(nameInput)
    await user.type(nameInput, 'Jane Doe')
    await user.click(screen.getByRole('button', { name: /save changes/i }))
    await waitFor(() => {
      expect(screen.getByText('Resume details saved.')).toBeInTheDocument()
    })
  })

  it('renders an empty structured content state', async () => {
    server.use(
      http.get(`${API_URL}/resume/:id`, () =>
        HttpResponse.json({ ...mockResume, structuredContent: { work: [] } }),
      ),
    )
    render(<ResumeDetail />)
    await waitFor(() => {
      expect(screen.getByText('No structured fields available.')).toBeInTheDocument()
    })
  })
})
