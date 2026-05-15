import { Box, Card, HStack, Text } from '@chakra-ui/react'
import type { ReactNode } from 'react'

interface StatsCardProps {
  title: string
  value: number | string
  description?: string
  icon: ReactNode
}

export function StatsCard({ title, value, description, icon }: StatsCardProps) {
  return (
    <Card.Root variant="outline" borderRadius="xl">
      <Card.Body>
        <HStack justify="space-between" align="flex-start">
          <Text fontSize="sm" fontWeight="500" color="fg.muted">
            {title}
          </Text>
          <Box color="fg.muted">{icon}</Box>
        </HStack>
        <Text fontSize="3xl" fontWeight="800" color="fg" mt={2} lineHeight="1">
          {value}
        </Text>
        {description && (
          <Text fontSize="xs" color="fg.muted" mt={1}>
            {description}
          </Text>
        )}
      </Card.Body>
    </Card.Root>
  )
}
