import AnalyticsOutlinedIcon from '@mui/icons-material/AnalyticsOutlined'
import ArticleOutlinedIcon from '@mui/icons-material/ArticleOutlined'
import ChevronLeftRoundedIcon from '@mui/icons-material/ChevronLeftRounded'
import ChevronRightRoundedIcon from '@mui/icons-material/ChevronRightRounded'
import DashboardOutlinedIcon from '@mui/icons-material/DashboardOutlined'
import LogoutOutlinedIcon from '@mui/icons-material/LogoutOutlined'
import PersonOutlineOutlinedIcon from '@mui/icons-material/PersonOutlineOutlined'
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined'
import {
  Avatar,
  Box,
  Divider,
  Drawer,
  IconButton,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  Stack,
  Tooltip,
  Typography,
  useMediaQuery,
} from '@mui/material'
import { useTheme } from '@mui/material/styles'
import { useState } from 'react'
import { NavLink, useNavigate } from 'react-router'
import { useAppSelector } from '@/app/hooks'
import { useLogoutMutation } from '@/features/auth/hooks/useAuthMutations'
import { selectCurrentUser } from '@/stores/authSlice'
import { collapsedDrawerWidth, drawerWidth } from './MainLayout'

const navItems = [
  { to: '/', icon: DashboardOutlinedIcon, label: 'Dashboard' },
  { to: '/analysis', icon: AnalyticsOutlinedIcon, label: 'Analyze' },
  { to: '/resume', icon: ArticleOutlinedIcon, label: 'Resumes' },
]

interface SidebarProps {
  isOpen: boolean
  onClose: () => void
  isCollapsed: boolean
  onToggleCollapse: () => void
}

export function getUserInitials(email: string): string {
  const localPart = email.split('@')[0] ?? email
  const parts = localPart.split(/[._-]/)
  const first = parts[0] ?? ''
  const second = parts[1] ?? ''
  if (parts.length >= 2 && first && second) {
    return (first.charAt(0) + second.charAt(0)).toUpperCase()
  }
  return localPart.slice(0, 2).toUpperCase()
}

