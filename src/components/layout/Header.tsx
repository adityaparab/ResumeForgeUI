import { Bell, LogOut } from 'lucide-react'
import { useAppSelector } from '@/app/hooks'
import { Button } from '@/components/ui/button'
import { useLogoutMutation } from '@/features/auth/hooks/useAuthMutations'
import { selectCurrentUser } from '@/stores/authSlice'

interface HeaderProps {
  onToggleSidebar?: () => void
}

export default function Header({ onToggleSidebar }: HeaderProps) {
  const user = useAppSelector(selectCurrentUser)
  const logoutMutation = useLogoutMutation()

  return (
    <header className="sticky top-0 z-40 flex h-14 items-center gap-4 border-b bg-background px-4 lg:px-6">
      <button
        type="button"
        className="lg:hidden"
        onClick={onToggleSidebar}
        aria-label="Toggle sidebar"
      >
        <svg
          className="h-6 w-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 6h16M4 12h16M4 18h16"
          />
        </svg>
      </button>

      <div className="flex-1">
        <span className="text-lg font-bold">ResumeForge</span>
      </div>

      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" aria-label="Notifications">
          <Bell className="h-5 w-5" />
        </Button>

        <span className="text-muted-foreground hidden text-sm md:inline">{user?.email}</span>

        <Button
          variant="ghost"
          size="icon"
          onClick={() => logoutMutation.mutate()}
          disabled={logoutMutation.isPending}
          aria-label="Sign out"
        >
          <LogOut className="h-5 w-5" />
        </Button>
      </div>
    </header>
  )
}
