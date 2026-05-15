import { configureStore } from '@reduxjs/toolkit'
import type { Decorator, Preview } from '@storybook/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import type { ReactNode } from 'react'
import { useMemo } from 'react'
import { Provider as ReduxProvider } from 'react-redux'
import { MemoryRouter } from 'react-router'
import AppSnackbar from '../src/components/common/AppSnackbar'
import ThemeProvider from '../src/components/common/ThemeProvider'
import '../src/index.css'
import type { User } from '../src/stores/authSlice'
import authReducer from '../src/stores/authSlice'
import type { ActiveJob, Theme } from '../src/stores/uiSlice'
import uiReducer from '../src/stores/uiSlice'

interface StoryAppState {
  activeJobs?: ActiveJob[]
  initialEntries?: string[]
  theme?: Theme
  user?: User | null
}

const defaultUser: User = {
  id: 'storybook-user',
  email: 'aditya@example.com',
}

function createStoryQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: { retry: false, staleTime: Number.POSITIVE_INFINITY },
      mutations: { retry: false },
    },
  })
}

function createStoryStore(appState: StoryAppState) {
  const user = appState.user === undefined ? defaultUser : appState.user

  return configureStore({
    reducer: {
      auth: authReducer,
      ui: uiReducer,
    },
    preloadedState: {
      auth: {
        user,
        accessToken: user ? 'storybook-access-token' : null,
        refreshToken: user ? 'storybook-refresh-token' : null,
        isAuthenticated: Boolean(user),
      },
      ui: {
        activeJobs: appState.activeJobs ?? [],
        theme: appState.theme ?? 'light',
      },
    },
  })
}

function StoryProviders({ appState, children }: { appState: StoryAppState; children: ReactNode }) {
  const store = useMemo(() => createStoryStore(appState), [appState])
  const queryClient = useMemo(createStoryQueryClient, [])

  return (
    <ReduxProvider store={store}>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>
          <MemoryRouter initialEntries={appState.initialEntries ?? ['/']}>{children}</MemoryRouter>
          <AppSnackbar />
        </ThemeProvider>
      </QueryClientProvider>
    </ReduxProvider>
  )
}

const withAppProviders: Decorator = (Story, context) => {
  const appState = (context.parameters.appState ?? {}) as StoryAppState

  return (
    <StoryProviders appState={appState}>
      <Story />
    </StoryProviders>
  )
}

const preview: Preview = {
  decorators: [withAppProviders],
  parameters: {
    a11y: {
      element: '#storybook-root',
      config: {},
      options: {},
    },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
  },
}

export default preview
