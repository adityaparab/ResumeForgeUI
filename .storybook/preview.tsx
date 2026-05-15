import type { Preview, StoryContext } from '@storybook/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Provider as ReduxProvider } from 'react-redux'
import { MemoryRouter } from 'react-router'
import { Toaster } from 'sonner'
import { store } from '../src/app/store'
import '../src/index.css'
import { logout, setCredentials, type User } from '../src/stores/authSlice'
import {
  type ActiveJob,
  addActiveJob,
  removeActiveJob,
  selectActiveJobs,
  setTheme,
  type Theme,
} from '../src/stores/uiSlice'

interface StorybookAppState {
  activeJobs?: ActiveJob[]
  initialEntries?: string[]
  theme?: Theme
  user?: User | null
}

const defaultUser: User = {
  id: 'storybook-user',
  email: 'story@example.com',
}

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: false, staleTime: Number.POSITIVE_INFINITY },
    mutations: { retry: false },
  },
})

function getAppState(context: StoryContext): StorybookAppState {
  return (context.parameters.appState as StorybookAppState | undefined) ?? {}
}

function resetActiveJobs() {
  selectActiveJobs(store.getState()).forEach((job) => {
    store.dispatch(removeActiveJob(job.id))
  })
}

function applyAppState(appState: StorybookAppState) {
  queryClient.clear()
  store.dispatch(logout())
  resetActiveJobs()

  store.dispatch(setTheme(appState.theme ?? 'light'))

  if (appState.user !== null) {
    store.dispatch(
      setCredentials({
        user: appState.user ?? defaultUser,
        accessToken: 'storybook-access-token',
        refreshToken: 'storybook-refresh-token',
      }),
    )
  }

  appState.activeJobs?.forEach((job) => {
    store.dispatch(addActiveJob(job))
  })
}

const preview: Preview = {
  parameters: {
    actions: { argTypesRegex: '^on[A-Z].*' },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    a11y: {
      test: 'todo',
    },
  },
  decorators: [
    (Story, context) => {
      const appState = getAppState(context)
      applyAppState(appState)

      return (
        <ReduxProvider store={store}>
          <QueryClientProvider client={queryClient}>
            <MemoryRouter initialEntries={appState.initialEntries ?? ['/']}>
              <Story />
              <Toaster closeButton richColors position="top-right" />
            </MemoryRouter>
          </QueryClientProvider>
        </ReduxProvider>
      )
    },
  ],
}

export default preview
