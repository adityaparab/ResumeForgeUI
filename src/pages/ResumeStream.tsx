import { useQuery } from '@tanstack/react-query'
import { useCallback } from 'react'
import { useNavigate, useParams } from 'react-router'
import { toast } from 'sonner'
import LoadingSpinner from '@/components/common/LoadingSpinner'
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
    queryFn: () => resumeApi.getStatus(resumeId!),
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

  if (!resumeId) {
    toast.error('Invalid resume ID.')
    return (
      <div role="alert" className="text-destructive">
        Invalid resume ID.
      </div>
    )
  }

  if (isStatusError) {
    toast.error('Failed to load resume status.')
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
      title="Resume Processing"
      subtitle={
        statusData?.originalName ? `File: ${statusData.originalName}` : `Resume ID: ${resumeId}`
      }
      status={statusData?.jobId ? status : 'idle'}
      fullText={fullText}
      error={error}
      onDone={handleDone}
    />
  )
}
