import { expect, test } from '@playwright/test'
import { loginUser, mockDashboardAPIs, mockUploadResume } from './helpers'

const API = '**/api/**'

test.describe('Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    await mockDashboardAPIs(page)
    await loginUser(page)
  })

  test('shows dashboard heading and key sections', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible()
    await expect(page.getByRole('region', { name: /summary statistics/i })).toBeVisible()
    await expect(page.getByRole('region', { name: /quick actions/i })).toBeVisible()
    await expect(page.getByRole('region', { name: /upload a new resume/i })).toHaveCount(0)
    await expect(page.getByRole('region', { name: /start a new analysis/i })).toHaveCount(0)
  })

  test('shows sidebar navigation links', async ({ page }) => {
    await expect(page.getByRole('link', { name: 'Dashboard' })).toBeVisible()
    await expect(page.getByRole('link', { name: 'Resumes' })).toBeVisible()
    await expect(page.getByRole('link', { name: 'Analyze', exact: true })).toBeVisible()
    await expect(page.getByRole('link', { name: 'Settings' })).toBeVisible()
  })

  test('navigates to resume page from quick action', async ({ page }) => {
    await page
      .getByRole('link', { name: /upload resume/i })
      .first()
      .click()
    await expect(page).toHaveURL('/resume')
  })

  test('navigates to analysis page from quick action', async ({ page }) => {
    await page
      .getByRole('link', { name: /analyze resume/i })
      .first()
      .click()
    await expect(page).toHaveURL('/analysis')
  })

  test('shows sign out button in header', async ({ page }) => {
    await expect(page.getByRole('button', { name: /sign out/i })).toBeVisible()
  })

  test('opens notifications empty state from header', async ({ page }) => {
    await page.getByRole('button', { name: /notifications/i }).click()
    await expect(page.getByRole('dialog', { name: /notifications/i })).toBeVisible()
    await expect(page.getByText('No notifications')).toBeVisible()
  })

  test('opens active notifications and routes to the related stream', async ({ page }) => {
    await mockUploadResume(page)
    await page.route(`${API}/resume/status/new-resume-1`, (route) =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          id: 'new-resume-1',
          jobId: 'resume-extraction-new-resume-1',
          status: 'processing',
          originalName: 'notify-resume.pdf',
        }),
      }),
    )

    await page.getByRole('link', { name: 'Resumes' }).click()
    await page.locator('input[type="file"]').setInputFiles({
      name: 'notify-resume.pdf',
      mimeType: 'application/pdf',
      buffer: Buffer.from('%PDF-1.4 notify'),
    })
    await page.getByRole('button', { name: 'Upload Resume' }).click()
    await expect(page).toHaveURL(/\/resume\/stream\/new-resume-1/)

    await page.getByRole('link', { name: 'Dashboard' }).click()
    await page.getByRole('button', { name: /notifications/i }).click()
    await expect(page.getByRole('dialog', { name: /notifications/i })).toBeVisible()
    await expect(page.getByText('notify-resume.pdf')).toBeVisible()
    await page.getByText('notify-resume.pdf').click()
    await expect(page).toHaveURL(/\/resume\/stream\/new-resume-1/)
  })

  test('toggles and persists the color theme from the header', async ({ page }) => {
    await page.getByRole('button', { name: /switch to dark mode/i }).click()
    await expect(page.locator('html')).toHaveClass(/dark/)
    await expect.poll(() => page.evaluate(() => localStorage.getItem('theme'))).toBe('dark')

    await page.getByRole('button', { name: /switch to light mode/i }).click()
    await expect(page.locator('html')).not.toHaveClass(/dark/)
    await expect.poll(() => page.evaluate(() => localStorage.getItem('theme'))).toBe('light')
  })

  test('signs out and redirects to login', async ({ page }) => {
    await page.route('**/api/**/auth/logout', (route) =>
      route.fulfill({ status: 200, contentType: 'application/json', body: '{}' }),
    )
    await page.getByRole('button', { name: /sign out/i }).click()
    await expect(page).toHaveURL('/login')
  })
})
