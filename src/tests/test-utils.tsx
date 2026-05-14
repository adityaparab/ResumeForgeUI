import { type RenderOptions, render } from '@testing-library/react'
import type { ReactElement } from 'react'
import { MemoryRouter } from 'react-router'
import { Providers } from '@/app/providers'

interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  initialEntries?: string[]
}

function customRender(ui: ReactElement, options?: CustomRenderOptions) {
  const { initialEntries, ...renderOptions } = options ?? {}

  return render(ui, {
    wrapper: ({ children }) => (
      <MemoryRouter initialEntries={initialEntries ?? ['/']}>
        <Providers>{children}</Providers>
      </MemoryRouter>
    ),
    ...renderOptions,
  })
}

export * from '@testing-library/react'
export { customRender as render }
