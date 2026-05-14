import { expect, test } from '@playwright/test'

const API = 'http://localhost:3001/api/v1'

test.describe('Authentication', () => {
  test.describe('Login', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/login')
    })

    test('shows login form', async ({ page }) => {
      await expect(page.getByText('Welcome back')).toBeVisible()
      await expect(page.getByLabel(/email address/i)).toBeVisible()
      await expect(page.getByLabel(/password/i)).toBeVisible()
      await expect(page.getByRole('button', { name: 'Sign in' })).toBeVisible()
    })

    test('shows validation errors for empty submission', async ({ page }) => {
      await page.getByRole('button', { name: 'Sign in' }).click()
      await expect(page.getByRole('alert').first()).toBeVisible()
    })

    test('shows validation error for invalid email', async ({ page }) => {
      await page.getByLabel(/email address/i).fill('not-an-email')
      await page.getByLabel(/password/i).fill('password123')
      await page.getByRole('button', { name: 'Sign in' }).click()
      await expect(page.getByRole('alert').first()).toBeVisible()
    })

    test('navigates to register page', async ({ page }) => {
      await page.getByRole('link', { name: 'Create one' }).click()
      await expect(page).toHaveURL('/register')
    })

    test('redirects to dashboard after successful login', async ({ page }) => {
      await page.route(`${API}/auth/login`, (route) =>
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            accessToken: 'mock-access-token',
            refreshToken: 'mock-refresh-token',
            tokenType: 'Bearer',
            expiresIn: '15m',
            user: { id: 'user-1', email: 'user@example.com' },
          }),
        }),
      )

      await page.getByLabel(/email address/i).fill('user@example.com')
      await page.getByLabel(/password/i).fill('password123')
      await page.getByRole('button', { name: 'Sign in' }).click()

      await expect(page).toHaveURL('/')
    })
  })

  test.describe('Register', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/register')
    })

    test('shows register form', async ({ page }) => {
      await expect(page.getByText('Create an account')).toBeVisible()
      await expect(page.getByLabel(/email/i)).toBeVisible()
      await expect(page.getByLabel(/password/i).first()).toBeVisible()
    })

    test('shows validation errors for empty submission', async ({ page }) => {
      await page.getByRole('button', { name: 'Create account' }).click()
      await expect(page.getByRole('alert').first()).toBeVisible()
    })

    test('navigates to login page', async ({ page }) => {
      await page.getByRole('link', { name: 'Sign in' }).click()
      await expect(page).toHaveURL('/login')
    })

    test('redirects to dashboard after successful registration', async ({ page }) => {
      await page.route(`${API}/auth/register`, (route) =>
        route.fulfill({
          status: 201,
          contentType: 'application/json',
          body: JSON.stringify({
            accessToken: 'mock-access-token',
            refreshToken: 'mock-refresh-token',
            tokenType: 'Bearer',
            expiresIn: '15m',
            user: { id: 'user-1', email: 'newuser@example.com' },
          }),
        }),
      )

      await page.getByLabel(/email/i).fill('newuser@example.com')
      const passwordFields = page.getByLabel(/password/i)
      await passwordFields.first().fill('Password123!')
      if ((await passwordFields.count()) > 1) {
        await passwordFields.nth(1).fill('Password123!')
      }
      await page.getByRole('button', { name: 'Create account' }).click()

      await expect(page).toHaveURL('/')
    })
  })

  test.describe('Protected routes', () => {
    test('redirects unauthenticated users to login', async ({ page }) => {
      await page.goto('/')
      await expect(page).toHaveURL('/login')
    })

    test('redirects unauthenticated users from /resume to login', async ({ page }) => {
      await page.goto('/resume')
      await expect(page).toHaveURL('/login')
    })

    test('redirects unauthenticated users from /analysis to login', async ({ page }) => {
      await page.goto('/analysis')
      await expect(page).toHaveURL('/login')
    })
  })
})
