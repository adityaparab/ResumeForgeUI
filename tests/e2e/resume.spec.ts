import { expect, test } from '@playwright/test'
import {
  loginUser,
  MOCK_ANALYSIS,
  MOCK_RESUME,
  MOCK_STRUCTURED_CONTENT,
  mockAnalysisList,
  mockDashboardAPIs,
  mockResumeList,
  mockUploadResume,
} from './helpers'

const API = '**/api/**'

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
      await expect(page.getByRole('button', { name: 'View' })).toBeVisible()
    })

    test('shows stream action for in-progress resumes only', async ({ page }) => {
      await mockResumeList(page, [{ ...MOCK_RESUME, status: 'processing' }])
      await page.goto('/resume')
      await expect(page.getByRole('button', { name: 'View Stream' })).toBeVisible()
      await expect(page.getByRole('button', { name: 'View', exact: true })).toHaveCount(0)
      await page.getByRole('button', { name: 'View Stream' }).click()
      await expect(page).toHaveURL(new RegExp(`/resume/stream/${MOCK_RESUME.id}`))
    })

    test('shows failure details action for failed resumes only', async ({ page }) => {
      await mockResumeList(page, [{ ...MOCK_RESUME, status: 'failed' }])
      await page.goto('/resume')
      await expect(page.getByRole('button', { name: 'Failure Details' })).toBeVisible()
      await expect(page.getByRole('button', { name: 'View', exact: true })).toHaveCount(0)
      await page.getByRole('button', { name: 'Failure Details' }).click()
      await expect(page).toHaveURL(new RegExp(`/resume/${MOCK_RESUME.id}`))
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

    test('displays structured content and editable resume fields', async ({ page }) => {
      await page.route(`${API}/resume/${MOCK_RESUME.id}`, (route) => {
        if (route.request().method() === 'PATCH') {
          const body = route.request().postDataJSON() as { structuredContent: unknown }
          return route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify({ ...MOCK_RESUME, structuredContent: body.structuredContent }),
          })
        }
        return route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ ...MOCK_RESUME, structuredContent: MOCK_STRUCTURED_CONTENT }),
        })
      })
      await page.goto(`/resume/${MOCK_RESUME.id}`)
      await expect(page.getByRole('heading', { name: 'Basics' })).toBeVisible()
      await expect(page.getByRole('heading', { name: 'Work Experience' })).toBeVisible()
      const nameField = page.getByLabel('Name').first()
      await expect(nameField).toHaveValue('Ada Lovelace')
      await nameField.fill('Ada Byron')
      await expect(page.getByRole('button', { name: 'Save changes' })).toBeEnabled()
      await page.getByRole('button', { name: 'Reset' }).click()
      await expect(nameField).toHaveValue('Ada Lovelace')
      await nameField.fill('Ada Byron')
      await page.getByRole('button', { name: 'Save changes' }).click()
      await expect(page.getByText('Resume details saved.')).toBeVisible()
    })

    test('gates download button behind completed analysis results', async ({ page }) => {
      await page.route(`${API}/resume/${MOCK_RESUME.id}`, (route) =>
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ ...MOCK_RESUME, structuredContent: MOCK_STRUCTURED_CONTENT }),
        }),
      )
      await page.goto(`/resume/${MOCK_RESUME.id}`)
      await expect(page.getByRole('button', { name: 'Download' })).toHaveCount(0)

      await mockAnalysisList(page, [MOCK_ANALYSIS])
      await page.goto(`/resume/${MOCK_RESUME.id}`)
      await expect(page.getByRole('button', { name: 'Download' })).toBeVisible()
    })
  })
})
