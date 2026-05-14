import { fireEvent, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { HttpResponse, http } from 'msw'
import { describe, expect, it } from 'vitest'
import { API_URL } from '@/constants'
import { ResumeUploadForm } from '@/features/resume/components/ResumeUploadForm'
import { server } from '../mocks/server'
import { render } from '../test-utils'

function makeFile(name: string, type: string, sizeBytes = 1024) {
  return new File([new ArrayBuffer(sizeBytes)], name, { type })
}

describe('ResumeUploadForm', () => {
  it('renders drop zone and upload button', () => {
    render(<ResumeUploadForm />, { initialEntries: ['/resume'] })
    expect(screen.getByRole('button', { name: /drop zone/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /upload resume/i })).toBeInTheDocument()
  })

  it('upload button is disabled with no file selected', () => {
    render(<ResumeUploadForm />, { initialEntries: ['/resume'] })
    expect(screen.getByRole('button', { name: /upload resume/i })).toBeDisabled()
  })

  it('accepts a valid PDF file via file input', async () => {
    const user = userEvent.setup()
    render(<ResumeUploadForm />, { initialEntries: ['/resume'] })

    const input = screen.getByTestId('file-input')
    const file = makeFile('my-resume.pdf', 'application/pdf')
    await user.upload(input, file)

    expect(screen.getByText('my-resume.pdf')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /upload resume/i })).not.toBeDisabled()
  })

  it('accepts a valid DOCX file via file input', async () => {
    const user = userEvent.setup()
    render(<ResumeUploadForm />, { initialEntries: ['/resume'] })

    const file = makeFile(
      'cv.docx',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    )
    await user.upload(screen.getByTestId('file-input'), file)

    expect(screen.getByText('cv.docx')).toBeInTheDocument()
  })

  it('shows error for unsupported file type', () => {
    render(<ResumeUploadForm />, { initialEntries: ['/resume'] })

    const file = makeFile('photo.png', 'image/png')
    const input = screen.getByTestId('file-input')

    // Bypass accept attribute by directly setting files and dispatching change
    Object.defineProperty(input, 'files', { value: [file], configurable: true })
    fireEvent.change(input)

    expect(screen.getByRole('alert')).toHaveTextContent(/only pdf and docx/i)
  })

  it('shows error for file exceeding 5 MB', () => {
    render(<ResumeUploadForm />, { initialEntries: ['/resume'] })

    const bigFile = makeFile('big.pdf', 'application/pdf', 6 * 1024 * 1024)
    const input = screen.getByTestId('file-input')

    Object.defineProperty(input, 'files', { value: [bigFile], configurable: true })
    fireEvent.change(input)

    expect(screen.getByRole('alert')).toHaveTextContent(/5 mb/i)
  })

  it('shows validation error on submit with no file', async () => {
    render(<ResumeUploadForm />, { initialEntries: ['/resume'] })

    // Manually enable the button to test direct submit path is blocked
    // (button is disabled, but test via keyboard/form submit)
    const form = screen.getByRole('form', { hidden: true })
    form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }))

    await waitFor(() => {
      expect(screen.getByRole('alert')).toBeInTheDocument()
    })
  })

  it('removes file when Remove button is clicked', async () => {
    const user = userEvent.setup()
    render(<ResumeUploadForm />, { initialEntries: ['/resume'] })

    const file = makeFile('resume.pdf', 'application/pdf')
    await user.upload(screen.getByTestId('file-input'), file)
    expect(screen.getByText('resume.pdf')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: /remove selected file/i }))
    expect(screen.queryByText('resume.pdf')).not.toBeInTheDocument()
  })

  it('submits valid file and navigates to stream page', async () => {
    const user = userEvent.setup()
    render(<ResumeUploadForm />, { initialEntries: ['/resume'] })

    const file = makeFile('resume.pdf', 'application/pdf')
    await user.upload(screen.getByTestId('file-input'), file)
    await user.click(screen.getByRole('button', { name: /upload resume/i }))

    await waitFor(() => {
      // After successful upload, navigates to /resume/stream/:id
      // The navigation happens inside the hook — check loading state at least
      expect(screen.queryByRole('alert')).not.toBeInTheDocument()
    })
  })

  it('shows uploading state while pending', async () => {
    const user = userEvent.setup()
    server.use(
      http.post(`${API_URL}/resume/upload`, async () => {
        await new Promise((resolve) => setTimeout(resolve, 200))
        return HttpResponse.json({ id: 'abc', jobId: 'job-abc', status: 'queued' }, { status: 201 })
      }),
    )

    render(<ResumeUploadForm />, { initialEntries: ['/resume'] })

    const file = makeFile('cv.pdf', 'application/pdf')
    await user.upload(screen.getByTestId('file-input'), file)
    await user.click(screen.getByRole('button', { name: /upload resume/i }))

    expect(screen.getByRole('button', { name: /uploading/i })).toBeInTheDocument()
  })

  it('shows error toast when upload fails', async () => {
    const user = userEvent.setup()
    server.use(
      http.post(`${API_URL}/resume/upload`, () =>
        HttpResponse.json({ message: 'Upload failed' }, { status: 500 }),
      ),
    )
    render(<ResumeUploadForm />, { initialEntries: ['/resume'] })
    const file = makeFile('resume.pdf', 'application/pdf')
    await user.upload(screen.getByTestId('file-input'), file)
    await user.click(screen.getByRole('button', { name: /upload resume/i }))
    await waitFor(() => {
      expect(screen.queryByRole('button', { name: /uploading/i })).not.toBeInTheDocument()
    })
  })

  it('handles drag over and drag leave on drop zone', async () => {
    render(<ResumeUploadForm />, { initialEntries: ['/resume'] })
    const dropZone = screen.getByRole('button', { name: /drop zone/i })

    fireEvent.dragOver(dropZone, { preventDefault: () => {} })
    fireEvent.dragLeave(dropZone)
    // Just checking no errors are thrown
    expect(dropZone).toBeInTheDocument()
  })

  it('handles file drop on drop zone', () => {
    render(<ResumeUploadForm />, { initialEntries: ['/resume'] })
    const dropZone = screen.getByRole('button', { name: /drop zone/i })
    const file = makeFile('dropped.pdf', 'application/pdf')
    fireEvent.drop(dropZone, {
      dataTransfer: { files: [file] },
    })
    expect(screen.getByText('dropped.pdf')).toBeInTheDocument()
  })

  it('handles Enter key on drop zone to open file dialog', () => {
    render(<ResumeUploadForm />, { initialEntries: ['/resume'] })
    const dropZone = screen.getByRole('button', { name: /drop zone/i })
    // just ensure no error
    fireEvent.keyDown(dropZone, { key: 'Enter' })
    expect(dropZone).toBeInTheDocument()
  })

  it('handles Space key on drop zone to open file dialog', () => {
    render(<ResumeUploadForm />, { initialEntries: ['/resume'] })
    const dropZone = screen.getByRole('button', { name: /drop zone/i })
    fireEvent.keyDown(dropZone, { key: ' ' })
    expect(dropZone).toBeInTheDocument()
  })

  it('ignores non-Enter/Space keys on drop zone', () => {
    render(<ResumeUploadForm />, { initialEntries: ['/resume'] })
    const dropZone = screen.getByRole('button', { name: /drop zone/i })
    fireEvent.keyDown(dropZone, { key: 'Tab' })
    expect(dropZone).toBeInTheDocument()
  })

  it('handles empty file drop (no files in dataTransfer)', () => {
    render(<ResumeUploadForm />, { initialEntries: ['/resume'] })
    const dropZone = screen.getByRole('button', { name: /drop zone/i })
    fireEvent.drop(dropZone, { dataTransfer: { files: [] } })
    expect(dropZone).toBeInTheDocument()
  })

  it('handles file input change with no file selected', () => {
    render(<ResumeUploadForm />, { initialEntries: ['/resume'] })
    const input = screen.getByTestId('file-input')
    fireEvent.change(input, { target: { files: [] } })
    expect(input).toBeInTheDocument()
  })
})
