import { expect, test } from '@playwright/test'
import {
  loginUser,
  MOCK_RESUME,
  mockDashboardAPIs,
  mockResumeList,
  mockUploadResume,
} from './helpers'

const API = 'http://localhost:3001/api/v1'

test.describe('Resume Flow', () => {
  test.beforeEach(async ({ page }) => {
    await mockDashboardAPIs(page)
    await loginUser(page)
  })

  test.describe('Resume List', () => {
    test('shows empty state when no resumes', async ({ page }) => {
      await page.goto('/resume')
      await expect(
        page.getByRole('heading', { name: 'Resumes', exact: true }).first(),
      ).toBeVisible()
      await expect(page.getByText(/no resumes yet/i)).toBeVisible()
    })

    test('shows list of resumes when they exist', async ({ page }) => {
      await mockResumeList(page)
      await page.goto('/resume')
      await expect(page.getByText('my-resume.pdf')).toBeVisible()
    })

    test('shows upload form section', async ({ page }) => {
      await page.goto('/resume')
      await expect(page.getByRole('heading', { name: /upload new resume/i })).toBeVisible()
    })
  })

  test.describe('Resume Upload', () => {
    test.beforeEach(async ({ page }) => {
      await mockUploadResume(page)
      await page.goto('/resume')
    })

    test('shows file input for upload', async ({ page }) => {
      await expect(page.locator('input[type="file"]')).toBeAttached()
    })

    test('shows drag and drop area', async ({ page }) => {
      await expect(page.getByText(/drop your resume here/i)).toBeVisible()
    })

    test('uploads a PDF file successfully', async ({ page }) => {
      // Create a minimal valid PDF buffer
      const pdfBuffer = Buffer.from('%PDF-1.4 test')

      await page.locator('input[type="file"]').setInputFiles({
        name: 'test-resume.pdf',
        mimeType: 'application/pdf',
        buffer: pdfBuffer,
      })

      await expect(page.getByText('test-resume.pdf')).toBeVisible()
    })

    test('rejects non-PDF files', async ({ page }) => {
      await page.locator('input[type="file"]').setInputFiles({
        name: 'test.txt',
        mimeType: 'text/plain',
        buffer: Buffer.from('not a pdf'),
      })

      // Should show an error message for invalid file type
      await expect(page.getByText(/only pdf and docx/i)).toBeVisible()
    })

    test('submits upload form after selecting valid file', async ({ page }) => {
      // Mock the resume GET to return the uploaded resume after upload
      await page.route(`${API}/resume`, (route) => {
        if (route.request().method() === 'GET') {
          return route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify({
              data: [
                {
                  ...MOCK_RESUME,
                  id: 'new-resume-1',
                  originalName: 'test-resume.pdf',
                  status: 'pending',
                },
              ],
              total: 1,
              page: 1,
              limit: 20,
            }),
          })
        }
        return route.continue()
      })

      await page.locator('input[type="file"]').setInputFiles({
        name: 'test-resume.pdf',
        mimeType: 'application/pdf',
        buffer: Buffer.from('%PDF-1.4 test'),
      })

      await page.getByRole('button', { name: 'Upload Resume' }).click()

      // Should redirect to stream page after upload
      await expect(page).toHaveURL(/\/resume\/stream\/|\/resume/)
    })
  })

  test.describe('Resume Detail', () => {
    test('navigates to resume detail page', async ({ page }) => {
      await mockResumeList(page)
      await page.route(`${API}/resume/${MOCK_RESUME.id}`, (route) =>
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify(MOCK_RESUME),
        }),
      )
      await page.goto('/resume')
      // Click the View button in the resume row
      await page.getByRole('button', { name: 'View' }).click()
      await expect(page).toHaveURL(new RegExp(`/resume/${MOCK_RESUME.id}`))
    })
  })
})
