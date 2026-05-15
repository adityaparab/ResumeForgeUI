import DarkModeOutlinedIcon from '@mui/icons-material/DarkModeOutlined'
import LightModeOutlinedIcon from '@mui/icons-material/LightModeOutlined'
import LogoutOutlinedIcon from '@mui/icons-material/LogoutOutlined'
import MenuRoundedIcon from '@mui/icons-material/MenuRounded'
import WorkOutlineRoundedIcon from '@mui/icons-material/WorkOutlineRounded'
import { AppBar, Avatar, Box, IconButton, Stack, Toolbar, Tooltip, Typography } from '@mui/material'
import { useAppDispatch, useAppSelector } from '@/app/hooks'
import { useLogoutMutation } from '@/features/auth/hooks/useAuthMutations'
import { NotificationBell } from '@/features/common/components/NotificationBell'
import { selectCurrentUser } from '@/stores/authSlice'
import { selectTheme, setTheme } from '@/stores/uiSlice'

interface HeaderProps {
  onToggleSidebar?: () => void
  drawerWidth?: number
}

export default function Header({ onToggleSidebar, drawerWidth = 280 }: HeaderProps) {
  const user = useAppSelector(selectCurrentUser)
  const logoutMutation = useLogoutMutation()
  const dispatch = useAppDispatch()
  const theme = useAppSelector(selectTheme)

  function toggleTheme() {
    dispatch(setTheme(theme === 'dark' ? 'light' : 'dark'))
  }

  return (
    <AppBar
      component="header"
      color="inherit"
      elevation={0}
      position="fixed"
      sx={(muiTheme) => ({
        borderBottom: `1px solid ${muiTheme.palette.divider}`,
        backdropFilter: 'blur(14px)',
        bgcolor: 'background.paper',
        zIndex: muiTheme.zIndex.drawer + 1,
        width: { lg: `calc(100% - ${drawerWidth}px)` },
        ml: { lg: `${drawerWidth}px` },
      })}
    >
      <Toolbar sx={{ minHeight: { xs: 64, md: 68 }, gap: 2, px: { xs: 2, sm: 3 } }}>
        <Tooltip title="Open navigation">
          <IconButton
            color="inherit"
            edge="start"
            onClick={onToggleSidebar}
            aria-label="Toggle sidebar"
            sx={{ display: { lg: 'none' } }}
          >
            <MenuRoundedIcon />
          </IconButton>
        </Tooltip>

        <Stack direction="row" spacing={1.5} sx={{ minWidth: 0, alignItems: 'center' }}>
          <Avatar
            variant="rounded"
            sx={{
              width: 36,
              height: 36,
              bgcolor: 'primary.main',
              color: 'primary.contrastText',
            }}
          >
            <WorkOutlineRoundedIcon fontSize="small" />
          </Avatar>
          <Box sx={{ minWidth: 0 }}>
            <Typography variant="subtitle1" component="span" noWrap>
              ResumeForge
            </Typography>
            <Typography
              variant="caption"
              color="text.secondary"
              noWrap
              sx={{ display: { xs: 'none', sm: 'block' } }}
            >
              Resume intelligence workspace
            </Typography>
          </Box>
        </Stack>

        <Box sx={{ flexGrow: 1 }} />

        <Stack direction="row" spacing={0.75} sx={{ alignItems: 'center' }}>
          <Tooltip title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}>
            <span>
              <IconButton
                color="inherit"
                onClick={toggleTheme}
                aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
              >
                {theme === 'dark' ? <LightModeOutlinedIcon /> : <DarkModeOutlinedIcon />}
              </IconButton>
            </span>
          </Tooltip>

          <NotificationBell />

          {user?.email && (
            <Typography
              variant="body2"
              color="text.secondary"
              noWrap
              sx={{ display: { xs: 'none', md: 'block' }, maxWidth: 260 }}
            >
              {user.email}
            </Typography>
          )}

          <Tooltip title="Sign out">
            <span>
              <IconButton
                color="inherit"
                onClick={() => logoutMutation.mutate()}
                disabled={logoutMutation.isPending}
                aria-label="Sign out"
              >
                <LogoutOutlinedIcon />
              </IconButton>
            </span>
          </Tooltip>
        </Stack>
      </Toolbar>
    </AppBar>
  )
}
