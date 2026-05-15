import CloseRoundedIcon from '@mui/icons-material/CloseRounded'
import InsertDriveFileRoundedIcon from '@mui/icons-material/InsertDriveFileRounded'
import UploadFileRoundedIcon from '@mui/icons-material/UploadFileRounded'
import { Alert, Box, Button, CircularProgress, Paper, Stack, Typography } from '@mui/material'
import { alpha } from '@mui/material/styles'
import { useCallback, useRef, useState } from 'react'
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
    <Box component="form" onSubmit={handleSubmit} noValidate aria-label="Upload resume">
      <Paper
        elevation={0}
        sx={{ border: 1, borderColor: 'divider', borderRadius: 2, p: { xs: 2, sm: 3 } }}
      >
        <Stack spacing={2.5}>
          <Box
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
            sx={{
              alignItems: 'center',
              bgcolor: (theme) =>
                file || isDragging
                  ? alpha(theme.palette.primary.main, 0.06)
                  : theme.palette.action.hover,
              border: 2,
              borderColor: file || isDragging ? 'primary.main' : 'divider',
              borderRadius: 2,
              borderStyle: 'dashed',
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              gap: 1,
              minHeight: { xs: 220, sm: 260 },
              p: { xs: 3, sm: 5 },
              textAlign: 'center',
              transition: (theme) => theme.transitions.create(['background-color', 'border-color']),
              '&:hover': {
                bgcolor: (theme) => alpha(theme.palette.primary.main, 0.06),
                borderColor: 'primary.main',
              },
              '&:focus-visible': {
                outline: '3px solid',
                outlineColor: 'primary.light',
                outlineOffset: 3,
              },
            }}
          >
            <Box
              sx={{
                alignItems: 'center',
                bgcolor: 'background.paper',
                border: 1,
                borderColor: 'divider',
                borderRadius: 2,
                color: file ? 'primary.main' : 'text.secondary',
                display: 'flex',
                height: 56,
                justifyContent: 'center',
                width: 56,
              }}
            >
              {file ? (
                <InsertDriveFileRoundedIcon fontSize="large" />
              ) : (
                <UploadFileRoundedIcon fontSize="large" />
              )}
            </Box>
            {file ? (
              <Stack spacing={0.5} sx={{ alignItems: 'center' }}>
                <Typography variant="subtitle1">{file.name}</Typography>
                <Typography color="text.secondary" variant="body2">
                  {(file.size / 1024).toFixed(1)} KB selected
                </Typography>
              </Stack>
            ) : (
              <>
                <Typography variant="subtitle1">
                  Drop your resume here or click to browse
                </Typography>
                <Typography color="text.secondary" variant="body2">
                  PDF or DOCX, max 5 MB
                </Typography>
              </>
            )}
            <input
              ref={inputRef}
              type="file"
              accept={ACCEPTED_EXTENSIONS.join(',')}
              onChange={handleInputChange}
              aria-label="File input"
              data-testid="file-input"
              style={{ display: 'none' }}
            />
          </Box>

          {fileError && (
            <Alert severity="error" role="alert">
              {fileError}
            </Alert>
          )}

          <Stack
            direction={{ xs: 'column-reverse', sm: 'row' }}
            spacing={1.5}
            sx={{ justifyContent: 'flex-end' }}
          >
            {file && (
              <Button
                type="button"
                variant="text"
                onClick={handleReset}
                aria-label="Remove selected file"
                startIcon={<CloseRoundedIcon />}
              >
                Remove
              </Button>
            )}
            <Button
              type="submit"
              variant="contained"
              disabled={!file || uploadMutation.isPending}
              aria-busy={uploadMutation.isPending}
              startIcon={
                uploadMutation.isPending ? (
                  <CircularProgress color="inherit" size={18} />
                ) : (
                  <UploadFileRoundedIcon />
                )
              }
            >
              {uploadMutation.isPending ? 'Uploading...' : 'Upload Resume'}
            </Button>
          </Stack>
        </Stack>
      </Paper>
    </Box>
  )
}
