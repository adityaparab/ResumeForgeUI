import { Badge, Box, Button, Card, Heading, Text, VStack } from '@chakra-ui/react'
import type { ColumnDef } from '@tanstack/react-table'
import { useMemo } from 'react'
import { useNavigate } from 'react-router'
import { toast } from 'sonner'
import LoadingSpinner from '@/components/common/LoadingSpinner'
import { DataTable } from '@/components/ui/data-table'
import { AnalyzeForm } from '@/features/analysis/components/AnalyzeForm'
import { useAnalysesList } from '@/features/analysis/hooks/useAnalysesList'
import { useResumesForSelect } from '@/features/analysis/hooks/useResumesForSelect'
import { ResumeUploadForm } from '@/features/resume/components/ResumeUploadForm'
import type { Analysis } from '@/lib/schemas/analysis.schema'

const STATUS_COLOR: Record<string, string> = {
  completed: 'green',
  processing: 'blue',
  pending: 'yellow',
  queued: 'yellow',
  failed: 'red',
}

const ONGOING_STATUSES = new Set(['pending', 'processing', 'queued'])

function isOngoingStatus(status: string) {
  return ONGOING_STATUSES.has(status)
}

export default function AnalysisList() {
  const navigate = useNavigate()
  const { data, isLoading } = useAnalysesList()
  const { data: completedResumes = [], isLoading: isResumesLoading } = useResumesForSelect()
  const shouldShowUploadFallback = !isResumesLoading && completedResumes.length === 0

  const columns = useMemo<ColumnDef<Analysis, unknown>[]>(
    () => [
      {
        accessorKey: 'id',
        header: 'ID',
        cell: ({ getValue }) => {
          const id = getValue() as string
          return (
            <Text fontFamily="mono" fontSize="xs" color="fg.muted">
              {id.slice(0, 8)}…
            </Text>
          )
        },
      },
      {
        accessorKey: 'resumeId',
        header: 'Resume',
        cell: ({ getValue }) => {
          const id = getValue() as string
          return (
            <Text fontFamily="mono" fontSize="xs">
              {id.slice(0, 8)}…
            </Text>
          )
        },
      },
      {
        accessorKey: 'status',
        header: 'Status',
        cell: ({ getValue }) => {
          const status = getValue() as string
          const colorPalette = STATUS_COLOR[status] ?? 'gray'
          return (
            <Badge colorPalette={colorPalette} variant="subtle" size="sm">
              {status}
            </Badge>
          )
        },
      },
      {
        accessorKey: 'createdAt',
        header: 'Created',
        cell: ({ getValue }) => {
          const d = new Date(getValue() as string)
          return (
            <Text fontSize="sm" color="fg.muted">
              {d.toLocaleDateString()}
            </Text>
          )
        },
      },
      {
        id: 'actions',
        header: 'Actions',
        cell: ({ row }) => {
          const analysis = row.original
          return (
            <Box display="flex" gap={2}>
              {analysis.status === 'completed' && (
                <>
                  <Button
                    type="button"
                    variant="ghost"
                    size="xs"
                    colorPalette="purple"
                    onClick={() => navigate(`/analysis/${analysis.id}`)}
                  >
                    View Result
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="xs"
                    onClick={() => toast.info('Interview prep coming soon!')}
                    title="Interview Prep (coming soon)"
                  >
                    Interview Prep
                  </Button>
                </>
              )}
              {isOngoingStatus(analysis.status) && (
                <Button
                  type="button"
                  variant="ghost"
                  size="xs"
                  colorPalette="blue"
                  onClick={() => navigate(`/analysis/stream/${analysis.id}`)}
                >
                  View Stream
                </Button>
              )}
              {analysis.status === 'failed' && (
                <Button
                  type="button"
                  variant="ghost"
                  size="xs"
                  colorPalette="red"
                  onClick={() => navigate(`/analysis/${analysis.id}`)}
                >
                  Failure Details
                </Button>
              )}
              {analysis.status !== 'completed' &&
                !isOngoingStatus(analysis.status) &&
                analysis.status !== 'failed' && (
                  <Text color="fg.muted" fontSize="xs">
                    No actions
                  </Text>
                )}
            </Box>
          )
        },
      },
    ],
    [navigate],
  )

  return (
    <VStack gap={8} align="stretch">
      <Box>
        <Heading size="2xl" fontWeight="bold">
          Analyses
        </Heading>
        <Text mt={1} fontSize="sm" color="fg.muted">
          Compare your resumes against job descriptions
        </Text>
      </Box>

      <Box
        as="section"
        aria-label={
          shouldShowUploadFallback ? 'Upload resume for analysis' : 'Start a new analysis'
        }
      >
        <Heading size="lg" fontWeight="semibold" mb={4}>
          {shouldShowUploadFallback ? 'Upload Resume' : 'New Analysis'}
        </Heading>
        <Card.Root variant="outline" borderRadius="xl">
          <Card.Body p={6}>
            {isResumesLoading && <LoadingSpinner label="Loading resumes" />}
            {shouldShowUploadFallback && <ResumeUploadForm />}
            {!isResumesLoading && !shouldShowUploadFallback && <AnalyzeForm />}
          </Card.Body>
        </Card.Root>
      </Box>

      <Box as="section" aria-label="Analysis history">
        <Heading size="lg" fontWeight="semibold" mb={4}>
          History
        </Heading>
        <Card.Root variant="outline" borderRadius="xl">
          <DataTable
            columns={columns}
            data={data?.data ?? []}
            isLoading={isLoading}
            emptyMessage="No analyses yet. Submit a job description above to get started."
          />
        </Card.Root>
      </Box>
    </VStack>
  )
}
