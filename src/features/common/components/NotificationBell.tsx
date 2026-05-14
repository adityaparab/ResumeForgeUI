import { Bell } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { Button } from '@/components/ui/button'
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
    <div ref={rootRef} className="relative">
      <Button
        variant="ghost"
        size="icon"
        aria-label="Notifications"
        aria-haspopup="dialog"
        aria-expanded={isOpen}
        onClick={() => setIsOpen((current) => !current)}
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span
            className="absolute -right-1 -top-1 inline-flex min-w-5 items-center justify-center rounded-full bg-destructive px-1.5 py-0.5 font-semibold text-[0.65rem] text-destructive-foreground leading-none"
            aria-live="polite"
          >
            {unreadCount}
          </span>
        )}
      </Button>

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
    </div>
  )
}
