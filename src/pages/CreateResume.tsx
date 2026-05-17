import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded'
import { Alert, Box, Button, Paper, Stack, TextField, Typography } from '@mui/material'
import { useState } from 'react'
import { useNavigate } from 'react-router'
import { toast } from '@/components/common/toast'
import { EditableStructuredContent } from '@/features/resume/components/EditableStructuredContent'
import { resumeApi } from '@/lib/api-client'
import type { StructuredContent } from '@/lib/schemas/resume.schema'

const DEFAULT_CONTENT: StructuredContent = {
  basics: {
    name: '',
    label: '',
    email: '',
    phone: '',
    url: '',
    summary: '',
    location: {
      address: '',
      postalCode: '',
      city: '',
      countryCode: '',
      region: '',
    },
    profiles: [{ network: '', username: '', url: '' }],
  },
  work: [
    {
      name: '',
      position: '',
      url: '',
      startDate: '',
      endDate: '',
      summary: '',
      highlights: [],
    },
  ],
  education: [
    {
      institution: '',
      url: '',
      area: '',
      studyType: '',
      startDate: '',
      endDate: '',
      score: '',
      courses: [],
    },
  ],
  skills: [{ name: '', level: '', keywords: [] }],
  projects: [
    {
      name: '',
      startDate: '',
      endDate: '',
      description: '',
      highlights: [],
      url: '',
    },
  ],
  awards: [{ title: '', date: '', awarder: '', summary: '' }],
  certificates: [{ name: '', date: '', issuer: '', url: '' }],
  publications: [{ name: '', publisher: '', releaseDate: '', url: '', summary: '' }],
  languages: [{ language: '', fluency: '' }],
  interests: [{ name: '', keywords: [] }],
  references: [{ name: '', reference: '' }],
  volunteer: [
    {
      organization: '',
      position: '',
      url: '',
      startDate: '',
      endDate: '',
      summary: '',
      highlights: [],
    },
  ],
}

export default function CreateResume() {
  const navigate = useNavigate()
  const [originalName, setOriginalName] = useState('')
  const [nameError, setNameError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  const handleSubmit = async (content: StructuredContent) => {
    const trimmedName = originalName.trim()
    if (!trimmedName) {
      setNameError('Resume name is required.')
      return
    }
    setNameError(null)
    setIsSubmitting(true)
    setSubmitError(null)
    try {
      const result = await resumeApi.createFromContent(
        trimmedName,
        content as Record<string, unknown>,
      )
      toast.success('Resume created successfully!')
      navigate(`/resume/${result.id}`)
    } catch {
      setSubmitError('Failed to create resume. The server may not support this operation.')
      throw new Error('create failed')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Stack spacing={3}>
      <Box>
        <Button
          onClick={() => navigate('/resume')}
          startIcon={<ArrowBackRoundedIcon />}
          type="button"
          variant="text"
        >
          Back to Resumes
        </Button>
      </Box>

      <Paper
        elevation={0}
        sx={{ border: 1, borderColor: 'divider', borderRadius: 2, p: { xs: 2, sm: 3 } }}
      >
        <Typography component="h1" variant="h4" sx={{ mb: 0.75 }}>
          Create Resume
        </Typography>
        <Typography color="text.secondary" variant="body2">
          Fill in your resume details below and click Create Resume when ready.
        </Typography>
      </Paper>

      <Paper
        elevation={0}
        sx={{ border: 1, borderColor: 'divider', borderRadius: 2, p: { xs: 2, sm: 3 } }}
      >
        <Typography component="h2" variant="h6" sx={{ mb: 2 }}>
          Resume Name
        </Typography>
        <TextField
          autoFocus
          error={Boolean(nameError)}
          fullWidth
          helperText={nameError}
          label="Resume name"
          onChange={(e) => setOriginalName(e.target.value)}
          placeholder="e.g. My Software Engineer Resume"
          required
          size="small"
          value={originalName}
        />
      </Paper>

      {submitError && <Alert severity="error">{submitError}</Alert>}

      <EditableStructuredContent
        content={DEFAULT_CONTENT}
        mode="create"
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting}
      />
    </Stack>
  )
}
