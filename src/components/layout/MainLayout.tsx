import { Box, Toolbar } from '@mui/material'
import { useState } from 'react'
import { Outlet } from 'react-router'
import Header from './Header'
import Sidebar from './Sidebar'

export const drawerWidth = 280

export default function MainLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'background.default' }}>
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <Header drawerWidth={drawerWidth} onToggleSidebar={() => setSidebarOpen((prev) => !prev)} />
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          minWidth: 0,
          width: { lg: `calc(100% - ${drawerWidth}px)` },
          px: { xs: 2, sm: 3, lg: 4 },
          py: { xs: 2, lg: 3 },
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
