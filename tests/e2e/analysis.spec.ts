import { expect, test } from '@playwright/test'
import {
  loginUser,
  MOCK_ANALYSIS,
  MOCK_RESUME,
  mockAnalysisList,
  mockCreateAnalysis,
  mockDashboardAPIs,
  mockResumeList,
  mockUploadResume,
} from './helpers'

const API = '**/api/**'

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
      await expect(page.getByRole('button', { name: 'Interview Prep' })).toBeVisible()
    })

    test('shows new analysis form section', async ({ page }) => {
      await mockResumeList(page)
      await page.goto('/analysis')
      await expect(page.getByRole('heading', { name: /new analysis/i })).toBeVisible()
    })

    test('shows upload fallback when no completed resumes exist', async ({ page }) => {
      await page.goto('/analysis')
      await expect(page.getByRole('heading', { name: /upload resume/i })).toBeVisible()
      await expect(page.getByText(/drop your resume here/i)).toBeVisible()
    })

    test('shows stream action for in-progress analyses only', async ({ page }) => {
      await mockAnalysisList(page, [{ ...MOCK_ANALYSIS, status: 'processing' }])
      await page.goto('/analysis')
      await expect(page.getByRole('button', { name: 'View Stream' })).toBeVisible()
      await expect(page.getByRole('button', { name: 'View Result' })).toHaveCount(0)
      await expect(page.getByRole('button', { name: 'Interview Prep' })).toHaveCount(0)
      await page.getByRole('button', { name: 'View Stream' }).click()
      await expect(page).toHaveURL(new RegExp(`/analysis/stream/${MOCK_ANALYSIS.id}`))
    })

    test('shows failure details action for failed analyses only', async ({ page }) => {
      await mockAnalysisList(page, [{ ...MOCK_ANALYSIS, status: 'failed' }])
      await page.goto('/analysis')
      await expect(page.getByRole('button', { name: 'Failure Details' })).toBeVisible()
      await expect(page.getByRole('button', { name: 'View Result' })).toHaveCount(0)
      await expect(page.getByRole('button', { name: 'Interview Prep' })).toHaveCount(0)
      await page.getByRole('button', { name: 'Failure Details' }).click()
      await expect(page).toHaveURL(new RegExp(`/analysis/${MOCK_ANALYSIS.id}`))
    })

    test('uploads resume from fallback and navigates to resume stream', async ({ page }) => {
      await mockUploadResume(page)
      await page.goto('/analysis')
      await page.locator('input[type="file"]').setInputFiles({
        name: 'fallback-resume.pdf',
        mimeType: 'application/pdf',
        buffer: Buffer.from('%PDF-1.4 fallback'),
      })
      await page.getByRole('button', { name: 'Upload Resume' }).click()
      await expect(page).toHaveURL(/\/resume\/stream\/new-resume-1/)
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
