import { Badge, Box, Button, Card, Heading, Text, VStack } from '@chakra-ui/react'
import type { ColumnDef } from '@tanstack/react-table'
import { useMemo } from 'react'
import { useNavigate } from 'react-router'
import { DataTable } from '@/components/ui/data-table'
import { ResumeUploadForm } from '@/features/resume/components/ResumeUploadForm'
import { useResumesList } from '@/features/resume/hooks/useResumesList'
import type { Resume } from '@/lib/schemas/resume.schema'

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

export default function ResumeList() {
  const navigate = useNavigate()
  const { data, isLoading } = useResumesList()

  const columns = useMemo<ColumnDef<Resume, unknown>[]>(
    () => [
      {
        accessorKey: 'originalName',
        header: 'File Name',
        cell: ({ getValue }) => (
          <Text fontWeight="medium" fontSize="sm">
            {getValue() as string}
          </Text>
        ),
      },
      {
        accessorKey: 'mimeType',
        header: 'Type',
        cell: ({ getValue }) => {
          const mime = getValue() as string
          const label = mime.includes('pdf') ? 'PDF' : 'DOCX'
          return (
            <Text fontSize="xs" color="fg.muted">
              {label}
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
        header: 'Uploaded',
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
          const resume = row.original
          return (
            <Box display="flex" gap={2}>
              {resume.status === 'completed' && (
                <Button
                  type="button"
                  variant="ghost"
                  size="xs"
                  colorPalette="purple"
                  onClick={() => navigate(`/resume/${resume.id}`)}
                >
                  View
                </Button>
              )}
              {isOngoingStatus(resume.status) && (
                <Button
                  type="button"
                  variant="ghost"
                  size="xs"
                  colorPalette="blue"
                  onClick={() => navigate(`/resume/stream/${resume.id}`)}
                >
                  View Stream
                </Button>
              )}
              {resume.status === 'failed' && (
                <Button
                  type="button"
                  variant="ghost"
                  size="xs"
                  colorPalette="red"
                  onClick={() => navigate(`/resume/${resume.id}`)}
                >
                  Failure Details
                </Button>
              )}
              {resume.status !== 'completed' &&
                !isOngoingStatus(resume.status) &&
                resume.status !== 'failed' && (
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
          Resumes
        </Heading>
        <Text mt={1} fontSize="sm" color="fg.muted">
          Upload and manage your resumes
        </Text>
      </Box>

      <Box as="section" aria-label="Upload a new resume">
        <Heading size="lg" fontWeight="semibold" mb={4}>
          Upload New Resume
        </Heading>
        <Card.Root variant="outline" borderRadius="xl">
          <Card.Body p={6}>
            <ResumeUploadForm />
          </Card.Body>
        </Card.Root>
      </Box>

      <Box as="section" aria-label="Your resumes">
        <Heading size="lg" fontWeight="semibold" mb={4}>
          Your Resumes
        </Heading>
        <Card.Root variant="outline" borderRadius="xl">
          <DataTable
            columns={columns}
            data={data?.data ?? []}
            isLoading={isLoading}
            emptyMessage="No resumes yet. Upload one above to get started."
          />
        </Card.Root>
      </Box>
    </VStack>
  )
}
