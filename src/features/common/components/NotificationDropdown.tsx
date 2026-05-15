import { Badge, Box, Button, Card, Flex, HStack, IconButton, Text, VStack } from '@chakra-ui/react'
import { AlertCircle, CheckCircle2, Clock, X } from 'lucide-react'
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

const STATUS_PALETTE: Record<JobStatus, string> = {
  pending: 'yellow',
  processing: 'blue',
  completed: 'green',
  failed: 'red',
}

const JOB_TYPE_LABELS = {
  analysis: 'Analysis',
  'resume-upload': 'Resume extraction',
} satisfies Record<JobType, string>

const JOB_TYPE_ROUTES = {
  analysis: 'analysis',
  'resume-upload': 'resume',
} satisfies Record<JobType, string>

function getStatusIcon(status: JobStatus) {
  if (status === 'failed') return <AlertCircle size={14} aria-hidden="true" />
  if (status === 'completed') return <CheckCircle2 size={14} aria-hidden="true" />
  return <Clock size={14} aria-hidden="true" />
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
    <Badge colorPalette={STATUS_PALETTE[status]} variant="subtle" size="sm" gap={1}>
      {getStatusIcon(status)}
      {STATUS_LABELS[status]}
    </Badge>
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
    <Card.Root
      role="dialog"
      aria-label="Notifications"
      position="absolute"
      right="0"
      top="11"
      zIndex="popover"
      w="min(22rem, calc(100vw - 2rem))"
      overflow="hidden"
      borderRadius="lg"
      shadow="lg"
    >
      {/* Header */}
      <Flex
        justify="space-between"
        align="flex-start"
        gap={3}
        px={4}
        py={3}
        borderBottomWidth="1px"
        borderColor="border.subtle"
      >
        <VStack gap={0.5} align="flex-start">
          <Text fontWeight="600" fontSize="sm" color="fg">
            Notifications
          </Text>
          <Text fontSize="xs" color="fg.muted">
            {ongoingCount} ongoing, {completedCount} completed, {unreadCount} unread
          </Text>
        </VStack>
        {unreadCount > 0 && (
          <Button variant="ghost" size="xs" onClick={onMarkAllRead}>
            Mark all read
          </Button>
        )}
      </Flex>

      {/* List */}
      {hasJobs ? (
        <Box as="ul" maxH="96" overflowY="auto" aria-label="Job notifications" listStyleType="none">
          {jobs.map((job) => (
            <Box
              as="li"
              key={`${job.type}-${job.id}`}
              display="flex"
              gap={2}
              px={4}
              py={3}
              borderBottomWidth="1px"
              borderColor="border.subtle"
              _last={{ borderBottomWidth: 0 }}
              _hover={{ bg: 'bg.subtle' }}
              transition="background 0.15s"
            >
              <Box
                as={Link}
                to={getNotificationHref(job)}
                flex="1"
                minW={0}
                borderRadius="md"
                outline="none"
                _focusVisible={{ ring: '2px', ringColor: 'purple.400' }}
                onClick={() => {
                  onMarkAsRead(job.id)
                  onClose()
                }}
              >
                <HStack justify="space-between" align="flex-start" gap={3}>
                  <VStack gap={0.5} align="flex-start" minW={0}>
                    <Text fontWeight="500" fontSize="sm" color="fg" truncate>
                      {job.label}
                    </Text>
                    <Text fontSize="xs" color="fg.muted">
                      {JOB_TYPE_LABELS[job.type]} · {formatCreatedAt(job.createdAt)}
                    </Text>
                  </VStack>
                  <NotificationStatusBadge status={job.status} />
                </HStack>
              </Box>

              <IconButton
                aria-label={`Dismiss ${job.label}`}
                variant="ghost"
                size="xs"
                mt={0.5}
                onClick={() => onDismiss(job.id)}
              >
                <X size={14} />
              </IconButton>
            </Box>
          ))}
        </Box>
      ) : (
        <Box px={4} py={8} textAlign="center">
          <Text fontWeight="500" fontSize="sm" color="fg">
            No notifications
          </Text>
          <Text fontSize="xs" color="fg.muted" mt={1}>
            Ongoing activity will appear here.
          </Text>
        </Box>
      )}

      {/* Footer */}
      {hasTerminalJobs && (
        <Box px={4} py={3} borderTopWidth="1px" borderColor="border.subtle">
          <Button variant="outline" size="sm" w="full" onClick={onClearCompleted}>
            Clear completed
          </Button>
        </Box>
      )}
    </Card.Root>
  )
}
