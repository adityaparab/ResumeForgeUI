import { Upload, X } from 'lucide-react'
import { useCallback, useRef, useState } from 'react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { useResumeUploadMutation } from '../hooks/useResumeUploadMutation'

const ACCEPTED_MIME_TYPES = [
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
]
const ACCEPTED_EXTENSIONS = ['.pdf', '.docx']
const MAX_BYTES = 5 * 1024 * 1024 // 5 MB

function isValidType(file: File): boolean {
  return (
    ACCEPTED_MIME_TYPES.includes(file.type) ||
    ACCEPTED_EXTENSIONS.some((ext) => file.name.toLowerCase().endsWith(ext))
  )
}

function isValidSize(file: File): boolean {
  return file.size <= MAX_BYTES
}

export function ResumeUploadForm() {
  const [file, setFile] = useState<File | null>(null)
  const [fileError, setFileError] = useState<string | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const uploadMutation = useResumeUploadMutation()

  const validateAndSetFile = useCallback((candidate: File) => {
    if (!isValidType(candidate)) {
      setFileError('Only PDF and DOCX files are accepted.')
      setFile(null)
      return
    }
    if (!isValidSize(candidate)) {
      setFileError('File must be 5 MB or smaller.')
      setFile(null)
      return
    }
    setFileError(null)
    setFile(candidate)
  }, [])

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback(() => {
    setIsDragging(false)
  }, [])

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault()
      setIsDragging(false)
      const dropped = e.dataTransfer.files[0]
      if (dropped) validateAndSetFile(dropped)
    },
    [validateAndSetFile],
  )

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const selected = e.target.files?.[0]
      if (selected) validateAndSetFile(selected)
    },
    [validateAndSetFile],
  )

  function handleReset() {
    setFile(null)
    setFileError(null)
    /* v8 ignore next */
    if (inputRef.current) inputRef.current.value = ''
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!file) {
      setFileError('Please select a file to upload.')
      return
    }
    const idempotencyKey = `${file.name}-${file.size}-${file.lastModified}`
    uploadMutation.mutate({ file, idempotencyKey })
  }

  return (
    <form onSubmit={handleSubmit} noValidate aria-label="Upload resume">
      <div className="space-y-4">
        {/* Drop zone */}
        {/* biome-ignore lint/a11y/useSemanticElements: div needed for drag-and-drop with nested input */}
        <div
          className={cn(
            'flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed p-10 text-center transition-colors',
            isDragging
              ? 'border-primary bg-primary/5'
              : 'border-border bg-muted/30 hover:border-primary/50 hover:bg-muted/50',
            file && 'border-primary/50 bg-primary/5',
          )}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => inputRef.current?.click()}
          role="button"
          tabIndex={0}
          aria-label="Drop zone: click or drag to upload a resume"
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') inputRef.current?.click()
          }}
        >
          <Upload className="mb-3 size-10 text-muted-foreground" />
          {file ? (
            <p className="text-sm font-medium text-foreground">{file.name}</p>
          ) : (
            <>
              <p className="text-sm font-medium text-foreground">
                Drop your resume here or click to browse
              </p>
              <p className="mt-1 text-xs text-muted-foreground">PDF or DOCX · max 5 MB</p>
            </>
          )}
          <input
            ref={inputRef}
            type="file"
            className="sr-only"
            accept={ACCEPTED_EXTENSIONS.join(',')}
            onChange={handleInputChange}
            aria-label="File input"
            data-testid="file-input"
          />
        </div>

        {/* Validation error */}
        {fileError && (
          <p className="text-xs text-destructive" role="alert">
            {fileError}
          </p>
        )}

        {/* Actions */}
        <div className="flex items-center justify-end gap-3">
          {file && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleReset}
              aria-label="Remove selected file"
            >
              <X className="mr-1 size-4" />
              Remove
            </Button>
          )}
          <Button
            type="submit"
            disabled={!file || uploadMutation.isPending}
            aria-busy={uploadMutation.isPending}
          >
            {uploadMutation.isPending ? 'Uploading…' : 'Upload Resume'}
          </Button>
        </div>
      </div>
    </form>
  )
}
