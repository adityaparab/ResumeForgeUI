import '@testing-library/jest-dom'
import { server } from './mocks/server'

// Mock EventSource (not available in jsdom)
class MockEventSource {
  static instances: MockEventSource[] = []

  url: string
  readyState = 0
  onopen: (() => void) | null = null
  onmessage: ((e: MessageEvent) => void) | null = null
  onerror: ((e: Event) => void) | null = null
  private listeners: Record<string, ((e: MessageEvent) => void)[]> = {}

  constructor(url: string) {
    this.url = url
    MockEventSource.instances.push(this)
  }

  addEventListener(type: string, handler: (e: MessageEvent) => void) {
    if (!this.listeners[type]) this.listeners[type] = []
    this.listeners[type].push(handler)
  }

  removeEventListener(type: string, handler: (e: MessageEvent) => void) {
    if (this.listeners[type]) {
      this.listeners[type] = this.listeners[type].filter((h) => h !== handler)
    }
  }

  dispatchEvent(type: string, data: string) {
    const event = new MessageEvent(type, { data })
    this.listeners[type]?.forEach((h) => {
      h(event)
    })
  }

  close() {
    this.readyState = 2
  }
}

Object.defineProperty(window, 'EventSource', {
  writable: true,
  value: MockEventSource,
})

// MSW lifecycle - vitest globals are available in setup files
beforeAll(() => server.listen({ onUnhandledRequest: 'warn' }))
afterEach(() => server.resetHandlers())
afterAll(() => server.close())
