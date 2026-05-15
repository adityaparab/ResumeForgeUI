import { Badge, Box, Button, Card, Heading, HStack, Icon, Text, VStack } from '@chakra-ui/react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { ChevronLeft, Download } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router'
import { toast } from 'sonner'
import LoadingSpinner from '@/components/common/LoadingSpinner'
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
      <Box role="alert" color="red.500">
        Invalid resume ID.
      </Box>
    )
  }

  if (isLoading) {
    return (
      <Box display="flex" h="64" alignItems="center" justifyContent="center">
        <LoadingSpinner />
      </Box>
    )
  }

  if (isError || !resume) {
    return (
      <Box
        role="alert"
        borderRadius="lg"
        borderWidth="1px"
        borderColor="red.200"
        bg="red.subtle"
        px={4}
        py={3}
        fontSize="sm"
        color="red.600"
      >
        Failed to load resume.
      </Box>
    )
  }

  const statusColor =
    resume.status === 'completed' ? 'green' : resume.status === 'failed' ? 'red' : 'yellow'

  return (
    <VStack gap={6} align="stretch">
      <Box>
        <Button type="button" variant="ghost" size="sm" onClick={() => navigate('/resume')}>
          <Icon as={ChevronLeft} />
          Back to Resumes
        </Button>
      </Box>

      <HStack justify="space-between" align="flex-start" gap={4} wrap="wrap">
        <Box>
          <Heading size="2xl" fontWeight="bold">
            {resume.originalName}
          </Heading>
          <Text mt={1} fontFamily="mono" fontSize="sm" color="fg.muted">
            {resumeId}
          </Text>
        </Box>
        <HStack gap={2}>
          <Badge colorPalette={statusColor} variant="subtle">
            {resume.status}
          </Badge>
          {resume.status === 'completed' && hasAnalysisResult && (
            <Button variant="outline" size="sm" onClick={handleDownload}>
              <Icon as={Download} />
              Download
            </Button>
          )}
        </HStack>
      </HStack>

      {resume.status === 'failed' && !resume.structuredContent && (
        <Box
          role="alert"
          borderRadius="lg"
          borderWidth="1px"
          borderColor="red.200"
          bg="red.subtle"
          px={4}
          py={3}
          fontSize="sm"
          color="red.600"
        >
          {resume.error ?? 'Resume extraction failed.'}
        </Box>
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
        <Card.Root variant="outline" borderRadius="xl">
          <Card.Body px={4} py={8} textAlign="center">
            <Text color="fg.muted">
              {resume.status === 'completed'
                ? 'No structured content available.'
                : 'Resume is still being processed.'}
            </Text>
          </Card.Body>
        </Card.Root>
      ) : null}
    </VStack>
  )
}
