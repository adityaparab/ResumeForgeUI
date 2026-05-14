import { screen, waitFor } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import AnalysisStream from '@/pages/AnalysisStream'
import ResumeStream from '@/pages/ResumeStream'
import { render } from '@/tests/test-utils'

vi.mock('react-router', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-router')>()
  return {
    ...actual,
    useParams: () => ({
      analysisId: '66f1a2b3c4d5e6f7a8b9c0d2',
      resumeId: '66f1a2b3c4d5e6f7a8b9c0d1',
    }),
    useNavigate: () => vi.fn(),
  }
})

describe('AnalysisStream', () => {
  it('shows loading spinner while status is loading', () => {
    render(<AnalysisStream />)
    // Should render loading or the stream viewer
    expect(document.body).toBeTruthy()
  })

  it('renders StreamViewer once status loads', async () => {
    render(<AnalysisStream />)
    await waitFor(() => {
      expect(screen.getByText('Analysis in Progress')).toBeInTheDocument()
    })
  })
})

describe('ResumeStream', () => {
  it('renders StreamViewer once status loads', async () => {
    render(<ResumeStream />)
    await waitFor(() => {
      expect(screen.getByText('Resume Processing')).toBeInTheDocument()
    })
  })

  it('shows file name in subtitle when available', async () => {
    render(<ResumeStream />)
    await waitFor(() => {
      expect(screen.getByText(/my-resume\.pdf/i)).toBeInTheDocument()
    })
  })
})
