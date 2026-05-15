import { HttpResponse, http } from 'msw'
import { API_URL } from '@/constants'

export const mockUser = {
  id: '66f1a2b3c4d5e6f7a8b9c0d1',
  email: 'user@example.com',
}

export const mockAuthResponse = {
  accessToken: 'mock-access-token',
  refreshToken: 'mock-refresh-token',
  tokenType: 'Bearer' as const,
  expiresIn: '15m',
  user: mockUser,
}

export const mockResume = {
  id: '66f1a2b3c4d5e6f7a8b9c0d1',
  userId: 'user-1',
  originalName: 'my-resume.pdf',
  mimeType: 'application/pdf',
  status: 'completed' as const,
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z',
  structuredContent: null,
}

export const mockAnalysis = {
  id: '66f1a2b3c4d5e6f7a8b9c0d2',
  userId: 'user-1',
  resumeId: '66f1a2b3c4d5e6f7a8b9c0d1',
  jobDescription: 'Senior software engineer position',
  status: 'completed' as const,
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z',
  result: {
    analysisReport: {
      score: 85,
      summary: 'Strong match',
      strengths: ['TypeScript', 'React'],
      gaps: ['GraphQL'],
      recommendations: ['Add GraphQL experience'],
      matchedKeywords: ['React', 'TypeScript'],
      missingKeywords: ['GraphQL'],
    },
    updatedResume: {},
  },
}

export const handlers = [
  // Auth
  http.post(`${API_URL}/auth/register`, () => {
    return HttpResponse.json(mockAuthResponse, { status: 201 })
  }),

  http.post(`${API_URL}/auth/login`, () => {
    return HttpResponse.json(mockAuthResponse)
  }),

  http.post(`${API_URL}/auth/refresh`, () => {
    return HttpResponse.json({
      accessToken: 'new-access-token',
      tokenType: 'Bearer' as const,
      expiresIn: '15m',
    })
  }),

  http.post(`${API_URL}/auth/logout`, () => {
    return HttpResponse.json({})
  }),

  // Resumes
  http.get(`${API_URL}/resume`, () => {
    return HttpResponse.json({
      data: [],
      total: 0,
      page: 1,
      limit: 20,
    })
  }),

  http.post(`${API_URL}/resume/upload`, () => {
    return HttpResponse.json(
      {
        id: '66f1a2b3c4d5e6f7a8b9c0d1',
        jobId: 'resume-extraction-66f1a2b3c4d5e6f7a8b9c0d1',
        status: 'queued',
      },
      { status: 201 },
    )
  }),

  http.get(`${API_URL}/resume/:id`, ({ params }) => {
    if (params.id === 'not-found') {
      return HttpResponse.json({ message: 'Not found' }, { status: 404 })
    }
    return HttpResponse.json(mockResume)
  }),

  http.patch(`${API_URL}/resume/:id`, async ({ request }) => {
    const body = (await request.json()) as { structuredContent?: unknown }
    return HttpResponse.json({ ...mockResume, structuredContent: body.structuredContent })
  }),

  http.get(`${API_URL}/resume/status/:id`, () => {
    return HttpResponse.json({
      id: '66f1a2b3c4d5e6f7a8b9c0d1',
      jobId: 'resume-extraction-job-1',
      status: 'completed',
      originalName: 'my-resume.pdf',
    })
  }),

  http.get(`${API_URL}/resume/:id/download`, () => {
    return new HttpResponse(new Blob(['pdf content']), {
      headers: { 'Content-Type': 'application/pdf' },
    })
  }),

  // Analysis
  http.post(`${API_URL}/analysis`, () => {
    return HttpResponse.json(
      {
        id: '66f1a2b3c4d5e6f7a8b9c0d2',
        jobId: 'resume-analysis-66f1a2b3c4d5e6f7a8b9c0d2',
        status: 'queued',
      },
      { status: 201 },
    )
  }),

  http.get(`${API_URL}/analysis`, () => {
    return HttpResponse.json({
      data: [],
      total: 0,
      page: 1,
      limit: 20,
    })
  }),

  http.get(`${API_URL}/analysis/:id`, ({ params }) => {
    if (params.id === 'not-found') {
      return HttpResponse.json({ message: 'Not found' }, { status: 404 })
    }
    return HttpResponse.json(mockAnalysis)
  }),

  http.get(`${API_URL}/analysis/status/:id`, () => {
    return HttpResponse.json({
      id: '66f1a2b3c4d5e6f7a8b9c0d2',
      resumeId: '66f1a2b3c4d5e6f7a8b9c0d1',
      jobId: 'analysis-job-1',
      status: 'completed',
    })
  }),
]
