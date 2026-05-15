import { Box, Flex, Text, VStack } from '@chakra-ui/react'
import { BarChart3, FileText, LayoutDashboard, Settings } from 'lucide-react'
import type { ElementType } from 'react'
import { NavLink } from 'react-router'

const navItems: { to: string; icon: ElementType; label: string }[] = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/analysis', icon: BarChart3, label: 'Analyze' },
  { to: '/resume', icon: FileText, label: 'Resumes' },
  { to: '/settings', icon: Settings, label: 'Settings' },
]

interface SidebarProps {
  isOpen: boolean
  onClose: () => void
}

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <Box
          position="fixed"
          inset="0"
          zIndex="overlay"
          bg="blackAlpha.600"
          display={{ base: 'block', lg: 'none' }}
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Sidebar panel */}
      <Box
        as="aside"
        position={{ base: 'fixed', lg: 'static' }}
        insetY="0"
        left="0"
        zIndex="modal"
        w="64"
        flexShrink={0}
        display={{ base: isOpen ? 'flex' : 'none', lg: 'flex' }}
        flexDirection="column"
        borderRightWidth="1px"
        borderColor="border.subtle"
        bg="bg"
        transition="transform 0.2s ease"
      >
        {/* Mobile header inside sidebar */}
        <Flex
          h="14"
          align="center"
          px={6}
          borderBottomWidth="1px"
          borderColor="border.subtle"
          display={{ base: 'flex', lg: 'none' }}
        >
          <Text fontSize="lg" fontWeight="800" color="fg" letterSpacing="tight">
            ResumeForge
          </Text>
        </Flex>

        {/* Nav items */}
        <VStack as="nav" gap={1} p={3} flex="1" align="stretch">
          {navItems.map((item) => (
            <NavLink key={item.to} to={item.to} end={item.to === '/'} onClick={onClose}>
              {({ isActive }) => (
                <Flex
                  align="center"
                  gap={3}
                  px={3}
                  py={2}
                  borderRadius="lg"
                  fontSize="sm"
                  fontWeight="500"
                  cursor="pointer"
                  transition="all 0.15s"
                  bg={isActive ? 'purple.subtle' : 'transparent'}
                  color={isActive ? 'purple.600' : 'fg.muted'}
                  _hover={{ bg: 'bg.subtle', color: 'fg' }}
                  _dark={{ color: isActive ? 'purple.300' : 'fg.muted' }}
                >
                  <item.icon size={18} />
                  {item.label}
                </Flex>
              )}
            </NavLink>
          ))}
        </VStack>
      </Box>
    </>
  )
}
