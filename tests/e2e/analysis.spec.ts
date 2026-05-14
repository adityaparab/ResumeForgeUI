import { expect, test } from '@playwright/test'
import {
  loginUser,
  MOCK_ANALYSIS,
  MOCK_RESUME,
  mockAnalysisList,
  mockCreateAnalysis,
  mockDashboardAPIs,
} from './helpers'

const API = 'http://localhost:3001/api/v1'

test.describe('Analysis Flow', () => {
  test.beforeEach(async ({ page }) => {
    await mockDashboardAPIs(page)
    await loginUser(page)
  })

  test.describe('Analysis List', () => {
    test('shows empty state when no analyses', async ({ page }) => {
      await page.goto('/analysis')
      await expect(page.getByRole('heading', { name: 'Analyses' })).toBeVisible()
      await expect(page.getByText(/no analyses yet/i)).toBeVisible()
    })

    test('shows list of analyses when they exist', async ({ page }) => {
      await mockAnalysisList(page)
      await page.goto('/analysis')
      await expect(page.getByRole('button', { name: 'View Result' })).toBeVisible()
    })

    test('shows new analysis form section', async ({ page }) => {
      await page.goto('/analysis')
      await expect(page.getByRole('heading', { name: /new analysis/i })).toBeVisible()
    })
  })

  test.describe('Create Analysis', () => {
    test.beforeEach(async ({ page }) => {
      // Mock resume list to provide options in the select
      await page.route(`${API}/resume**`, (route) => {
        if (route.request().method() === 'GET') {
          return route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify({
              data: [MOCK_RESUME],
              total: 1,
              page: 1,
              limit: 20,
            }),
          })
        }
        return route.continue()
      })
      await mockCreateAnalysis(page)
      await page.goto('/analysis')
    })

    test('shows resume select and job description fields', async ({ page }) => {
      await expect(page.locator('#resumeId')).toBeVisible()
      await expect(page.getByLabel(/job description/i)).toBeVisible()
    })

    test('shows validation error when submitting empty form', async ({ page }) => {
      await page
        .getByRole('button', { name: /analyze|submit/i })
        .last()
        .click()
      await expect(page.getByRole('alert').first()).toBeVisible()
    })

    test('submits analysis form with valid data', async ({ page }) => {
      // Select a resume
      await page.locator('#resumeId').selectOption({ index: 1 })

      // Fill job description
      await page
        .getByLabel(/job description/i)
        .fill(
          'We are looking for a Senior Software Engineer with 5+ years of experience in React and TypeScript. The candidate should have strong knowledge of distributed systems and cloud architecture.',
        )

      await page.getByRole('button', { name: 'Analyze' }).last().click()

      // Should redirect to stream page after creating analysis
      await expect(page).toHaveURL(/\/analysis\/stream\/|\/analysis/)
    })
  })

  test.describe('Analysis Result', () => {
    test('shows analysis result page', async ({ page }) => {
      await page.route(`${API}/analysis/${MOCK_ANALYSIS.id}`, (route) =>
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify(MOCK_ANALYSIS),
        }),
      )
      await page.goto(`/analysis/${MOCK_ANALYSIS.id}`)
      await expect(page.getByText(/match score/i)).toBeVisible()
    })
  })
})
