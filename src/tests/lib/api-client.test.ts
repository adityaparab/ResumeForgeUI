/// <reference types="vitest/globals" />

import { HttpResponse, http } from 'msw'
import { beforeEach, describe, expect, it } from 'vitest'
import { store } from '@/app/store'
import { API_URL } from '@/constants'
import { analysisApi, authApi, resumeApi } from '@/lib/api-client'
import type { User } from '@/lib/schemas/auth.schema'
import { logout, setCredentials } from '@/stores/authSlice'
import { mockAnalysis, mockResume } from '@/tests/mocks/handlers'
import { server } from '@/tests/mocks/server'

beforeEach(() => {
  store.dispatch(logout())
})

describe('api-client', () => {
  describe('authApi', () => {
    it('register calls POST /auth/register', async () => {
      const result = await authApi.register({ email: 'a@b.com', password: 'password123' })
      expect(result.accessToken).toBeDefined()
    })

    it('login calls POST /auth/login', async () => {
      const result = await authApi.login({ email: 'a@b.com', password: 'password123' })
      expect(result.accessToken).toBeDefined()
    })

    it('logout calls POST /auth/logout', async () => {
      await expect(authApi.logout()).resolves.not.toThrow()
    })

    it('refresh calls POST /auth/refresh', async () => {
      const result = await authApi.refresh('refresh-token')
      expect(result.accessToken).toBe('new-access-token')
    })
  })

  describe('resumeApi', () => {
    it('list fetches resume list', async () => {
      const result = await resumeApi.list()
      expect(result.data).toEqual([])
    })

    it('getById fetches a resume', async () => {
      const result = await resumeApi.getById(mockResume.id)
      expect(result.id).toBe(mockResume.id)
    })

    it('getStatus fetches resume status', async () => {
      const result = await resumeApi.getStatus(mockResume.id)
      expect(result.status).toBe('completed')
    })

    it('download fetches blob', async () => {
      const result = await resumeApi.download(mockResume.id)
      expect(result).toBeInstanceOf(Blob)
    })

    it('delete calls DELETE /resume/:id', async () => {
      server.use(http.delete(`${API_URL}/resume/:id`, () => HttpResponse.json({})))
      await expect(resumeApi.delete(mockResume.id)).resolves.not.toThrow()
    })

    it('upload calls POST /resume/upload', async () => {
      const file = new File(['pdf'], 'test.pdf', { type: 'application/pdf' })
      const result = await resumeApi.upload(file, 'idem-key-123')
      expect(result.id).toBeDefined()
    })
  })

  describe('analysisApi', () => {
    it('list fetches analysis list', async () => {
      const result = await analysisApi.list()
      expect(result.data).toEqual([])
    })

    it('getById fetches an analysis', async () => {
      const result = await analysisApi.getById(mockAnalysis.id)
      expect(result.id).toBe(mockAnalysis.id)
    })

    it('getStatus fetches analysis status', async () => {
      const result = await analysisApi.getStatus(mockAnalysis.id)
      expect(result.status).toBe('completed')
    })

    it('create creates an analysis', async () => {
      const result = await analysisApi.create({
        resumeId: mockResume.id,
        jobDescription: 'Senior dev role...',
      })
      expect(result.id).toBeDefined()
    })

    it('delete calls DELETE /analysis/:id', async () => {
      server.use(http.delete(`${API_URL}/analysis/:id`, () => HttpResponse.json({})))
      await expect(analysisApi.delete(mockAnalysis.id)).resolves.not.toThrow()
    })
  })

  describe('request interceptor', () => {
    it('attaches Authorization header when token is in store', async () => {
      store.dispatch(
        setCredentials({
          user: { id: '1', email: 'test@test.com' },
          accessToken: 'my-token',
          refreshToken: 'refresh-token',
        }),
      )
      let capturedAuth: string | undefined
      server.use(
        http.get(`${API_URL}/resume`, ({ request }) => {
          capturedAuth = request.headers.get('Authorization') ?? undefined
          return HttpResponse.json({ data: [], total: 0, page: 1, limit: 20 })
        }),
      )
      await resumeApi.list()
      expect(capturedAuth).toBe('Bearer my-token')
    })
  })

  describe('response interceptor - 401 handling', () => {
    it('dispatches logout when 401 and no refresh token', async () => {
      // No token in store
      server.use(http.get(`${API_URL}/resume`, () => HttpResponse.json({}, { status: 401 })))
      await expect(resumeApi.list()).rejects.toThrow()
    })

    it('retries request after successful token refresh', async () => {
      store.dispatch(
        setCredentials({
          user: { id: '1', email: 'test@test.com' },
          accessToken: 'expired-token',
          refreshToken: 'valid-refresh',
        }),
      )
      let callCount = 0
      server.use(
        http.get(`${API_URL}/resume`, () => {
          callCount++
          if (callCount === 1) return HttpResponse.json({}, { status: 401 })
          return HttpResponse.json({ data: [], total: 0, page: 1, limit: 20 })
        }),
      )
      const result = await resumeApi.list()
      expect(result.data).toEqual([])
      expect(callCount).toBe(2)
    })

    it('dispatches logout when refresh fails', async () => {
      store.dispatch(
        setCredentials({
          user: { id: '1', email: 'test@test.com' },
          accessToken: 'expired-token',
          refreshToken: 'invalid-refresh',
        }),
      )
      server.use(
        http.get(`${API_URL}/resume`, () => HttpResponse.json({}, { status: 401 })),
        http.post(`${API_URL}/auth/refresh`, () => HttpResponse.json({}, { status: 401 })),
      )
      await expect(resumeApi.list()).rejects.toThrow()
      expect(store.getState().auth.isAuthenticated).toBe(false)
    })

    it('dispatches logout when user is null after token refresh', async () => {
      // Set up with refreshToken but no real user (edge case)
      store.dispatch(
        setCredentials({
          user: null as unknown as User,
          accessToken: 'expired-token',
          refreshToken: 'valid-refresh',
        }),
      )
      server.use(http.get(`${API_URL}/resume`, () => HttpResponse.json({}, { status: 401 })))
      await expect(resumeApi.list()).rejects.toThrow()
    })

    it('queues concurrent 401 requests and retries after refresh', async () => {
      store.dispatch(
        setCredentials({
          user: { id: '1', email: 'test@test.com' },
          accessToken: 'expired-token',
          refreshToken: 'valid-refresh',
        }),
      )
      let resumeCallCount = 0
      let analysisCallCount = 0
      server.use(
        http.get(`${API_URL}/resume`, () => {
          resumeCallCount++
          if (resumeCallCount === 1) return HttpResponse.json({}, { status: 401 })
          return HttpResponse.json({ data: [], total: 0, page: 1, limit: 20 })
        }),
        http.get(`${API_URL}/analysis`, () => {
          analysisCallCount++
          if (analysisCallCount === 1) return HttpResponse.json({}, { status: 401 })
          return HttpResponse.json({ data: [], total: 0, page: 1, limit: 20 })
        }),
      )
      // Fire two concurrent requests — the second should be queued while the first refreshes
      const [r1, r2] = await Promise.all([resumeApi.list(), analysisApi.list()])
      expect(r1.data).toEqual([])
      expect(r2.data).toEqual([])
    })
  })
})
