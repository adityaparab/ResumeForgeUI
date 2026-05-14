/// <reference types="vitest/globals" />

import { act, screen, waitFor } from '@testing-library/react'
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

vi.mock('@/features/common/hooks/useStreamJob', () => ({
  useStreamJob: () => ({ status: 'done' as const, fullText: 'result text', error: null }),
}))

describe('AnalysisStream - handleDone callback', () => {
  it('calls handleDone when stream status is done', async () => {
    render(<AnalysisStream />)
    // Wait for status query to resolve and StreamViewer to render
    await waitFor(() => {
      expect(screen.getByText('Analysis in Progress')).toBeInTheDocument()
    })
    // handleDone calls setTimeout(navigate, 1500) — advance with fake timers
    await act(async () => {
      vi.useFakeTimers()
      vi.runAllTimers()
      vi.useRealTimers()
    })
  })
})

describe('ResumeStream - handleDone callback', () => {
  it('calls handleDone when stream status is done', async () => {
    render(<ResumeStream />)
    await waitFor(() => {
      expect(screen.getByText('Resume Processing')).toBeInTheDocument()
    })
    await act(async () => {
      vi.useFakeTimers()
      vi.runAllTimers()
      vi.useRealTimers()
    })
  })
})
