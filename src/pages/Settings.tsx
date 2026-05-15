import { Badge, Box, Card, Heading, HStack, Separator, Stack, Text, VStack } from '@chakra-ui/react'
import { Bell, Lock, Palette, User } from 'lucide-react'
import { useAppSelector } from '@/app/hooks'
import { selectCurrentUser } from '@/stores/authSlice'

const sections = [
  {
    icon: User,
    title: 'Profile',
    description: 'Your account details and personal information',
    badge: null,
  },
  {
    icon: Lock,
    title: 'Security',
    description: 'Password, two-factor authentication and sessions',
    badge: null,
  },
  {
    icon: Bell,
    title: 'Notifications',
    description: 'Choose what updates you receive and how',
    badge: null,
  },
  {
    icon: Palette,
    title: 'Appearance',
    description: 'Customise theme, language and display preferences',
    badge: 'Coming soon',
  },
] as const

export default function Settings() {
  const user = useAppSelector(selectCurrentUser)

  return (
    <VStack gap={8} align="stretch" maxW="2xl" mx="auto" w="full">
      {/* Page heading */}
      <VStack gap={1} align="flex-start">
        <Heading as="h1" size="xl" color="fg">
          Settings
        </Heading>
        <Text color="fg.muted" fontSize="sm">
          Manage your account preferences and application settings
        </Text>
      </VStack>

      {/* Account summary card */}
      <Card.Root variant="outline" borderRadius="xl">
        <Card.Body>
          <HStack gap={4}>
            <Box
              w={12}
              h={12}
              borderRadius="full"
              background="linear-gradient(135deg, #4f46e5, #7c3aed)"
              display="flex"
              alignItems="center"
              justifyContent="center"
              flexShrink={0}
            >
              <Text color="white" fontWeight="800" fontSize="lg">
                {user?.email?.[0]?.toUpperCase() ?? '?'}
              </Text>
            </Box>
            <VStack gap={0.5} align="flex-start">
              <Text fontWeight="600" color="fg" fontSize="sm">
                {user?.email}
              </Text>
              <Badge colorPalette="purple" variant="subtle" size="sm">
                Free plan
              </Badge>
            </VStack>
          </HStack>
        </Card.Body>
      </Card.Root>

      {/* Settings sections */}
      <Stack gap={3}>
        {sections.map(({ icon: Icon, title, description, badge }) => (
          <Card.Root
            key={title}
            variant="outline"
            borderRadius="xl"
            opacity={badge ? 0.6 : 1}
            _hover={badge ? {} : { borderColor: 'purple.400', shadow: 'sm' }}
            transition="all 0.15s"
          >
            <Card.Body>
              <HStack gap={4}>
                <Box
                  w={10}
                  h={10}
                  borderRadius="lg"
                  bg="bg.subtle"
                  borderWidth="1px"
                  borderColor="border.subtle"
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                  flexShrink={0}
                >
                  <Icon size={18} color="var(--chakra-colors-purple-500)" />
                </Box>
                <VStack gap={0.5} align="flex-start" flex="1">
                  <HStack gap={2}>
                    <Text fontWeight="600" color="fg" fontSize="sm">
                      {title}
                    </Text>
                    {badge && (
                      <Badge variant="outline" size="sm" colorPalette="gray">
                        {badge}
                      </Badge>
                    )}
                  </HStack>
                  <Text fontSize="xs" color="fg.muted">
                    {description}
                  </Text>
                </VStack>
              </HStack>
            </Card.Body>
          </Card.Root>
        ))}
      </Stack>

      <Separator />

      <Text fontSize="xs" color="fg.muted" textAlign="center">
        ResumeForge &bull; Version 1.0.0
      </Text>
    </VStack>
  )
}
