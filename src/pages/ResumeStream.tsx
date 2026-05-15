import WarningAmberRoundedIcon from '@mui/icons-material/WarningAmberRounded'
import { Alert, Paper, Stack } from '@mui/material'
import { useQuery } from '@tanstack/react-query'
import { useCallback, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router'
import LoadingSpinner from '@/components/common/LoadingSpinner'
import { toast } from '@/components/common/toast'
import { StreamViewer } from '@/features/common/components/StreamViewer'
import { useStreamJob } from '@/features/common/hooks/useStreamJob'
import { resumeApi } from '@/lib/api-client'

export default function ResumeStream() {
  const { resumeId } = useParams<{ resumeId: string }>()
  const navigate = useNavigate()

  const {
    data: statusData,
    isLoading: isStatusLoading,
    isError: isStatusError,
  } = useQuery({
    queryKey: ['resume-status', resumeId],
    queryFn: () => {
      if (!resumeId) throw new Error('Missing resume ID')
      return resumeApi.getStatus(resumeId)
    },
    enabled: !!resumeId,
  })

  const { status, fullText, error } = useStreamJob({
    jobId: statusData?.jobId,
    enabled: !!statusData?.jobId,
  })

  const handleDone = useCallback(() => {
    /* v8 ignore next */
    toast.success('Resume processed successfully!')
    /* v8 ignore next */
    if (resumeId) {
      /* v8 ignore next */
      setTimeout(() => navigate(`/resume/${resumeId}`), 1500)
    }
  }, [navigate, resumeId])

  useEffect(() => {
    if (!resumeId) {
      toast.error('Invalid resume ID.')
    }
  }, [resumeId])

  useEffect(() => {
    if (isStatusError) {
      toast.error('Failed to load resume status.')
    }
  }, [isStatusError])

  if (!resumeId) {
    return (
      <Paper elevation={0} sx={{ border: 1, borderColor: 'divider', borderRadius: 2, p: 3 }}>
        <Alert severity="error" role="alert">
          Invalid resume ID.
        </Alert>
      </Paper>
    )
  }

  if (isStatusLoading) {
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
        <LoadingSpinner label="Loading resume status" />
      </Paper>
    )
  }

  return (
    <Stack spacing={3}>
      {isStatusError && (
        <Alert icon={<WarningAmberRoundedIcon />} severity="warning" role="alert">
          Failed to load resume status. Waiting for live job details.
        </Alert>
      )}
      <StreamViewer
        title="Resume Processing"
        subtitle={
          statusData?.originalName ? `File: ${statusData.originalName}` : `Resume ID: ${resumeId}`
        }
        status={statusData?.jobId ? status : 'idle'}
        fullText={fullText}
        error={error}
        onDone={handleDone}
      />
    </Stack>
  )
}
