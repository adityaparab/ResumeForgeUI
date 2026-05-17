import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import type { RootState } from '@/app/store'
import type { StreamStatus } from '@/features/common/hooks/useStreamJob'

interface StreamEntry {
  fullText: string
  status: StreamStatus
}

interface StreamState {
  streams: Record<string, StreamEntry>
}

const initialState: StreamState = {
  streams: {},
}

const streamSlice = createSlice({
  name: 'stream',
  initialState,
  reducers: {
    updateStream: (
      state,
      action: PayloadAction<{ jobId: string; fullText: string; status: StreamStatus }>,
    ) => {
      const { jobId, fullText, status } = action.payload
      state.streams[jobId] = { fullText, status }
    },
    clearStream: (state, action: PayloadAction<string>) => {
      delete state.streams[action.payload]
    },
  },
})

export const { updateStream, clearStream } = streamSlice.actions

export const selectStream = (jobId: string | null | undefined) => (state: RootState) =>
  jobId ? state.stream.streams[jobId] : undefined

export default streamSlice.reducer
