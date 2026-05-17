import NotificationsNoneRoundedIcon from '@mui/icons-material/NotificationsNoneRounded'
import { Badge, Box, IconButton, Popover, Tooltip } from '@mui/material'
import { useCallback, useEffect, useRef, useState } from 'react'
import { useNotifications } from '../hooks/useNotifications'
import { NotificationDropdown } from './NotificationDropdown'

export function NotificationBell() {
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null)
  const buttonRootRef = useRef<HTMLDivElement>(null)
  const popoverContentRef = useRef<HTMLDivElement>(null)
  const {
    jobs,
    unreadCount,
    hasActiveItems,
    ongoingCount,
    completedCount,
    markAllAsRead,
    markAsRead,
    dismissNotification,
    clearCompletedNotifications,
  } = useNotifications()
  const isOpen = Boolean(anchorEl)

  const closePopover = useCallback(() => {
    setAnchorEl(null)
  }, [])

  useEffect(() => {
    if (!isOpen) return

    function handlePointerDown(event: PointerEvent) {
      const target = event.target
      if (
        target instanceof Node &&
        !buttonRootRef.current?.contains(target) &&
        !popoverContentRef.current?.contains(target)
      ) {
        closePopover()
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') closePopover()
    }

    document.addEventListener('pointerdown', handlePointerDown)
    document.addEventListener('keydown', handleKeyDown)

    return () => {
      document.removeEventListener('pointerdown', handlePointerDown)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen, closePopover])

  return (
    <Box ref={buttonRootRef}>
      <Tooltip title="Notifications">
        <IconButton
          color="inherit"
          aria-label="Notifications"
          aria-haspopup="dialog"
          aria-expanded={isOpen}
          onClick={(event) => setAnchorEl((current) => (current ? null : event.currentTarget))}
        >
          <Badge
            badgeContent={unreadCount > 0 ? unreadCount : undefined}
            variant={hasActiveItems && unreadCount === 0 ? 'dot' : 'standard'}
            color="error"
            invisible={!hasActiveItems && unreadCount === 0}
            max={99}
          >
            <NotificationsNoneRoundedIcon />
          </Badge>
        </IconButton>
      </Tooltip>

      <Popover
        open={isOpen}
        anchorEl={anchorEl}
        onClose={closePopover}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        slotProps={{ paper: { sx: { mt: 1, overflow: 'visible' } } }}
      >
        <Box ref={popoverContentRef}>
          <NotificationDropdown
            jobs={jobs}
            unreadCount={unreadCount}
            ongoingCount={ongoingCount}
            completedCount={completedCount}
            onMarkAllRead={markAllAsRead}
            onMarkAsRead={markAsRead}
            onDismiss={dismissNotification}
            onClearCompleted={clearCompletedNotifications}
            onClose={closePopover}
          />
        </Box>
      </Popover>
    </Box>
  )
}
