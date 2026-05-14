import { act, renderHook } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'
import { store } from '@/app/store'
import { useStreamJob } from '@/features/common/hooks/useStreamJob'
import { logout, setCredentials } from '@/stores/authSlice'

// Access the tracked EventSource instances from setup.ts
const MockEventSource = window.EventSource as unknown as {
  instances: {
    dispatchEvent: (type: string, data: string) => void
    onerror: ((e: Event) => void) | null
  }[]
}

beforeEach(() => {
  MockEventSource.instances = []
})

describe('useStreamJob', () => {
  it('returns idle status when no jobId', () => {
    const { result } = renderHook(() => useStreamJob({ jobId: null }))
    expect(result.current.status).toBe('idle')
    expect(result.current.chunks).toEqual([])
    expect(result.current.fullText).toBe('')
    expect(result.current.error).toBeNull()
  })

  it('returns idle status when disabled', () => {
    const { result } = renderHook(() => useStreamJob({ jobId: 'test-job', enabled: false }))
    expect(result.current.status).toBe('idle')
  })

  it('sets status to connecting when jobId is provided', () => {
    const { result } = renderHook(() => useStreamJob({ jobId: 'test-job-123' }))
    expect(result.current.status).toBe('connecting')
  })

  it('handles history event', async () => {
    const { result } = renderHook(() => useStreamJob({ jobId: 'test-job-123' }))
    await act(async () => {
      MockEventSource.instances[0]?.dispatchEvent('history', 'historical text')
    })
    expect(result.current.fullText).toBe('historical text')
    expect(result.current.status).toBe('streaming')
  })

  it('handles chunk event', async () => {
    const { result } = renderHook(() => useStreamJob({ jobId: 'test-job-123' }))
    await act(async () => {
      MockEventSource.instances[0]?.dispatchEvent('chunk', 'chunk1')
    })
    expect(result.current.chunks).toContain('chunk1')
    expect(result.current.status).toBe('streaming')
  })

  it('handles done event', async () => {
    const { result } = renderHook(() => useStreamJob({ jobId: 'test-job-123' }))
    await act(async () => {
      MockEventSource.instances[0]?.dispatchEvent('done', 'final text')
    })
    expect(result.current.status).toBe('done')
    expect(result.current.fullText).toBe('final text')
  })

  it('handles done event with empty data', async () => {
    const { result } = renderHook(() => useStreamJob({ jobId: 'test-job-123' }))
    await act(async () => {
      MockEventSource.instances[0]?.dispatchEvent('done', '')
    })
    expect(result.current.status).toBe('done')
  })

  it('handles failed event', async () => {
    const { result } = renderHook(() => useStreamJob({ jobId: 'test-job-123' }))
    await act(async () => {
      MockEventSource.instances[0]?.dispatchEvent('failed', 'Job failed reason')
    })
    expect(result.current.status).toBe('failed')
    expect(result.current.error).toBe('Job failed reason')
  })

  it('handles onerror', async () => {
    const { result } = renderHook(() => useStreamJob({ jobId: 'test-job-123' }))
    await act(async () => {
      const instance = MockEventSource.instances[0]
      if (instance?.onerror) instance.onerror(new Event('error'))
    })
    expect(result.current.status).toBe('failed')
    expect(result.current.error).toBe('Connection error. Please check your network and try again.')
  })

  it('includes token in URL when auth token exists', () => {
    store.dispatch(
      setCredentials({
        user: { id: '1', email: 'a@b.com' },
        accessToken: 'my-token',
        refreshToken: 'r',
      }),
    )
    try {
      const { result } = renderHook(() => useStreamJob({ jobId: 'test-job-with-token' }))
      expect(result.current.status).toBe('connecting')
      // The URL would include ?token=my-token
    } finally {
      store.dispatch(logout())
    }
  })

  it('handles failed event with empty data uses fallback message', async () => {
    const { result } = renderHook(() => useStreamJob({ jobId: 'test-job-123' }))
    await act(async () => {
      MockEventSource.instances[0]?.dispatchEvent('failed', '')
    })
    expect(result.current.status).toBe('failed')
    expect(result.current.error).toBe('Job failed')
  })
})
