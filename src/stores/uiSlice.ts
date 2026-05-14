import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import type { RootState } from '@/app/store'
import { THEME_KEY } from '@/constants'

export type JobType = 'resume-upload' | 'analysis'
export type JobStatus = 'pending' | 'processing' | 'completed' | 'failed'
export type Theme = 'light' | 'dark' | 'system'

export interface ActiveJob {
  id: string
  type: JobType
  status: JobStatus
  label: string
  createdAt: string
  readAt?: string
}

interface UIState {
  activeJobs: ActiveJob[]
  theme: Theme
}

export function getStoredTheme(): Theme {
  const stored = localStorage.getItem(THEME_KEY)
  switch (stored) {
    case 'light':
    case 'dark':
    case 'system':
      return stored
    default:
      return 'system'
  }
}

const initialState: UIState = {
  activeJobs: [],
  theme: getStoredTheme(),
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
      if (job && job.status !== action.payload.status) {
        job.status = action.payload.status
        job.readAt = undefined
      }
    },
    markJobNotificationRead: (state, action: PayloadAction<{ id: string; readAt: string }>) => {
      const job = state.activeJobs.find((j) => j.id === action.payload.id)
      if (job) job.readAt = action.payload.readAt
    },
    markAllJobNotificationsRead: (state, action: PayloadAction<string>) => {
      state.activeJobs.forEach((job) => {
        job.readAt = action.payload
      })
    },
    removeActiveJob: (state, action: PayloadAction<string>) => {
      state.activeJobs = state.activeJobs.filter((j) => j.id !== action.payload)
    },
    clearCompletedJobs: (state) => {
      state.activeJobs = state.activeJobs.filter(
        (j) => j.status === 'pending' || j.status === 'processing',
      )
    },
    setTheme: (state, action: PayloadAction<Theme>) => {
      state.theme = action.payload
      localStorage.setItem(THEME_KEY, action.payload)
    },
  },
})

export const {
  addActiveJob,
  updateJobStatus,
  markJobNotificationRead,
  markAllJobNotificationsRead,
  removeActiveJob,
  clearCompletedJobs,
  setTheme,
} = uiSlice.actions

export const selectActiveJobs = (state: RootState) => state.ui.activeJobs
export const selectUnreadJobs = (state: RootState) => state.ui.activeJobs.filter((j) => !j.readAt)
export const selectUnreadJobCount = (state: RootState) => selectUnreadJobs(state).length
export const selectPendingJobs = (state: RootState) =>
  state.ui.activeJobs.filter((j) => j.status === 'pending' || j.status === 'processing')
export const selectTheme = (state: RootState) => state.ui.theme

export default uiSlice.reducer
