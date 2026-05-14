import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import type { RootState } from '@/app/store'

export type JobType = 'resume-upload' | 'analysis'
export type JobStatus = 'pending' | 'processing' | 'completed' | 'failed'

export interface ActiveJob {
  id: string
  type: JobType
  status: JobStatus
  label: string
  createdAt: string
}

interface UIState {
  activeJobs: ActiveJob[]
}

const initialState: UIState = {
  activeJobs: [],
}

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    addActiveJob: (state, action: PayloadAction<ActiveJob>) => {
      state.activeJobs.push(action.payload)
    },
    updateJobStatus: (state, action: PayloadAction<{ id: string; status: JobStatus }>) => {
      const job = state.activeJobs.find((j) => j.id === action.payload.id)
      if (job) job.status = action.payload.status
    },
    removeActiveJob: (state, action: PayloadAction<string>) => {
      state.activeJobs = state.activeJobs.filter((j) => j.id !== action.payload)
    },
    clearCompletedJobs: (state) => {
      state.activeJobs = state.activeJobs.filter(
        (j) => j.status === 'pending' || j.status === 'processing',
      )
    },
  },
})

export const { addActiveJob, updateJobStatus, removeActiveJob, clearCompletedJobs } =
  uiSlice.actions

export const selectActiveJobs = (state: RootState) => state.ui.activeJobs
export const selectPendingJobs = (state: RootState) =>
  state.ui.activeJobs.filter((j) => j.status === 'pending' || j.status === 'processing')

export default uiSlice.reducer
