import { Box, Button, Card, Flex, Grid, Heading, HStack, Text, VStack } from '@chakra-ui/react'
import { BarChart3, FileText, Plus, RefreshCw } from 'lucide-react'
import { Link } from 'react-router'
import { StatsCard } from '@/features/dashboard/components/StatsCard'
import { StatsCardSkeleton } from '@/features/dashboard/components/StatsCardSkeleton'
import { useDashboardStats } from '@/features/dashboard/hooks/useDashboardStats'

export default function Dashboard() {
  const { totalResumes, totalAnalyses, isLoading, isError, refetch } = useDashboardStats()

  return (
    <VStack gap={8} align="stretch">
      {/* Page header */}
      <Flex justify="space-between" align="flex-start" wrap="wrap" gap={4}>
        <VStack gap={0.5} align="flex-start">
          <Heading as="h1" size="xl" color="fg">
            Dashboard
          </Heading>
          <Text fontSize="sm" color="fg.muted">
            Overview of your resumes and analyses
          </Text>
        </VStack>
        <HStack gap={2}>
          {isError && (
            <Button variant="outline" size="sm" borderRadius="lg" onClick={refetch}>
              <RefreshCw size={14} />
              Retry
            </Button>
          )}
          <Button asChild colorPalette="purple" size="md" borderRadius="lg">
            <Link to="/resume">
              <Plus size={16} />
              Upload Resume
            </Link>
          </Button>
        </HStack>
      </Flex>

      {/* Error banner */}
      {isError && (
        <Box
          px={4}
          py={3}
          borderRadius="lg"
          bg="red.subtle"
          borderWidth="1px"
          borderColor="red.200"
          role="alert"
        >
          <Text fontSize="sm" color="red.600">
            Failed to load dashboard stats. Please try again.
          </Text>
        </Box>
      )}

      {/* Stats grid */}
      <Box as="section" aria-label="Summary statistics">
        <Grid gap={4} templateColumns={{ base: '1fr', sm: 'repeat(2, 1fr)', lg: 'repeat(4, 1fr)' }}>
          {isLoading ? (
            <>
              <StatsCardSkeleton />
              <StatsCardSkeleton />
            </>
          ) : (
            <>
              <StatsCard
                title="Total Resumes"
                value={totalResumes}
                description="Resumes uploaded so far"
                icon={<FileText size={20} />}
              />
              <StatsCard
                title="Total Analyses"
                value={totalAnalyses}
                description="AI analyses completed"
                icon={<BarChart3 size={20} />}
              />
            </>
          )}
        </Grid>
      </Box>

      {/* Quick actions */}
      <Box as="section" aria-label="Quick actions">
        <Heading as="h2" size="md" color="fg" mb={4}>
          Quick Actions
        </Heading>
        <Grid gap={4} templateColumns={{ base: '1fr', sm: 'repeat(2, 1fr)', lg: 'repeat(3, 1fr)' }}>
          {[
            {
              to: '/resume',
              icon: FileText,
              label: 'Upload Resume',
              sub: 'Add a new PDF or DOCX file',
            },
            {
              to: '/analysis',
              icon: BarChart3,
              label: 'Analyze Resume',
              sub: 'Compare against a job description',
            },
          ].map(({ to, icon: Icon, label, sub }) => (
            <Card.Root
              key={to}
              asChild
              variant="outline"
              borderRadius="xl"
              cursor="pointer"
              _hover={{ borderColor: 'purple.400', shadow: 'sm' }}
              transition="all 0.15s"
            >
              <Link to={to}>
                <Card.Body>
                  <HStack gap={4}>
                    <Box
                      w={10}
                      h={10}
                      borderRadius="lg"
                      bg="purple.subtle"
                      display="flex"
                      alignItems="center"
                      justifyContent="center"
                      flexShrink={0}
                    >
                      <Icon size={20} color="var(--chakra-colors-purple-500)" />
                    </Box>
                    <VStack gap={0.5} align="flex-start">
                      <Text fontWeight="600" color="fg" fontSize="sm">
                        {label}
                      </Text>
                      <Text fontSize="xs" color="fg.muted">
                        {sub}
                      </Text>
                    </VStack>
                  </HStack>
                </Card.Body>
              </Link>
            </Card.Root>
          ))}
        </Grid>
      </Box>
    </VStack>
  )
}
