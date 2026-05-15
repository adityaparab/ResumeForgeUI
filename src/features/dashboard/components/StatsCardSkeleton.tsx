import { Card, Skeleton, SkeletonText } from '@chakra-ui/react'

export function StatsCardSkeleton() {
  return (
    <Card.Root variant="outline" borderRadius="xl">
      <Card.Body>
        <SkeletonText noOfLines={1} w="24" mb={2} />
        <Skeleton h="9" w="16" mb={1} />
        <SkeletonText noOfLines={1} w="32" />
      </Card.Body>
    </Card.Root>
  )
}
