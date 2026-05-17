import { configureStore } from '@reduxjs/toolkit'
import authReducer from '@/stores/authSlice'
import streamReducer from '@/stores/streamSlice'
import uiReducer from '@/stores/uiSlice'

export const store = configureStore({
  reducer: {
    auth: authReducer,
    ui: uiReducer,
    stream: streamReducer,
  },
  devTools: import.meta.env.DEV,
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
