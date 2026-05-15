import CheckCircleOutlineRoundedIcon from '@mui/icons-material/CheckCircleOutlineRounded'
import ClearAllRoundedIcon from '@mui/icons-material/ClearAllRounded'
import CloseRoundedIcon from '@mui/icons-material/CloseRounded'
import DoneAllRoundedIcon from '@mui/icons-material/DoneAllRounded'
import ErrorOutlineRoundedIcon from '@mui/icons-material/ErrorOutlineRounded'
import ScheduleRoundedIcon from '@mui/icons-material/ScheduleRounded'
import {
  Box,
  Button,
  Chip,
  Divider,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Paper,
  Stack,
  Typography,
} from '@mui/material'
import { Link } from 'react-router'
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

const STATUS_COLORS = {
  pending: 'warning',
  processing: 'info',
  completed: 'success',
  failed: 'error',
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
  if (status === 'failed') return <ErrorOutlineRoundedIcon fontSize="small" />
  if (status === 'completed') return <CheckCircleOutlineRoundedIcon fontSize="small" />
  return <ScheduleRoundedIcon fontSize="small" />
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
    <Chip
      size="small"
      color={STATUS_COLORS[status] as 'warning' | 'info' | 'success' | 'error'}
      variant="outlined"
      icon={getStatusIcon(status)}
      label={STATUS_LABELS[status]}
      sx={{ fontWeight: 700 }}
    />
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
    <Paper
      role="dialog"
      aria-label="Notifications"
      elevation={8}
      sx={{ width: 'min(22rem, calc(100vw - 2rem))', overflow: 'hidden' }}
    >
      <Stack
        direction="row"
        spacing={2}
        sx={{ alignItems: 'flex-start', justifyContent: 'space-between', px: 2, py: 1.5 }}
      >
        <Box>
          <Typography variant="subtitle2">Notifications</Typography>
          <Typography variant="caption" color="text.secondary">
            {ongoingCount} ongoing, {completedCount} completed, {unreadCount} unread
          </Typography>
        </Box>
        {unreadCount > 0 && (
          <Button size="small" startIcon={<DoneAllRoundedIcon />} onClick={onMarkAllRead}>
            Mark all read
          </Button>
        )}
      </Stack>

      <Divider />

      {hasJobs ? (
        <List
          disablePadding
          aria-label="Job notifications"
          sx={{ maxHeight: 384, overflowY: 'auto' }}
        >
          {jobs.map((job) => (
            <ListItem
              key={`${job.type}-${job.id}`}
              disablePadding
              secondaryAction={
                <IconButton
                  edge="end"
                  size="small"
                  aria-label={`Dismiss ${job.label}`}
                  onClick={() => onDismiss(job.id)}
                >
                  <CloseRoundedIcon fontSize="small" />
                </IconButton>
              }
              sx={{ borderBottom: '1px solid', borderColor: 'divider' }}
            >
              <ListItemButton
                component={Link}
                to={getNotificationHref(job)}
                onClick={() => {
                  onMarkAsRead(job.id)
                  onClose()
                }}
                sx={{ alignItems: 'flex-start', gap: 1.5, pr: 7, py: 1.5 }}
              >
                <ListItemText
                  primary={job.label}
                  secondary={`${JOB_TYPE_LABELS[job.type]} - ${formatCreatedAt(job.createdAt)}`}
                  slotProps={{
                    primary: { sx: { fontWeight: 700 } },
                    secondary: { sx: { mt: 0.5 } },
                  }}
                />
                <Box sx={{ pt: 0.25 }}>
                  <NotificationStatusBadge status={job.status} />
                </Box>
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      ) : (
        <Box sx={{ px: 2, py: 4, textAlign: 'center' }}>
          <Typography variant="subtitle2">No notifications</Typography>
          <Typography variant="caption" color="text.secondary">
            Ongoing activity will appear here.
          </Typography>
        </Box>
      )}

      {hasTerminalJobs && (
        <Box sx={{ borderTop: '1px solid', borderColor: 'divider', p: 1.5 }}>
          <Button
            variant="outlined"
            size="small"
            fullWidth
            startIcon={<ClearAllRoundedIcon />}
            onClick={onClearCompleted}
          >
            Clear completed
          </Button>
        </Box>
      )}
    </Paper>
  )
}
