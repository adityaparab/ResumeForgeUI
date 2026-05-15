import { Button, Center, Heading, Text, VStack } from '@chakra-ui/react'
import * as Sentry from '@sentry/react'
import { Component, type ErrorInfo, type ReactNode } from 'react'

interface ErrorBoundaryProps {
  children: ReactNode
  fallback?: ReactNode
}

interface ErrorBoundaryState {
  hasError: boolean
  error: Error | null
}

export default class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error('ErrorBoundary caught:', error, errorInfo)
    Sentry.captureException(error, { extra: { componentStack: errorInfo.componentStack } })
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null })
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }

      return (
        <Center minH="400px" p={8}>
          <VStack gap={4} textAlign="center">
            <Text fontSize="4xl" color="red.500" fontWeight="bold">
              !
            </Text>
            <Heading size="md" color="fg">
              Something went wrong
            </Heading>
            <Text color="fg.muted" maxW="md">
              {this.state.error?.message ?? 'An unexpected error occurred. Please try again.'}
            </Text>
            <Button variant="outline" colorPalette="purple" onClick={this.handleReset}>
              Try Again
            </Button>
          </VStack>
        </Center>
      )
    }

    return this.props.children
  }
}
