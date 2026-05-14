import { AlertCircle, CheckCircle2, Clock, X } from 'lucide-react'
import { Link } from 'react-router'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import type { ActiveJob, JobStatus, JobType } from '@/stores/uiSlice'
import { isOngoingJob, isTerminalJob } from '../hooks/useNotifications'

interface NotificationDropdownProps {
  jobs: ActiveJob[]
  unreadCount: number
  ongoingCount: number
  completedCount: number
  onMarkAllRead: () => void
  onMarkAsRead: (id: string) => void
  onDismiss: (id: string) => void
  onClearCompleted: () => void
  onClose: () => void
}

const STATUS_LABELS = {
  pending: 'Pending',
  processing: 'Processing',
  completed: 'Complete',
  failed: 'Failed',
} satisfies Record<JobStatus, string>

const STATUS_STYLES = {
  pending:
    'border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-300',
  processing:
    'border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-900 dark:bg-blue-950 dark:text-blue-300',
  completed:
    'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950 dark:text-emerald-300',
  failed: 'border-destructive/30 bg-destructive/10 text-destructive',
} satisfies Record<JobStatus, string>

const JOB_TYPE_LABELS = {
  analysis: 'Analysis',
  'resume-upload': 'Resume extraction',
} satisfies Record<JobType, string>

const JOB_TYPE_ROUTES = {
  analysis: 'analysis',
  'resume-upload': 'resume',
} satisfies Record<JobType, string>

function getStatusIcon(status: JobStatus) {
  if (status === 'failed') return <AlertCircle className="size-4" aria-hidden="true" />
  if (status === 'completed') return <CheckCircle2 className="size-4" aria-hidden="true" />
  return <Clock className="size-4" aria-hidden="true" />
}

export function getNotificationHref(job: ActiveJob) {
  const route = JOB_TYPE_ROUTES[job.type]
  return isOngoingJob(job.status) ? `/${route}/stream/${job.id}` : `/${route}/${job.id}`
}

function formatCreatedAt(createdAt: string) {
  return new Intl.DateTimeFormat(undefined, {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(new Date(createdAt))
}

function NotificationStatusBadge({ status }: { status: JobStatus }) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-medium',
        STATUS_STYLES[status],
      )}
    >
      {getStatusIcon(status)}
      {STATUS_LABELS[status]}
    </span>
  )
}

export function NotificationDropdown({
  jobs,
  unreadCount,
  ongoingCount,
  completedCount,
  onMarkAllRead,
  onMarkAsRead,
  onDismiss,
  onClearCompleted,
  onClose,
}: NotificationDropdownProps) {
  const hasJobs = jobs.length > 0
  const hasTerminalJobs = jobs.some((job) => isTerminalJob(job.status))

  return (
    <Card
      role="dialog"
      aria-label="Notifications"
      className="absolute right-0 top-11 z-50 w-[min(22rem,calc(100vw-2rem))] overflow-hidden rounded-lg shadow-lg"
    >
      <div className="flex items-start justify-between gap-3 border-b border-border px-4 py-3">
        <div>
          <h2 className="font-semibold text-sm text-foreground">Notifications</h2>
          <p className="mt-1 text-muted-foreground text-xs">
            {ongoingCount} ongoing, {completedCount} completed, {unreadCount} unread
          </p>
        </div>
        {unreadCount > 0 && (
          <Button variant="ghost" size="xs" onClick={onMarkAllRead}>
            Mark all read
          </Button>
        )}
      </div>

      {hasJobs ? (
        <ul
          className="max-h-96 divide-y divide-border overflow-y-auto"
          aria-label="Job notifications"
        >
          {jobs.map((job) => (
            <li key={`${job.type}-${job.id}`} className="group relative flex gap-2 px-4 py-3">
              <Link
                to={getNotificationHref(job)}
                className="min-w-0 flex-1 rounded-md outline-none focus-visible:ring-2 focus-visible:ring-ring"
                onClick={() => {
                  onMarkAsRead(job.id)
                  onClose()
                }}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate font-medium text-sm text-foreground">{job.label}</p>
                    <p className="mt-1 text-muted-foreground text-xs">
                      {JOB_TYPE_LABELS[job.type]} - {formatCreatedAt(job.createdAt)}
                    </p>
                  </div>
                  <NotificationStatusBadge status={job.status} />
                </div>
              </Link>

              <Button
                variant="ghost"
                size="icon-xs"
                aria-label={`Dismiss ${job.label}`}
                className="mt-0.5 opacity-80 group-hover:opacity-100"
                onClick={() => onDismiss(job.id)}
              >
                <X className="size-3.5" />
              </Button>
            </li>
          ))}
        </ul>
      ) : (
        <div className="px-4 py-8 text-center">
          <p className="font-medium text-sm text-foreground">No notifications</p>
          <p className="mt-1 text-muted-foreground text-xs">Ongoing activity will appear here.</p>
        </div>
      )}

      {hasTerminalJobs && (
        <div className="border-t border-border px-4 py-3">
          <Button variant="outline" size="sm" className="w-full" onClick={onClearCompleted}>
            Clear completed
          </Button>
        </div>
      )}
    </Card>
  )
}
