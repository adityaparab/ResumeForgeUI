/// <reference types="vitest/globals" />

import { screen, waitFor } from '@testing-library/react'
import { HttpResponse, http } from 'msw'
import { describe, expect, it, vi } from 'vitest'
import { API_URL } from '@/constants'
import AnalysisStream from '@/pages/AnalysisStream'
import ResumeStream from '@/pages/ResumeStream'
import { server } from '@/tests/mocks/server'
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

describe('AnalysisStream - status error', () => {
  it('shows toast and stream viewer when status fetch fails', async () => {
    server.use(
      http.get(`${API_URL}/analysis/status/:id`, () =>
        HttpResponse.json({ message: 'Not found' }, { status: 404 }),
      ),
    )
    render(<AnalysisStream />)
    await waitFor(() => {
      // After error, it renders StreamViewer with idle status
      expect(screen.getByText('Analysis in Progress')).toBeInTheDocument()
    })
  })
})

describe('ResumeStream - status error', () => {
  it('shows toast and stream viewer when status fetch fails', async () => {
    server.use(
      http.get(`${API_URL}/resume/status/:id`, () =>
        HttpResponse.json({ message: 'Not found' }, { status: 404 }),
      ),
    )
    render(<ResumeStream />)
    await waitFor(() => {
      expect(screen.getByText('Resume Processing')).toBeInTheDocument()
    })
  })
})
