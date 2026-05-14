import type { ColumnDef } from '@tanstack/react-table'
import { useMemo } from 'react'
import { useNavigate } from 'react-router'
import { DataTable } from '@/components/ui/data-table'
import { ResumeUploadForm } from '@/features/resume/components/ResumeUploadForm'
import { useResumesList } from '@/features/resume/hooks/useResumesList'
import type { Resume } from '@/lib/schemas/resume.schema'

const STATUS_CLASSES: Record<string, string> = {
  completed: 'bg-green-100 text-green-800',
  processing: 'bg-blue-100 text-blue-800',
  pending: 'bg-yellow-100 text-yellow-800',
  failed: 'bg-red-100 text-red-800',
}

export default function ResumeList() {
  const navigate = useNavigate()
  const { data, isLoading } = useResumesList()

  const columns = useMemo<ColumnDef<Resume, unknown>[]>(
    () => [
      {
        accessorKey: 'originalName',
        header: 'File Name',
        cell: ({ getValue }) => <span className="font-medium text-sm">{getValue() as string}</span>,
      },
      {
        accessorKey: 'mimeType',
        header: 'Type',
        cell: ({ getValue }) => {
          const mime = getValue() as string
          const label = mime.includes('pdf') ? 'PDF' : 'DOCX'
          return <span className="text-xs text-muted-foreground">{label}</span>
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
        header: 'Uploaded',
        cell: ({ getValue }) => {
          const d = new Date(getValue() as string)
          return <span className="text-sm text-muted-foreground">{d.toLocaleDateString()}</span>
        },
      },
      {
        id: 'actions',
        header: 'Actions',
        cell: ({ row }) => {
          const resume = row.original
          return (
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => navigate(`/resume/${resume.id}`)}
                className="text-xs font-medium text-primary hover:underline"
              >
                View
              </button>
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
        <h1 className="text-2xl font-bold text-foreground">Resumes</h1>
        <p className="mt-1 text-sm text-muted-foreground">Upload and manage your resumes</p>
      </div>

      <section aria-label="Upload a new resume">
        <h2 className="mb-4 text-lg font-semibold text-foreground">Upload New Resume</h2>
        <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
          <ResumeUploadForm />
        </div>
      </section>

      <section aria-label="Your resumes">
        <h2 className="mb-4 text-lg font-semibold text-foreground">Your Resumes</h2>
        <div className="rounded-xl border border-border bg-card shadow-sm">
          <DataTable
            columns={columns}
            data={data?.data ?? []}
            isLoading={isLoading}
            emptyMessage="No resumes yet. Upload one above to get started."
          />
        </div>
      </section>
    </div>
  )
}
