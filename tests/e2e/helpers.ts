import type { Page, Route } from '@playwright/test'

const API = '**/api/**'

const MOCK_USER = { id: 'user-1', email: 'user@example.com' }
const MOCK_AUTH = {
  accessToken: 'mock-access-token',
  refreshToken: 'mock-refresh-token',
  tokenType: 'Bearer',
  expiresIn: '15m',
  user: MOCK_USER,
}

const MOCK_RESUME = {
  id: 'resume-1',
  userId: 'user-1',
  originalName: 'my-resume.pdf',
  mimeType: 'application/pdf',
  status: 'completed',
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z',
  structuredContent: null,
}

const MOCK_ANALYSIS = {
  id: 'analysis-1',
  userId: 'user-1',
  resumeId: 'resume-1',
  jobDescription: 'Senior engineer role',
  status: 'completed',
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z',
  result: {
    analysisReport: {
      score: 85,
      summary: 'Strong match',
      strengths: ['TypeScript', 'React'],
      gaps: ['GraphQL'],
      recommendations: ['Add GraphQL'],
      matchedKeywords: ['React'],
      missingKeywords: ['GraphQL'],
    },
    updatedResume: {},
  },
}

export async function loginUser(page: Page) {
  await page.route(`${API}/auth/login`, (route: Route) =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(MOCK_AUTH),
    }),
  )

  await page.goto('/login')
  await page.getByLabel(/email address/i).fill('user@example.com')
  await page.getByLabel(/password/i).fill('password123')
  await page.getByRole('button', { name: 'Sign in' }).click()
  await page.waitForURL('/')
}

export async function mockDashboardAPIs(page: Page) {
  await page.route(`${API}/resume**`, (route: Route) => {
    if (route.request().method() === 'GET') {
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ data: [], total: 0, page: 1, limit: 20 }),
      })
    }
    return route.continue()
  })

  await page.route(`${API}/analysis**`, (route: Route) => {
    if (route.request().method() === 'GET') {
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ data: [], total: 0, page: 1, limit: 20 }),
      })
    }
    return route.continue()
  })
}

export async function mockResumeList(page: Page, resumes = [MOCK_RESUME]) {
  await page.route(`${API}/resume**`, (route: Route) => {
    if (route.request().method() === 'GET') {
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ data: resumes, total: resumes.length, page: 1, limit: 20 }),
      })
    }
    return route.continue()
  })
}

export async function mockUploadResume(page: Page) {
  await page.route(`${API}/resume/upload`, (route: Route) => {
    if (route.request().method() === 'POST') {
      return route.fulfill({
        status: 201,
        contentType: 'application/json',
        body: JSON.stringify({ ...MOCK_RESUME, id: 'new-resume-1', status: 'pending' }),
      })
    }
    return route.continue()
  })
}

export async function mockAnalysisList(page: Page, analyses = [MOCK_ANALYSIS]) {
  await page.route(`${API}/analysis**`, (route: Route) => {
    if (route.request().method() === 'GET') {
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ data: analyses, total: analyses.length, page: 1, limit: 20 }),
      })
    }
    return route.continue()
  })
}

export async function mockCreateAnalysis(page: Page) {
  await page.route(`${API}/analysis`, (route: Route) => {
    if (route.request().method() === 'POST') {
      return route.fulfill({
        status: 201,
        contentType: 'application/json',
        body: JSON.stringify({ ...MOCK_ANALYSIS, id: 'new-analysis-1', status: 'pending' }),
      })
    }
    return route.continue()
  })
}

export { MOCK_ANALYSIS, MOCK_AUTH, MOCK_RESUME, MOCK_USER }
