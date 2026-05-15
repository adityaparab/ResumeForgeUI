import { Spinner, Text, VStack } from '@chakra-ui/react'

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg'
  label?: string
}

const sizeMap = {
  sm: 'sm',
  md: 'md',
  lg: 'xl',
} as const

export default function LoadingSpinner({ size = 'md', label }: LoadingSpinnerProps) {
  return (
    <VStack gap={2} align="center" justify="center" role="status" aria-label={label ?? 'Loading'}>
      <Spinner size={sizeMap[size]} colorPalette="purple" />
      {label && (
        <Text fontSize="sm" color="fg.muted">
          {label}
        </Text>
      )}
    </VStack>
  )
}
