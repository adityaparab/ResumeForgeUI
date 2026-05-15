import { Alert, AlertTitle, Box, Button, Paper, Typography } from '@mui/material'
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
        <Box sx={{ display: 'grid', minHeight: 400, placeItems: 'center', p: 3 }}>
          <Paper
            variant="outlined"
            sx={{ width: '100%', maxWidth: 560, borderRadius: 2, p: { xs: 2, sm: 3 } }}
          >
            <Alert severity="error" variant="outlined" sx={{ mb: 2 }}>
              <AlertTitle>Something went wrong</AlertTitle>
              <Typography variant="body2">
                {this.state.error?.message ?? 'An unexpected error occurred. Please try again.'}
              </Typography>
            </Alert>
            <Button onClick={this.handleReset} variant="outlined">
              Try Again
            </Button>
          </Paper>
        </Box>
      )
    }

    return this.props.children
  }
}
