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
]