export default function Sidebar({ isOpen, onClose, isCollapsed, onToggleCollapse }: SidebarProps) {
  const theme = useTheme()
  const isDesktop = useMediaQuery(theme.breakpoints.up('lg'), { noSsr: true })
  const user = useAppSelector(selectCurrentUser)
  const logoutMutation = useLogoutMutation()
  const navigate = useNavigate()
  const [settingsAnchor, setSettingsAnchor] = useState<HTMLElement | null>(null)

  const collapsed = isDesktop && isCollapsed
  const userInitials = user?.email ? getUserInitials(user.email) : '?'

  const drawerContent = (
    <Box
      sx={{
        display: 'flex',
        height: '100%',
        flexDirection: 'column',
        overflow: 'hidden',
      }}
    >
      {/* AppBar-height spacer — on desktop contains the collapse/expand toggle */}
      <Box
        sx={{
          minHeight: { xs: 64, md: 68 },
          flexShrink: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: collapsed ? 'center' : 'flex-end',
          px: 1,
        }}
      >
        {isDesktop && (
          <Tooltip title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}>
            <IconButton
              size="small"
              onClick={onToggleCollapse}
              aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            >
              {collapsed ? (
                <ChevronRightRoundedIcon fontSize="small" />
              ) : (
                <ChevronLeftRoundedIcon fontSize="small" />
              )}
            </IconButton>
          </Tooltip>
        )}
      </Box>

      <Divider />

      {/* Navigation */}
      <List
        component="nav"
        aria-label="Primary navigation"
        sx={{ flex: 1, p: 1, overflowY: 'auto', overflowX: 'hidden' }}
      >
        {navItems.map((item) => (
          <Tooltip
            key={item.to}
            title={collapsed ? item.label : ''}
            placement="right"
            disableHoverListener={!collapsed}
          >
            <ListItemButton
              component={NavLink}
              to={item.to}
              end={item.to === '/'}
              onClick={isDesktop ? undefined : onClose}
              sx={(muiTheme) => ({
                mb: 0.5,
                borderRadius: 1,
                color: 'text.secondary',
                justifyContent: collapsed ? 'center' : 'flex-start',
                px: collapsed ? 1.5 : 2,
                '& .MuiListItemIcon-root': {
                  color: 'inherit',
                  minWidth: collapsed ? 0 : 36,
                  mr: collapsed ? 0 : 1,
                  justifyContent: 'center',
                },
                '&.active': {
                  bgcolor: 'primary.main',
                  color: 'primary.contrastText',
                  boxShadow:
                    muiTheme.palette.mode === 'dark'
                      ? '0 10px 24px rgba(45, 212, 191, 0.16)'
                      : '0 10px 24px rgba(0, 121, 107, 0.18)',
                  '&:hover': {
                    bgcolor: 'primary.dark',
                  },
                },
              })}
            >
              <ListItemIcon>
                <item.icon fontSize="small" />
              </ListItemIcon>
              {!collapsed && (
                <ListItemText
                  primary={item.label}
                  slotProps={{ primary: { sx: { fontWeight: 700 } } }}
                />
              )}
            </ListItemButton>
          </Tooltip>
        ))}
      </List>

      <Divider />

      {/* Bottom: user avatar + settings */}
      <Box sx={{ flexShrink: 0, p: collapsed ? 1 : 1.5 }}>
        {collapsed ? (
          /* Vertical stack when collapsed — fits comfortably in 64 px */
          <Stack direction="column" spacing={0.75} sx={{ alignItems: 'center' }}>
            <Tooltip title={user?.email ?? 'User'} placement="right">
              <Avatar
                sx={{
                  width: 32,
                  height: 32,
                  bgcolor: 'primary.main',
                  color: 'primary.contrastText',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  cursor: 'default',
                }}
              >
                {userInitials}
              </Avatar>
            </Tooltip>
            <Tooltip title="Settings" placement="right">
              <IconButton
                size="small"
                onClick={(e) => setSettingsAnchor(e.currentTarget)}
                aria-label="Settings menu"
                aria-haspopup="menu"
              >
                <SettingsOutlinedIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Stack>
        ) : (
          /* Horizontal row when expanded */
          <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
            <Tooltip title={user?.email ?? 'User'}>
              <Avatar
                sx={{
                  width: 34,
                  height: 34,
                  bgcolor: 'primary.main',
                  color: 'primary.contrastText',
                  fontSize: '0.8rem',
                  fontWeight: 700,
                  cursor: 'default',
                  flexShrink: 0,
                }}
              >
                {userInitials}
              </Avatar>
            </Tooltip>
            {user?.email && (
              <Typography
                variant="caption"
                color="text.secondary"
                noWrap
                sx={{ flex: 1, minWidth: 0 }}
              >
                {user.email}
              </Typography>
            )}
            <Tooltip title="Settings">
              <IconButton
                size="small"
                onClick={(e) => setSettingsAnchor(e.currentTarget)}
                aria-label="Settings menu"
                aria-haspopup="menu"
              >
                <SettingsOutlinedIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Stack>
        )}
      </Box>

      {/* Settings menu */}
      <Menu
        anchorEl={settingsAnchor}
        open={Boolean(settingsAnchor)}
        onClose={() => setSettingsAnchor(null)}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        transformOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <MenuItem
          onClick={() => {
            setSettingsAnchor(null)
            navigate('/settings')
          }}
        >
          <ListItemIcon>
            <PersonOutlineOutlinedIcon fontSize="small" />
          </ListItemIcon>
          Profile
        </MenuItem>
        <MenuItem
          onClick={() => {
            setSettingsAnchor(null)
            logoutMutation.mutate()
          }}
          disabled={logoutMutation.isPending}
        >
          <ListItemIcon>
            <LogoutOutlinedIcon fontSize="small" />
          </ListItemIcon>
          {logoutMutation.isPending ? 'Signing out…' : 'Sign out'}
        </MenuItem>
      </Menu>
    </Box>
  )

  if (isDesktop) {
    return (
      <Drawer
        variant="permanent"
        open
        sx={{
          width: isCollapsed ? collapsedDrawerWidth : drawerWidth,
          flexShrink: 0,
          transition: 'width 0.2s ease',
          '& .MuiDrawer-paper': {
            width: isCollapsed ? collapsedDrawerWidth : drawerWidth,
            boxSizing: 'border-box',
            borderRight: '1px solid',
            borderColor: 'divider',
            bgcolor: 'background.paper',
            overflowX: 'hidden',
            transition: 'width 0.2s ease',
          },
        }}
      >
        {drawerContent}
      </Drawer>
    )
  }

  return (
    <Drawer
      variant="temporary"
      open={isOpen}
      onClose={onClose}
      ModalProps={{ keepMounted: true }}
      slotProps={{
        paper: {
          sx: {
            width: drawerWidth,
            boxSizing: 'border-box',
            bgcolor: 'background.paper',
          },
        },
      }}
    >
      {drawerContent}
    </Drawer>
  )
}
