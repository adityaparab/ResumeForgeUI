import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { type RenderOptions, render } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type { ReactElement } from 'react'
import { Provider as ReduxProvider } from 'react-redux'
import { MemoryRouter } from 'react-router'
import { Toaster } from 'sonner'
import { store } from '@/app/store'
import ThemeProvider from '@/components/common/ThemeProvider'

interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  initialEntries?: string[]
}

function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: { staleTime: 0, retry: false, gcTime: 0 },
      mutations: { retry: false },
    },
  })
}

function customRender(ui: ReactElement, options?: CustomRenderOptions) {
  const { initialEntries, ...renderOptions } = options ?? {}
  const queryClient = makeQueryClient()

  return render(ui, {
    wrapper: ({ children }) => (
      <ReduxProvider store={store}>
        <QueryClientProvider client={queryClient}>
          <ThemeProvider>
            <MemoryRouter initialEntries={initialEntries ?? ['/']}>{children}</MemoryRouter>
            <Toaster closeButton />
          </ThemeProvider>
        </QueryClientProvider>
      </ReduxProvider>
    ),
    ...renderOptions,
  })
}

export * from '@testing-library/react'
export { customRender as render, userEvent }
