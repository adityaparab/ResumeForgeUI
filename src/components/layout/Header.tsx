import DarkModeOutlinedIcon from '@mui/icons-material/DarkModeOutlined'
import GitHubIcon from '@mui/icons-material/GitHub'
import LightModeOutlinedIcon from '@mui/icons-material/LightModeOutlined'
import MenuRoundedIcon from '@mui/icons-material/MenuRounded'
import WorkOutlineRoundedIcon from '@mui/icons-material/WorkOutlineRounded'
import {
  AppBar,
  Avatar,
  Box,
  IconButton,
  Menu,
  MenuItem,
  Stack,
  Toolbar,
  Tooltip,
  Typography,
} from '@mui/material'
import { useState } from 'react'
import { useAppDispatch, useAppSelector } from '@/app/hooks'
import { NotificationBell } from '@/features/common/components/NotificationBell'
import { selectTheme, setTheme } from '@/stores/uiSlice'

interface HeaderProps {
  onToggleSidebar?: () => void
  drawerWidth?: number
}

export default function Header({ onToggleSidebar, drawerWidth = 280 }: HeaderProps) {
  const dispatch = useAppDispatch()
  const theme = useAppSelector(selectTheme)
  const [githubAnchor, setGithubAnchor] = useState<HTMLElement | null>(null)

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
        backdropFilter: 'blur(14px)',
        bgcolor: 'background.paper',
        zIndex: muiTheme.zIndex.drawer + 1,
        width: { lg: `calc(100% - ${drawerWidth}px)` },
        ml: { lg: `${drawerWidth}px` },
        transition: 'width 0.2s ease, margin-left 0.2s ease',
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
          <Typography variant="subtitle1" component="span" noWrap>
            ResumeForge
          </Typography>
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

          <Tooltip title="GitHub">
            <IconButton
              color="inherit"
              onClick={(e) => setGithubAnchor(e.currentTarget)}
              aria-label="GitHub repositories"
              aria-haspopup="menu"
            >
              <GitHubIcon />
            </IconButton>
          </Tooltip>

          <Menu
            anchorEl={githubAnchor}
            open={Boolean(githubAnchor)}
            onClose={() => setGithubAnchor(null)}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            transformOrigin={{ vertical: 'top', horizontal: 'right' }}
          >
            <MenuItem
              component="a"
              href="https://github.com/adityaparab/ResumeForgeUI"
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setGithubAnchor(null)}
            >
              UI
            </MenuItem>
            <MenuItem onClick={() => setGithubAnchor(null)}>Server</MenuItem>
          </Menu>

          <NotificationBell />
        </Stack>
      </Toolbar>
    </AppBar>
  )
}
