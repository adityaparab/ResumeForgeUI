import { Box, Button, HStack, Icon, Spinner, Text, VStack } from '@chakra-ui/react'
import { Upload, X } from 'lucide-react'
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
    <Box as="form" onSubmit={handleSubmit} noValidate aria-label="Upload resume">
      <VStack gap={4} align="stretch">
        {/* Drop zone */}
        <Box
          display="flex"
          flexDirection="column"
          alignItems="center"
          justifyContent="center"
          borderRadius="xl"
          borderWidth="2px"
          borderStyle="dashed"
          borderColor={isDragging || file ? 'purple.500' : 'border.subtle'}
          bg={isDragging || file ? 'purple.subtle' : 'bg.subtle'}
          p={10}
          textAlign="center"
          cursor="pointer"
          transition="all 0.15s"
          _hover={{ borderColor: 'purple.400', bg: 'bg.subtle' }}
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
          <Icon as={Upload} boxSize={10} color="fg.muted" mb={3} />
          {file ? (
            <Text fontSize="sm" fontWeight="medium">
              {file.name}
            </Text>
          ) : (
            <>
              <Text fontSize="sm" fontWeight="medium">
                Drop your resume here or click to browse
              </Text>
              <Text mt={1} fontSize="xs" color="fg.muted">
                PDF or DOCX · max 5 MB
              </Text>
            </>
          )}
          <input
            ref={inputRef}
            type="file"
            style={{ display: 'none' }}
            accept={ACCEPTED_EXTENSIONS.join(',')}
            onChange={handleInputChange}
            aria-label="File input"
            data-testid="file-input"
          />
        </Box>

        {/* Validation error */}
        {fileError && (
          <Text fontSize="xs" color="red.500" role="alert">
            {fileError}
          </Text>
        )}

        {/* Actions */}
        <HStack justify="flex-end" gap={3}>
          {file && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleReset}
              aria-label="Remove selected file"
            >
              <Icon as={X} />
              Remove
            </Button>
          )}
          <Button
            type="submit"
            colorPalette="purple"
            disabled={!file || uploadMutation.isPending}
            aria-busy={uploadMutation.isPending}
          >
            {uploadMutation.isPending ? (
              <>
                <Spinner size="sm" /> Uploading…
              </>
            ) : (
              'Upload Resume'
            )}
          </Button>
        </HStack>
      </VStack>
    </Box>
  )
}
