import { Box, Toolbar } from '@mui/material'
import { useState } from 'react'
import { Outlet } from 'react-router'
import Header from './Header'
import Sidebar from './Sidebar'

export const drawerWidth = 280
export const collapsedDrawerWidth = 64

export default function MainLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const currentWidth = sidebarCollapsed ? collapsedDrawerWidth : drawerWidth

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'background.default' }}>
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        isCollapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed((prev) => !prev)}
      />
      <Header drawerWidth={currentWidth} onToggleSidebar={() => setSidebarOpen((prev) => !prev)} />
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          minWidth: 0,
          px: { xs: 2, sm: 3, lg: 4 },
          py: { xs: 2, lg: 3 },
          transition: 'margin-left 0.2s ease',
        }}
      >
        <Toolbar />
        <Box sx={{ mx: 'auto', width: '100%', maxWidth: 1440 }}>
          <Outlet />
        </Box>
      </Box>
    </Box>
  )
}
