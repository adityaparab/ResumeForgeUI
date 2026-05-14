/// <reference types="vitest/globals" />

import { render } from '@testing-library/react'
import { Providers } from '@/app/providers'
import App from './App'

describe('App', () => {
  it('renders without crashing', () => {
    // App already has RouterProvider inside, so don't wrap in another Router
    expect(() =>
      render(
        <Providers>
          <App />
        </Providers>,
      ),
    ).not.toThrow()
  })
})
