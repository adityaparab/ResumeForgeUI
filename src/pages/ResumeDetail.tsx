import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { ChevronLeft, Download } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router'
import { toast } from 'sonner'
import LoadingSpinner from '@/components/common/LoadingSpinner'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { EditableStructuredContent } from '@/features/resume/components/EditableStructuredContent'
import { analysisApi, resumeApi } from '@/lib/api-client'
import type { StructuredContent } from '@/lib/schemas/resume.schema'

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
    queryFn: () => resumeApi.getById(resumeId as string),
    enabled: !!resumeId,
  })

  const { data: analyses } = useQuery({
    queryKey: ['analysis-for-resume', resumeId],
    queryFn: () => analysisApi.list(1, 100),
    enabled: !!resumeId,
  })

  const updateResumeMutation = useMutation({
    mutationFn: (structuredContent: StructuredContent) =>
      resumeApi.updateStructuredContent(resumeId as string, structuredContent),
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
    try {
      const blob = await resumeApi.download(resumeId as string)
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
      <div role="alert" className="text-destructive">
        Invalid resume ID.
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <LoadingSpinner />
      </div>
    )
  }

  if (isError || !resume) {
    return (
      <div
        role="alert"
        className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive"
      >
        Failed to load resume.
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => navigate('/resume')}
          className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
        >
          <ChevronLeft className="size-4" />
          Back to Resumes
        </button>
      </div>

      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">{resume.originalName}</h1>
          <p className="mt-1 font-mono text-sm text-muted-foreground">{resumeId}</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge
            variant={
              resume.status === 'completed'
                ? 'success'
                : resume.status === 'failed'
                  ? 'destructive'
                  : 'warning'
            }
          >
            {resume.status}
          </Badge>
          {resume.status === 'completed' && hasAnalysisResult && (
            <Button variant="outline" size="lg" onClick={handleDownload}>
              <Download className="size-4" />
              Download
            </Button>
          )}
        </div>
      </div>

      {resume.status === 'failed' && !resume.structuredContent && (
        <div
          role="alert"
          className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive"
        >
          {resume.error ?? 'Resume extraction failed.'}
        </div>
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
        <Card className="px-4 py-8 text-center text-muted-foreground">
          {resume.status === 'completed'
            ? 'No structured content available.'
            : 'Resume is still being processed.'}
        </Card>
      ) : null}
    </div>
  )
}
