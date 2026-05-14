import { configureStore } from '@reduxjs/toolkit'
import { describe, expect, it } from 'vitest'
import authReducer from '@/stores/authSlice'
import uiReducer, {
  addActiveJob,
  clearCompletedJobs,
  removeActiveJob,
  selectActiveJobs,
  selectPendingJobs,
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
})
