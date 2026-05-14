import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { store } from '@/app/store'
import authReducer, {
  logout,
  selectAccessToken,
  selectCurrentUser,
  selectIsAuthenticated,
  setCredentials,
  updateUser,
} from '@/stores/authSlice'

const mockUser = { id: 'user-1', email: 'user@example.com' }

describe('authSlice', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  afterEach(() => {
    localStorage.clear()
  })

  it('setCredentials updates state and localStorage', () => {
    const state = authReducer(
      undefined,
      setCredentials({
        user: mockUser,
        accessToken: 'token-123',
        refreshToken: 'refresh-123',
      }),
    )
    expect(state.user).toEqual(mockUser)
    expect(state.accessToken).toBe('token-123')
    expect(state.refreshToken).toBe('refresh-123')
    expect(state.isAuthenticated).toBe(true)
    expect(localStorage.getItem('accessToken')).toBe('token-123')
    expect(localStorage.getItem('refreshToken')).toBe('refresh-123')
  })

  it('updateUser merges user fields', () => {
    let state = authReducer(
      undefined,
      setCredentials({
        user: mockUser,
        accessToken: 'token-123',
        refreshToken: 'refresh-123',
      }),
    )
    state = authReducer(state, updateUser({ name: 'Alice' }))
    expect(state.user?.name).toBe('Alice')
    expect(state.user?.email).toBe('user@example.com')
  })

  it('updateUser is a no-op when user is null', () => {
    // ensure user is null (no localStorage)
    const emptyState = { user: null, accessToken: null, refreshToken: null, isAuthenticated: false }
    const result = authReducer(
      emptyState as ReturnType<typeof authReducer>,
      updateUser({ name: 'Alice' }),
    )
    expect(result.user).toBeNull()
  })

  it('logout clears state and localStorage', () => {
    localStorage.setItem('accessToken', 'token-123')
    localStorage.setItem('refreshToken', 'refresh-123')
    let state = authReducer(
      undefined,
      setCredentials({
        user: mockUser,
        accessToken: 'token-123',
        refreshToken: 'refresh-123',
      }),
    )
    state = authReducer(state, logout())
    expect(state.user).toBeNull()
    expect(state.accessToken).toBeNull()
    expect(state.refreshToken).toBeNull()
    expect(state.isAuthenticated).toBe(false)
    expect(localStorage.getItem('accessToken')).toBeNull()
    expect(localStorage.getItem('refreshToken')).toBeNull()
  })

  it('initializes isAuthenticated from localStorage', async () => {
    localStorage.setItem('accessToken', 'pre-existing-token')
    vi.resetModules()
    const mod = await import('@/stores/authSlice')
    const state = mod.default(undefined, { type: '@@init' })
    expect(state.isAuthenticated).toBe(true)
    expect(state.accessToken).toBe('pre-existing-token')
    vi.resetModules()
  })

  it('selectors return correct values', () => {
    store.dispatch(setCredentials({ user: mockUser, accessToken: 'tok', refreshToken: 'ref' }))
    const state = store.getState()
    expect(selectCurrentUser(state)).toEqual(mockUser)
    expect(selectIsAuthenticated(state)).toBe(true)
    expect(selectAccessToken(state)).toBe('tok')
    store.dispatch(logout())
  })
})
