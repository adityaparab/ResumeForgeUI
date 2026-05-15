import { Box, Flex } from '@chakra-ui/react'
import { useState } from 'react'
import { Outlet } from 'react-router'
import Header from './Header'
import Sidebar from './Sidebar'

export default function MainLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <Flex minH="100dvh" bg="bg">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <Flex flex="1" direction="column" minW={0}>
        <Header onToggleSidebar={() => setSidebarOpen((prev) => !prev)} />
        <Box as="main" flex="1" p={{ base: 4, lg: 6 }}>
          <Outlet />
        </Box>
      </Flex>
    </Flex>
  )
}
