import { Box, HStack, IconButton, Text } from '@chakra-ui/react'
import { LogOut, Menu, Moon, Sun } from 'lucide-react'
import { useAppDispatch, useAppSelector } from '@/app/hooks'
import { useLogoutMutation } from '@/features/auth/hooks/useAuthMutations'
import { NotificationBell } from '@/features/common/components/NotificationBell'
import { selectCurrentUser } from '@/stores/authSlice'
import { selectTheme, setTheme } from '@/stores/uiSlice'

interface HeaderProps {
  onToggleSidebar?: () => void
}

export default function Header({ onToggleSidebar }: HeaderProps) {
  const user = useAppSelector(selectCurrentUser)
  const logoutMutation = useLogoutMutation()
  const dispatch = useAppDispatch()
  const theme = useAppSelector(selectTheme)

  function toggleTheme() {
    dispatch(setTheme(theme === 'dark' ? 'light' : 'dark'))
  }

  return (
    <Box
      as="header"
      position="sticky"
      top="0"
      zIndex="sticky"
      h="14"
      borderBottomWidth="1px"
      borderColor="border.subtle"
      bg="bg"
      px={{ base: 4, lg: 6 }}
    >
      <HStack h="full" gap={4} justify="space-between">
        {/* Hamburger (mobile only) */}
        <IconButton
          aria-label="Toggle sidebar"
          variant="ghost"
          size="sm"
          display={{ base: 'flex', lg: 'none' }}
          onClick={onToggleSidebar}
        >
          <Menu size={20} />
        </IconButton>

        {/* Brand name */}
        <Text fontSize="lg" fontWeight="800" color="fg" letterSpacing="tight">
          ResumeForge
        </Text>

        {/* Right actions */}
        <HStack gap={1} ml="auto">
          <IconButton
            aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            variant="ghost"
            size="sm"
            onClick={toggleTheme}
          >
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          </IconButton>

          <NotificationBell />

          <Text
            fontSize="sm"
            color="fg.muted"
            display={{ base: 'none', md: 'block' }}
            maxW="180px"
            truncate
          >
            {user?.email}
          </Text>

          <IconButton
            aria-label="Sign out"
            variant="ghost"
            size="sm"
            colorPalette="red"
            loading={logoutMutation.isPending}
            onClick={() => logoutMutation.mutate()}
          >
            <LogOut size={18} />
          </IconButton>
        </HStack>
      </HStack>
    </Box>
  )
}
