import { Box, Flex, Heading, HStack, Spinner, Text, VStack } from '@chakra-ui/react'
import { useEffect, useRef } from 'react'
import type { StreamStatus } from '../hooks/useStreamJob'

interface StreamViewerProps {
  title: string
  subtitle?: string
  status: StreamStatus
  fullText: string
  error: string | null
  onDone?: () => void
}

const STATUS_LABELS: Record<StreamStatus, string> = {
  idle: 'Waiting…',
  connecting: 'Connecting…',
  streaming: 'Processing…',
  done: 'Complete',
  failed: 'Failed',
}

const STATUS_DOT_COLORS: Record<StreamStatus, string> = {
  idle: 'fg.muted',
  connecting: 'yellow.500',
  streaming: 'blue.500',
  done: 'green.500',
  failed: 'red.500',
}

export function StreamViewer({
  title,
  subtitle,
  status,
  fullText,
  error,
  onDone,
}: StreamViewerProps) {
  const outputRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (status === 'streaming' && fullText.length > 0) {
      const output = outputRef.current as HTMLDivElement
      output.scrollTop = output.scrollHeight
    }
  }, [status, fullText])

  useEffect(() => {
    if (status === 'done') {
      onDone?.()
    }
  }, [status, onDone])

  return (
    <VStack gap={6} align="stretch">
      {/* Header */}
      <Flex justify="space-between" align="flex-start" gap={4} wrap="wrap">
        <VStack gap={0.5} align="flex-start">
          <Heading as="h1" size="xl" color="fg">
            {title}
          </Heading>
          {subtitle && (
            <Text fontSize="sm" color="fg.muted">
              {subtitle}
            </Text>
          )}
        </VStack>

        {/* Status badge */}
        <HStack
          gap={2}
          px={3}
          py={1.5}
          borderRadius="full"
          borderWidth="1px"
          borderColor="border.subtle"
          bg="bg.subtle"
          flexShrink={0}
        >
          <Box w={2} h={2} borderRadius="full" bg={STATUS_DOT_COLORS[status]} aria-hidden="true" />
          <Text fontSize="sm" fontWeight="500" color="fg">
            {STATUS_LABELS[status]}
          </Text>
          {(status === 'connecting' || status === 'streaming') && (
            <Spinner size="xs" color="fg.muted" />
          )}
        </HStack>
      </Flex>

      {/* Error */}
      {status === 'failed' && error && (
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
            {error}
          </Text>
        </Box>
      )}

      {/* Output */}
      <Box
        ref={outputRef}
        maxH="calc(100vh - 18rem)"
        minH="48"
        overflowY="auto"
        borderRadius="xl"
        borderWidth="1px"
        borderColor="border.subtle"
        bg="bg.subtle"
        p={6}
        fontFamily="mono"
        fontSize="sm"
        lineHeight="relaxed"
        aria-label="Stream output"
        aria-live="polite"
        role="log"
      >
        {fullText ? (
          <Box as="pre" whiteSpace="pre-wrap" wordBreak="break-word" color="fg">
            {fullText}
          </Box>
        ) : (
          <Text color="fg.muted">{status === 'failed' ? 'No output.' : 'Waiting for output…'}</Text>
        )}
      </Box>
    </VStack>
  )
}
