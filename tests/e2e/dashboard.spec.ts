import { expect, test } from '@playwright/test'
import { loginUser, mockDashboardAPIs } from './helpers'

test.describe('Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    await mockDashboardAPIs(page)
    await loginUser(page)
  })

  test('shows dashboard heading and key sections', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible()
    await expect(page.getByRole('region', { name: /summary statistics/i })).toBeVisible()
    await expect(page.getByRole('region', { name: /quick actions/i })).toBeVisible()
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

  test('signs out and redirects to login', async ({ page }) => {
    await page.route('**/api/**/auth/logout', (route) =>
      route.fulfill({ status: 200, contentType: 'application/json', body: '{}' }),
    )
    await page.getByRole('button', { name: /sign out/i }).click()
    await expect(page).toHaveURL('/login')
  })
})
