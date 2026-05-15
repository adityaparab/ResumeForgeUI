import { useQueries, useQueryClient } from '@tanstack/react-query'
import { useCallback, useEffect, useMemo } from 'react'
import { useAppDispatch, useAppSelector } from '@/app/hooks'
import { toast } from '@/components/common/toast'
import { analysisApi, resumeApi } from '@/lib/api-client'
import type { AnalysisStatusResponse } from '@/lib/schemas/analysis.schema'
import type { ResumeStatusResponse } from '@/lib/schemas/resume.schema'
import {
  type ActiveJob,
  clearCompletedJobs,
  type JobStatus,
  markAllJobNotificationsRead,
  markJobNotificationRead,
  removeActiveJob,
  selectActiveJobs,
  selectUnreadJobCount,
  updateJobStatus,
} from '@/stores/uiSlice'

const POLLING_INTERVAL_MS = 3000

type ApiStatus = AnalysisStatusResponse['status'] | ResumeStatusResponse['status']

interface NotificationStatusSnapshot {
  id: string
  type: ActiveJob['type']
  status: JobStatus
}

const STATUS_MAP = {
  queued: 'pending',
  processing: 'processing',
  completed: 'completed',
  failed: 'failed',
} satisfies Record<ApiStatus, JobStatus>

const JOB_KIND_LABELS = {
  analysis: 'Analysis',
  'resume-upload': 'Resume extraction',
} satisfies Record<ActiveJob['type'], string>

export function isOngoingJob(status: JobStatus) {
  return status === 'pending' || status === 'processing'
}

export function isTerminalJob(status: JobStatus) {
  return status === 'completed' || status === 'failed'
}

function normalizeStatus(status: ApiStatus) {
  return STATUS_MAP[status]
}

async function fetchNotificationStatus(job: ActiveJob): Promise<NotificationStatusSnapshot> {
  if (job.type === 'analysis') {
    const data = await analysisApi.getStatus(job.id)
    return { id: job.id, type: job.type, status: normalizeStatus(data.status) }
  }

  const data = await resumeApi.getStatus(job.id)
  return { id: job.id, type: job.type, status: normalizeStatus(data.status) }
}

function showTerminalToast(job: ActiveJob, status: JobStatus) {
  const title = JOB_KIND_LABELS[job.type]
  const options = { duration: Number.POSITIVE_INFINITY }

  if (status === 'failed') {
    toast.error(`${title} failed.`, options)
    return
  }

  toast.success(`${title} complete.`, options)
}

function sortNewestFirst(jobs: ActiveJob[]) {
  return [...jobs].sort(
    (first, second) => new Date(second.createdAt).getTime() - new Date(first.createdAt).getTime(),
  )
}

export function useNotifications() {
  const dispatch = useAppDispatch()
  const queryClient = useQueryClient()
  const activeJobs = useAppSelector(selectActiveJobs)
  const unreadCount = useAppSelector(selectUnreadJobCount)

  const jobs = useMemo(() => sortNewestFirst(activeJobs), [activeJobs])
  const pollingJobs = useMemo(
    () => activeJobs.filter((job) => isOngoingJob(job.status)),
    [activeJobs],
  )

  const statusQueries = useQueries({
    queries: pollingJobs.map((job) => ({
      queryKey: ['notification-status', job.type, job.id],
      queryFn: () => fetchNotificationStatus(job),
      refetchInterval: POLLING_INTERVAL_MS,
    })),
  })

  useEffect(() => {
    statusQueries.forEach((query) => {
      const snapshot = query.data
      if (!snapshot) return

      const currentJob = activeJobs.find(
        (job) => job.id === snapshot.id && job.type === snapshot.type,
      )
      if (!currentJob || currentJob.status === snapshot.status) return

      dispatch(updateJobStatus({ id: snapshot.id, status: snapshot.status }))

      if (isTerminalJob(snapshot.status)) {
        const listQueryKey = snapshot.type === 'analysis' ? ['analyses'] : ['resumes']
        void queryClient.invalidateQueries({ queryKey: listQueryKey })

        showTerminalToast(currentJob, snapshot.status)
      }
    })
  }, [activeJobs, dispatch, queryClient, statusQueries])

  const markAllAsRead = useCallback(() => {
    dispatch(markAllJobNotificationsRead(new Date().toISOString()))
  }, [dispatch])

  const markAsRead = useCallback(
    (id: string) => {
      dispatch(markJobNotificationRead({ id, readAt: new Date().toISOString() }))
    },
    [dispatch],
  )

  const dismissNotification = useCallback(
    (id: string) => {
      dispatch(removeActiveJob(id))
    },
    [dispatch],
  )

  const clearCompletedNotifications = useCallback(() => {
    dispatch(clearCompletedJobs())
  }, [dispatch])

  return {
    jobs,
    unreadCount,
    ongoingCount: jobs.filter((job) => isOngoingJob(job.status)).length,
    completedCount: jobs.filter((job) => isTerminalJob(job.status)).length,
    markAllAsRead,
    markAsRead,
    dismissNotification,
    clearCompletedNotifications,
  }
}
