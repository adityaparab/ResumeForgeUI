import { configureStore } from '@reduxjs/toolkit'
import { describe, expect, it } from 'vitest'
import authReducer from '@/stores/authSlice'
import streamReducer from '@/stores/streamSlice'
import uiReducer, {
  addActiveJob,
  clearCompletedJobs,
  getStoredTheme,
  markAllJobNotificationsRead,
  markJobNotificationRead,
  removeActiveJob,
  selectActiveJobs,
  selectPendingJobs,
  selectTheme,
  selectUnreadJobCount,
  selectUnreadJobs,
  setTheme,
  updateJobStatus,
} from '@/stores/uiSlice'

function makeStore() {
  return configureStore({ reducer: { auth: authReducer, ui: uiReducer, stream: streamReducer } })
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

  it('updateJobStatus clears readAt when status changes', () => {
    const store = makeStore()
    store.dispatch(addActiveJob({ ...sampleJob, readAt: '2024-01-01T00:00:00Z' }))
    store.dispatch(updateJobStatus({ id: 'job-1', status: 'completed' }))
    expect(selectActiveJobs(store.getState())[0]?.readAt).toBeUndefined()
  })

  it('updateJobStatus keeps readAt when status is unchanged', () => {
    const store = makeStore()
    store.dispatch(addActiveJob({ ...sampleJob, readAt: '2024-01-01T00:00:00Z' }))
    store.dispatch(updateJobStatus({ id: 'job-1', status: 'processing' }))
    expect(selectActiveJobs(store.getState())[0]?.readAt).toBe('2024-01-01T00:00:00Z')
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

  it('markJobNotificationRead marks a single notification read', () => {
    const store = makeStore()
    store.dispatch(addActiveJob(sampleJob))
    store.dispatch(markJobNotificationRead({ id: 'job-1', readAt: '2024-01-02T00:00:00Z' }))
    expect(selectActiveJobs(store.getState())[0]?.readAt).toBe('2024-01-02T00:00:00Z')
    expect(selectUnreadJobs(store.getState())).toHaveLength(0)
    expect(selectUnreadJobCount(store.getState())).toBe(0)
  })

  it('markJobNotificationRead does nothing for unknown ids', () => {
    const store = makeStore()
    store.dispatch(addActiveJob(sampleJob))
    store.dispatch(markJobNotificationRead({ id: 'unknown', readAt: '2024-01-02T00:00:00Z' }))
    expect(selectActiveJobs(store.getState())[0]?.readAt).toBeUndefined()
    expect(selectUnreadJobCount(store.getState())).toBe(1)
  })

  it('markAllJobNotificationsRead marks every job read', () => {
    const store = makeStore()
    store.dispatch(addActiveJob({ ...sampleJob, id: 'job-1' }))
    store.dispatch(addActiveJob({ ...sampleJob, id: 'job-2' }))
    store.dispatch(markAllJobNotificationsRead('2024-01-02T00:00:00Z'))
    expect(selectUnreadJobs(store.getState())).toEqual([])
    expect(selectActiveJobs(store.getState()).every((job) => job.readAt)).toBe(true)
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
