import WarningAmberRoundedIcon from '@mui/icons-material/WarningAmberRounded'
import { Alert, Paper, Stack } from '@mui/material'
import { useQuery } from '@tanstack/react-query'
import { useCallback, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router'
import { useAppSelector } from '@/app/hooks'
import LoadingSpinner from '@/components/common/LoadingSpinner'
import { toast } from '@/components/common/toast'
import { StreamViewer } from '@/features/common/components/StreamViewer'
import { useStreamJob } from '@/features/common/hooks/useStreamJob'
import { analysisApi } from '@/lib/api-client'
import { selectStream } from '@/stores/streamSlice'

export default function AnalysisStream() {
  const { analysisId } = useParams<{ analysisId: string }>()
  const navigate = useNavigate()

  const {
    data: statusData,
    isLoading: isStatusLoading,
    isError: isStatusError,
  } = useQuery({
    queryKey: ['analysis-status', analysisId],
    queryFn: () => {
      if (!analysisId) throw new Error('Missing analysis ID')
      return analysisApi.getStatus(analysisId)
    },
    enabled: !!analysisId,
  })

  const jobId = statusData?.jobId
  const {
    status,
    fullText: hookFullText,
    error,
  } = useStreamJob({
    jobId,
    enabled: !!jobId,
  })
  const streamEntry = useAppSelector(selectStream(jobId))
  const fullText = streamEntry?.fullText ?? hookFullText

  const handleDone = useCallback(() => {
    /* v8 ignore next */
    toast.success('Analysis complete!')
    /* v8 ignore next */
    if (analysisId) {
      /* v8 ignore next */
      setTimeout(() => navigate(`/analysis/${analysisId}`), 1500)
    }
  }, [navigate, analysisId])

  useEffect(() => {
    if (!analysisId) {
      toast.error('Invalid analysis ID.')
    }
  }, [analysisId])

  useEffect(() => {
    if (isStatusError) {
      toast.error('Failed to load analysis status.')
    }
  }, [isStatusError])

  if (!analysisId) {
    return (
      <Paper elevation={0} sx={{ border: 1, borderColor: 'divider', borderRadius: 2, p: 3 }}>
        <Alert severity="error" role="alert">
          Invalid analysis ID.
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
        <LoadingSpinner label="Loading analysis status" />
      </Paper>
    )
  }

  return (
    <Stack spacing={3}>
      {isStatusError && (
        <Alert icon={<WarningAmberRoundedIcon />} severity="warning" role="alert">
          Failed to load analysis status. Waiting for live job details.
        </Alert>
      )}
      <StreamViewer
        title="Analysis in Progress"
        subtitle={`Analysis ID: ${analysisId}`}
        status={statusData?.jobId ? status : 'idle'}
        fullText={fullText}
        error={error}
        onDone={handleDone}
      />
    </Stack>
  )
}
