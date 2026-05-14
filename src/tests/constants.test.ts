import { afterEach, describe, expect, it, vi } from 'vitest'

describe('constants', () => {
  afterEach(() => {
    vi.unstubAllEnvs()
    vi.resetModules()
  })

  it('uses Vite environment overrides when provided', async () => {
    vi.resetModules()
    vi.stubEnv('VITE_APP_NAME', 'CustomForge')
    vi.stubEnv('VITE_API_BASE_URL', 'http://api.example.test')

    const constants = await import('@/constants')

    expect(constants.APP_NAME).toBe('CustomForge')
    expect(constants.API_BASE_URL).toBe('http://api.example.test')
    expect(constants.API_URL).toBe('http://api.example.test/api/v1')
    expect(constants.ALLOWED_FILE_TYPES).toContain('application/pdf')
    expect(constants.FILE_UPLOAD_MAX_SIZE).toBe(5 * 1024 * 1024)
    expect(constants.PAGINATION.DEFAULT_PAGE_SIZE).toBe(10)
  })

  it('uses defaults when Vite environment overrides are absent', async () => {
    vi.resetModules()
    vi.stubEnv('VITE_APP_NAME', undefined)
    vi.stubEnv('VITE_API_BASE_URL', undefined)

    const constants = await import('@/constants')

    expect(constants.APP_NAME).toBe('ResumeForge')
    expect(constants.API_BASE_URL).toBe('http://localhost:3001')
    expect(constants.API_URL).toBe('http://localhost:3001/api/v1')
  })
})
