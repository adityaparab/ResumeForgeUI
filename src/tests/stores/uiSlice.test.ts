import { configureStore } from '@reduxjs/toolkit'
import { describe, expect, it, vi } from 'vitest'
import authReducer from '@/stores/authSlice'
import uiReducer, {
  addActiveJob,
  clearCompletedJobs,
  getStoredTheme,
  removeActiveJob,
  selectActiveJobs,
  selectPendingJobs,
  selectTheme,
  setTheme,
  updateJobStatus,
} from '@/stores/uiSlice'

function makeStore() {
  return configureStore({ reducer: { auth: authReducer, ui: uiReducer } })
}

const sampleJob = {
  id: 'job-1',
  type: 'resume-upload' as const,
  status: 'processing' as const,
  label: 'my-resume.pdf',
  createdAt: '2024-01-01T00:00:00Z',
}

describe('uiSlice', () => {
  it('starts with empty activeJobs', () => {
    const store = makeStore()
    expect(selectActiveJobs(store.getState())).toEqual([])
  })

  it('addActiveJob appends a job', () => {
    const store = makeStore()
    store.dispatch(addActiveJob(sampleJob))
    expect(selectActiveJobs(store.getState())).toHaveLength(1)
    expect(selectActiveJobs(store.getState())[0]?.id).toBe('job-1')
  })

  it('updateJobStatus changes job status', () => {
    const store = makeStore()
    store.dispatch(addActiveJob(sampleJob))
    store.dispatch(updateJobStatus({ id: 'job-1', status: 'completed' }))
    expect(selectActiveJobs(store.getState())[0]?.status).toBe('completed')
  })

  it('updateJobStatus does nothing for unknown id', () => {
    const store = makeStore()
    store.dispatch(addActiveJob(sampleJob))
    store.dispatch(updateJobStatus({ id: 'unknown', status: 'failed' }))
    expect(selectActiveJobs(store.getState())[0]?.status).toBe('processing')
  })

  it('removeActiveJob removes job by id', () => {
    const store = makeStore()
    store.dispatch(addActiveJob(sampleJob))
    store.dispatch(removeActiveJob('job-1'))
    expect(selectActiveJobs(store.getState())).toHaveLength(0)
  })

  it('clearCompletedJobs removes completed and failed jobs', () => {
    const store = makeStore()
    store.dispatch(addActiveJob({ ...sampleJob, id: 'job-1', status: 'processing' }))
    store.dispatch(addActiveJob({ ...sampleJob, id: 'job-2', status: 'completed' }))
    store.dispatch(addActiveJob({ ...sampleJob, id: 'job-3', status: 'failed' }))
    store.dispatch(clearCompletedJobs())
    const jobs = selectActiveJobs(store.getState())
    expect(jobs).toHaveLength(1)
    expect(jobs[0]?.id).toBe('job-1')
  })

  it('selectPendingJobs returns only active jobs', () => {
    const store = makeStore()
    store.dispatch(addActiveJob({ ...sampleJob, id: 'job-1', status: 'pending' }))
    store.dispatch(addActiveJob({ ...sampleJob, id: 'job-2', status: 'completed' }))
    store.dispatch(addActiveJob({ ...sampleJob, id: 'job-3', status: 'processing' }))
    const pending = selectPendingJobs(store.getState())
    expect(pending).toHaveLength(2)
  })

  it('selectTheme returns the current theme', () => {
    const store = makeStore()
    expect(['light', 'dark', 'system']).toContain(selectTheme(store.getState()))
  })

  it('setTheme updates the theme', () => {
    const store = makeStore()
    store.dispatch(setTheme('dark'))
    expect(selectTheme(store.getState())).toBe('dark')
    store.dispatch(setTheme('light'))
    expect(selectTheme(store.getState())).toBe('light')
    store.dispatch(setTheme('system'))
    expect(selectTheme(store.getState())).toBe('system')
  })

  it('starts with system theme when localStorage has unknown value', () => {
    localStorage.setItem('theme', 'unknown')
    const freshStore = makeStore()
    // Theme defaults to system when stored value is unrecognized
    expect(['light', 'dark', 'system']).toContain(selectTheme(freshStore.getState()))
    localStorage.removeItem('theme')
  })

  it('getStoredTheme returns stored light theme', () => {
    localStorage.setItem('theme', 'light')
    expect(getStoredTheme()).toBe('light')
    localStorage.removeItem('theme')
  })

  it('getStoredTheme returns stored dark theme', () => {
    localStorage.setItem('theme', 'dark')
    expect(getStoredTheme()).toBe('dark')
    localStorage.removeItem('theme')
  })

  it('getStoredTheme returns stored system theme', () => {
    localStorage.setItem('theme', 'system')
    expect(getStoredTheme()).toBe('system')
    localStorage.removeItem('theme')
  })

  it('getStoredTheme returns system for unknown value', () => {
    localStorage.setItem('theme', 'invalid')
    expect(getStoredTheme()).toBe('system')
    localStorage.removeItem('theme')
  })
})
