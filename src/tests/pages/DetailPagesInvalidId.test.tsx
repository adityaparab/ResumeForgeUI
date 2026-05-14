/// <reference types="vitest/globals" />

import { screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import AnalysisResult from '@/pages/AnalysisResult'
import ResumeDetail from '@/pages/ResumeDetail'
import { render } from '@/tests/test-utils'

vi.mock('react-router', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-router')>()
  return {
    ...actual,
    useParams: () => ({}),
    useNavigate: () => vi.fn(),
  }
})

describe('AnalysisResult - invalid ID', () => {
  it('shows error when analysisId is missing', () => {
    render(<AnalysisResult />)
    expect(screen.getByRole('alert')).toBeInTheDocument()
    expect(screen.getByText(/invalid analysis id/i)).toBeInTheDocument()
  })
})

describe('ResumeDetail - invalid ID', () => {
  it('shows error when resumeId is missing', () => {
    render(<ResumeDetail />)
    expect(screen.getByRole('alert')).toBeInTheDocument()
    expect(screen.getByText(/invalid resume id/i)).toBeInTheDocument()
  })
})
