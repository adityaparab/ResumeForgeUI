import type { ColumnDef } from '@tanstack/react-table'
import { useMemo } from 'react'
import { useNavigate } from 'react-router'
import { toast } from 'sonner'
import LoadingSpinner from '@/components/common/LoadingSpinner'
import { Button } from '@/components/ui/button'
import { DataTable } from '@/components/ui/data-table'
import { AnalyzeForm } from '@/features/analysis/components/AnalyzeForm'
import { useAnalysesList } from '@/features/analysis/hooks/useAnalysesList'
import { useResumesForSelect } from '@/features/analysis/hooks/useResumesForSelect'
import { ResumeUploadForm } from '@/features/resume/components/ResumeUploadForm'
import type { Analysis } from '@/lib/schemas/analysis.schema'

const STATUS_CLASSES: Record<string, string> = {
  completed: 'bg-green-100 text-green-800',
  processing: 'bg-blue-100 text-blue-800',
  pending: 'bg-yellow-100 text-yellow-800',
  queued: 'bg-yellow-100 text-yellow-800',
  failed: 'bg-red-100 text-red-800',
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
          return <span className="font-mono text-xs text-muted-foreground">{id.slice(0, 8)}…</span>
        },
      },
      {
        accessorKey: 'resumeId',
        header: 'Resume',
        cell: ({ getValue }) => {
          const id = getValue() as string
          return <span className="font-mono text-xs">{id.slice(0, 8)}…</span>
        },
      },
      {
        accessorKey: 'status',
        header: 'Status',
        cell: ({ getValue }) => {
          const status = getValue() as string
          const cls = STATUS_CLASSES[status] ?? 'bg-gray-100 text-gray-800'
          return (
            <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${cls}`}>
              {status}
            </span>
          )
        },
      },
      {
        accessorKey: 'createdAt',
        header: 'Created',
        cell: ({ getValue }) => {
          const d = new Date(getValue() as string)
          return <span className="text-sm text-muted-foreground">{d.toLocaleDateString()}</span>
        },
      },
      {
        id: 'actions',
        header: 'Actions',
        cell: ({ row }) => {
          const analysis = row.original
          return (
            <div className="flex gap-2">
              {analysis.status === 'completed' && (
                <>
                  <Button
                    type="button"
                    variant="link"
                    size="xs"
                    onClick={() => navigate(`/analysis/${analysis.id}`)}
                  >
                    View Result
                  </Button>
                  <Button
                    type="button"
                    variant="link"
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
                  variant="link"
                  size="xs"
                  onClick={() => navigate(`/analysis/stream/${analysis.id}`)}
                >
                  View Stream
                </Button>
              )}
              {analysis.status === 'failed' && (
                <Button
                  type="button"
                  variant="link"
                  size="xs"
                  onClick={() => navigate(`/analysis/${analysis.id}`)}
                >
                  Failure Details
                </Button>
              )}
              {analysis.status !== 'completed' &&
                !isOngoingStatus(analysis.status) &&
                analysis.status !== 'failed' && (
                  <span className="text-muted-foreground text-xs">No actions</span>
                )}
            </div>
          )
        },
      },
    ],
    [navigate],
  )

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Analyses</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Compare your resumes against job descriptions
        </p>
      </div>

      <section
        aria-label={
          shouldShowUploadFallback ? 'Upload resume for analysis' : 'Start a new analysis'
        }
      >
        <h2 className="mb-4 text-lg font-semibold text-foreground">
          {shouldShowUploadFallback ? 'Upload Resume' : 'New Analysis'}
        </h2>
        <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
          {isResumesLoading && <LoadingSpinner label="Loading resumes" />}
          {shouldShowUploadFallback && <ResumeUploadForm />}
          {!isResumesLoading && !shouldShowUploadFallback && <AnalyzeForm />}
        </div>
      </section>

      <section aria-label="Analysis history">
        <h2 className="mb-4 text-lg font-semibold text-foreground">History</h2>
        <div className="rounded-xl border border-border bg-card shadow-sm">
          <DataTable
            columns={columns}
            data={data?.data ?? []}
            isLoading={isLoading}
            emptyMessage="No analyses yet. Submit a job description above to get started."
          />
        </div>
      </section>
    </div>
  )
}
