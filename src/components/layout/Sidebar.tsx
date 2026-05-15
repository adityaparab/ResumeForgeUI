import AnalyticsOutlinedIcon from '@mui/icons-material/AnalyticsOutlined'
import ArticleOutlinedIcon from '@mui/icons-material/ArticleOutlined'
import DashboardOutlinedIcon from '@mui/icons-material/DashboardOutlined'
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined'
import WorkOutlineRoundedIcon from '@mui/icons-material/WorkOutlineRounded'
import {
  Avatar,
  Box,
  Divider,
  Drawer,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Stack,
  Toolbar,
  Typography,
  useMediaQuery,
} from '@mui/material'
import { useTheme } from '@mui/material/styles'
import { NavLink } from 'react-router'
import { drawerWidth } from './MainLayout'

const navItems = [
  { to: '/', icon: DashboardOutlinedIcon, label: 'Dashboard' },
  { to: '/analysis', icon: AnalyticsOutlinedIcon, label: 'Analyze' },
  { to: '/resume', icon: ArticleOutlinedIcon, label: 'Resumes' },
  { to: '/settings', icon: SettingsOutlinedIcon, label: 'Settings' },
]

interface SidebarProps {
  isOpen: boolean
  onClose: () => void
}

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const theme = useTheme()
  const isDesktop = useMediaQuery(theme.breakpoints.up('lg'), { noSsr: true })

  const drawerContent = (
    <Box sx={{ display: 'flex', height: '100%', flexDirection: 'column' }}>
      <Toolbar sx={{ minHeight: { xs: 64, md: 68 }, px: 2.5 }}>
        <Stack direction="row" spacing={1.5} sx={{ minWidth: 0, alignItems: 'center' }}>
          <Avatar
            variant="rounded"
            sx={{ width: 38, height: 38, bgcolor: 'primary.main', color: 'primary.contrastText' }}
          >
            <WorkOutlineRoundedIcon fontSize="small" />
          </Avatar>
          <Box sx={{ minWidth: 0 }}>
            <Typography variant="subtitle1" noWrap>
              ResumeForge
            </Typography>
            <Typography variant="caption" color="text.secondary" noWrap>
              AI resume operations
            </Typography>
          </Box>
        </Stack>
      </Toolbar>

      <Divider />

      <List component="nav" aria-label="Primary navigation" sx={{ flex: 1, p: 1.5 }}>
        {navItems.map((item) => (
          <ListItemButton
            key={item.to}
            component={NavLink}
            to={item.to}
            end={item.to === '/'}
            onClick={isDesktop ? undefined : onClose}
            sx={(muiTheme) => ({
              mb: 0.5,
              borderRadius: 1,
              color: 'text.secondary',
              '& .MuiListItemIcon-root': {
                color: 'inherit',
                minWidth: 38,
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
            <ListItemText
              primary={item.label}
              slotProps={{ primary: { sx: { fontWeight: 700 } } }}
            />
          </ListItemButton>
        ))}
      </List>

      <Box sx={{ p: 2 }}>
        <Box
          sx={(muiTheme) => ({
            border: `1px solid ${muiTheme.palette.divider}`,
            borderRadius: 1,
            bgcolor: muiTheme.palette.mode === 'dark' ? 'rgba(15, 23, 42, 0.64)' : '#f8fafc',
            p: 1.5,
          })}
        >
          <Typography variant="caption" color="text.secondary">
            Active workspace
          </Typography>
          <Typography variant="body2" noWrap sx={{ fontWeight: 700 }}>
            Resume analysis
          </Typography>
        </Box>
      </Box>
    </Box>
  )

  if (isDesktop) {
    return (
      <Drawer
        variant="permanent"
        open
        slotProps={{
          paper: {
            sx: {
              width: drawerWidth,
              boxSizing: 'border-box',
              borderRight: '1px solid',
              borderColor: 'divider',
              bgcolor: 'background.paper',
            },
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
