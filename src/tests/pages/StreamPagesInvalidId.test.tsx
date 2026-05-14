/// <reference types="vitest/globals" />

import { screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import AnalysisStream from '@/pages/AnalysisStream'
import ResumeStream from '@/pages/ResumeStream'
import { render } from '@/tests/test-utils'

vi.mock('react-router', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-router')>()
  return {
    ...actual,
    useParams: () => ({}),
    useNavigate: () => vi.fn(),
  }
})

describe('AnalysisStream - invalid ID', () => {
  it('shows error when analysisId is missing', () => {
    render(<AnalysisStream />)
    expect(screen.getByRole('alert')).toBeInTheDocument()
    expect(screen.getByText(/invalid analysis id/i)).toBeInTheDocument()
  })
})

describe('ResumeStream - invalid ID', () => {
  it('shows error when resumeId is missing', () => {
    render(<ResumeStream />)
    expect(screen.getByRole('alert')).toBeInTheDocument()
    expect(screen.getByText(/invalid resume id/i)).toBeInTheDocument()
  })
})
