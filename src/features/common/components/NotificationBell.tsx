import { Box, IconButton } from '@chakra-ui/react'
import { Bell } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { useNotifications } from '../hooks/useNotifications'
import { NotificationDropdown } from './NotificationDropdown'

export function NotificationBell() {
  const [isOpen, setIsOpen] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)
  const {
    jobs,
    unreadCount,
    ongoingCount,
    completedCount,
    markAllAsRead,
    markAsRead,
    dismissNotification,
    clearCompletedNotifications,
  } = useNotifications()

  useEffect(() => {
    if (!isOpen) return

    function handlePointerDown(event: PointerEvent) {
      const target = event.target
      if (target instanceof Node && !rootRef.current?.contains(target)) {
        setIsOpen(false)
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') setIsOpen(false)
    }

    document.addEventListener('pointerdown', handlePointerDown)
    document.addEventListener('keydown', handleKeyDown)

    return () => {
      document.removeEventListener('pointerdown', handlePointerDown)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen])

  return (
    <Box ref={rootRef} position="relative">
      <Box position="relative" display="inline-flex">
        <IconButton
          aria-label="Notifications"
          aria-haspopup="dialog"
          aria-expanded={isOpen}
          variant="ghost"
          size="sm"
          onClick={() => setIsOpen((current) => !current)}
        >
          <Bell size={18} />
        </IconButton>
        {unreadCount > 0 && (
          <Box
            position="absolute"
            top="-1"
            right="-1"
            minW="5"
            h="5"
            borderRadius="full"
            bg="red.500"
            color="white"
            fontSize="10px"
            fontWeight="700"
            display="flex"
            alignItems="center"
            justifyContent="center"
            px={1}
            lineHeight="1"
            pointerEvents="none"
            aria-live="polite"
          >
            {unreadCount}
          </Box>
        )}
      </Box>

      {isOpen && (
        <NotificationDropdown
          jobs={jobs}
          unreadCount={unreadCount}
          ongoingCount={ongoingCount}
          completedCount={completedCount}
          onMarkAllRead={markAllAsRead}
          onMarkAsRead={markAsRead}
          onDismiss={dismissNotification}
          onClearCompleted={clearCompletedNotifications}
          onClose={() => setIsOpen(false)}
        />
      )}
    </Box>
  )
}
