import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded'
import DownloadRoundedIcon from '@mui/icons-material/DownloadRounded'
import { Alert, Box, Button, Chip, Paper, Stack, Typography } from '@mui/material'
import type { ChipProps } from '@mui/material/Chip'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router'
import LoadingSpinner from '@/components/common/LoadingSpinner'
import { toast } from '@/components/common/toast'
import { EditableStructuredContent } from '@/features/resume/components/EditableStructuredContent'
import { analysisApi, resumeApi } from '@/lib/api-client'
import type { StructuredContent } from '@/lib/schemas/resume.schema'

const STATUS_CHIP: Record<string, ChipProps['color']> = {
  completed: 'success',
  failed: 'error',
  processing: 'info',
  queued: 'warning',
}

export default function ResumeDetail() {
  const { resumeId } = useParams<{ resumeId: string }>()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [draftContent, setDraftContent] = useState<StructuredContent | null>(null)

  const {
    data: resume,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ['resume', resumeId],
    queryFn: () => {
      if (!resumeId) throw new Error('Missing resume ID')
      return resumeApi.getById(resumeId)
    },
    enabled: !!resumeId,
  })

  const { data: analyses } = useQuery({
    queryKey: ['analysis-for-resume', resumeId],
    queryFn: () => analysisApi.list(1, 100),
    enabled: !!resumeId,
  })

  const updateResumeMutation = useMutation({
    mutationFn: (structuredContent: StructuredContent) => {
      if (!resumeId) throw new Error('Missing resume ID')
      return resumeApi.updateStructuredContent(resumeId, structuredContent)
    },
    onSuccess: (updatedResume) => {
      queryClient.setQueryData(['resume', resumeId], updatedResume)
      setDraftContent(updatedResume.structuredContent ?? null)
      toast.success('Resume details saved.')
    },
    onError: () => {
      toast.error('Could not save resume details.')
    },
  })

  const originalContent = resume?.structuredContent ?? null

  useEffect(() => {
    setDraftContent(originalContent)
  }, [originalContent])

  const hasAnalysisResult = Boolean(
    analyses?.data.some(
      (analysis) =>
        analysis.resumeId === resumeId &&
        analysis.status === 'completed' &&
        Boolean(analysis.result),
    ),
  )

  const isDirty =
    draftContent !== null && JSON.stringify(draftContent) !== JSON.stringify(originalContent)

  const handleDownload = async () => {
    if (!resumeId) return
    try {
      const blob = await resumeApi.download(resumeId)
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      /* v8 ignore next */
      a.download = resume?.originalName ?? 'resume.pdf'
      a.click()
      URL.revokeObjectURL(url)
    } catch {
      toast.error('Could not download resume.')
    }
  }

  if (!resumeId) {
    return (
      <Paper elevation={0} sx={{ border: 1, borderColor: 'divider', borderRadius: 2, p: 3 }}>
        <Alert severity="error" role="alert">
          Invalid resume ID.
        </Alert>
      </Paper>
    )
  }

  if (isLoading) {
    return (
      <Paper
        elevation={0}
        sx={{
          border: 1,
          borderColor: 'divider',
          borderRadius: 2,
          display: 'grid',
          minHeight: 256,
          placeItems: 'center',
        }}
      >
        <LoadingSpinner label="Loading resume" />
      </Paper>
    )
  }

  if (isError || !resume) {
    return (
      <Paper elevation={0} sx={{ border: 1, borderColor: 'divider', borderRadius: 2, p: 3 }}>
        <Alert severity="error" role="alert">
          Failed to load resume.
        </Alert>
      </Paper>
    )
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
        <Stack
          direction={{ xs: 'column', md: 'row' }}
          spacing={2}
          sx={{ alignItems: { xs: 'flex-start', md: 'center' }, justifyContent: 'space-between' }}
        >
          <Box>
            <Typography component="h1" variant="h4">
              {resume.originalName}
            </Typography>
            <Typography
              color="text.secondary"
              sx={{ fontFamily: 'monospace', mt: 0.75 }}
              variant="body2"
            >
              {resumeId}
            </Typography>
          </Box>
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={1.25}
            sx={{ alignItems: { xs: 'stretch', sm: 'center' } }}
          >
            <Chip
              color={STATUS_CHIP[resume.status] ?? 'default'}
              label={resume.status}
              size="small"
            />
            {resume.status === 'completed' && hasAnalysisResult && (
              <Button
                onClick={handleDownload}
                startIcon={<DownloadRoundedIcon />}
                type="button"
                variant="outlined"
              >
                Download
              </Button>
            )}
          </Stack>
        </Stack>
      </Paper>

      {resume.status === 'failed' && !resume.structuredContent && (
        <Alert severity="error" role="alert">
          {resume.error ?? 'Resume extraction failed.'}
        </Alert>
      )}

      {draftContent ? (
        <EditableStructuredContent
          content={draftContent}
          isDirty={isDirty}
          isSubmitting={updateResumeMutation.isPending}
          onChange={setDraftContent}
          onReset={() => setDraftContent(originalContent)}
          onSubmit={() => updateResumeMutation.mutate(draftContent)}
        />
      ) : resume.status !== 'failed' ? (
        <Paper
          elevation={0}
          sx={{
            border: 1,
            borderColor: 'divider',
            borderRadius: 2,
            px: 2,
            py: 6,
            textAlign: 'center',
          }}
        >
          <Typography color="text.secondary">
            {resume.status === 'completed'
              ? 'No structured content available.'
              : 'Resume is still being processed.'}
          </Typography>
        </Paper>
      ) : null}
    </Stack>
  )
}
