import '@testing-library/jest-dom'
import { server } from './mocks/server'

// MSW lifecycle - vitest globals are available in setup files
beforeAll(() => server.listen({ onUnhandledRequest: 'warn' }))
afterEach(() => server.resetHandlers())
afterAll(() => server.close())
