import { useQuery } from '@tanstack/react-query'
import { useCallback } from 'react'
import { useNavigate, useParams } from 'react-router'
import { toast } from 'sonner'
import LoadingSpinner from '@/components/common/LoadingSpinner'
import { StreamViewer } from '@/features/common/components/StreamViewer'
import { useStreamJob } from '@/features/common/hooks/useStreamJob'
import { analysisApi } from '@/lib/api-client'

export default function AnalysisStream() {
  const { analysisId } = useParams<{ analysisId: string }>()
  const navigate = useNavigate()

  const {
    data: statusData,
    isLoading: isStatusLoading,
    isError: isStatusError,
  } = useQuery({
    queryKey: ['analysis-status', analysisId],
    queryFn: () => analysisApi.getStatus(analysisId!),
    enabled: !!analysisId,
  })

  const { status, fullText, error } = useStreamJob({
    jobId: statusData?.jobId,
    enabled: !!statusData?.jobId,
  })

  const handleDone = useCallback(() => {
    /* v8 ignore next */
    toast.success('Analysis complete!')
    /* v8 ignore next */
    if (analysisId) {
      /* v8 ignore next */
      setTimeout(() => navigate(`/analysis/${analysisId}`), 1500)
    }
  }, [navigate, analysisId])

  if (!analysisId) {
    toast.error('Invalid analysis ID.')
    return (
      <div role="alert" className="text-destructive">
        Invalid analysis ID.
      </div>
    )
  }

  if (isStatusError) {
    toast.error('Failed to load analysis status.')
  }

  if (isStatusLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <LoadingSpinner />
      </div>
    )
  }

  return (
    <StreamViewer
      title="Analysis in Progress"
      subtitle={`Analysis ID: ${analysisId}`}
      status={statusData?.jobId ? status : 'idle'}
      fullText={fullText}
      error={error}
      onDone={handleDone}
    />
  )
}
