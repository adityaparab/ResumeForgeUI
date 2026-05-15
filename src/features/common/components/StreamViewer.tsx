import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded'
import ErrorRoundedIcon from '@mui/icons-material/ErrorRounded'
import HourglassEmptyRoundedIcon from '@mui/icons-material/HourglassEmptyRounded'
import RadioButtonUncheckedRoundedIcon from '@mui/icons-material/RadioButtonUncheckedRounded'
import SyncRoundedIcon from '@mui/icons-material/SyncRounded'
import {
  Alert,
  Box,
  Chip,
  CircularProgress,
  LinearProgress,
  Paper,
  Stack,
  Typography,
} from '@mui/material'
import type { AlertColor } from '@mui/material/Alert'
import type { ChipProps } from '@mui/material/Chip'
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

const STATUS_CONFIG: Record<
  StreamStatus,
  {
    chipColor: ChipProps['color']
    alertSeverity: AlertColor
    description: string
    icon: React.ReactElement
    variant: ChipProps['variant']
  }
> = {
  idle: {
    chipColor: 'default',
    alertSeverity: 'info',
    description: 'Waiting for the job stream to become available.',
    icon: <RadioButtonUncheckedRoundedIcon />,
    variant: 'outlined',
  },
  connecting: {
    chipColor: 'warning',
    alertSeverity: 'warning',
    description: 'Connecting to the live job stream.',
    icon: <HourglassEmptyRoundedIcon />,
    variant: 'filled',
  },
  streaming: {
    chipColor: 'info',
    alertSeverity: 'info',
    description: 'Receiving live job output.',
    icon: <SyncRoundedIcon />,
    variant: 'filled',
  },
  done: {
    chipColor: 'success',
    alertSeverity: 'success',
    description: 'The job has completed successfully.',
    icon: <CheckCircleRoundedIcon />,
    variant: 'filled',
  },
  failed: {
    chipColor: 'error',
    alertSeverity: 'error',
    description: 'The job failed before it could complete.',
    icon: <ErrorRoundedIcon />,
    variant: 'filled',
  },
}

function isActiveStatus(status: StreamStatus) {
  return status === 'connecting' || status === 'streaming'
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
  const statusConfig = STATUS_CONFIG[status]

  useEffect(() => {
    if (status === 'streaming' && fullText.length > 0) {
      const output = outputRef.current
      if (output) {
        output.scrollTop = output.scrollHeight
      }
    }
  }, [status, fullText])

  useEffect(() => {
    if (status === 'done') {
      onDone?.()
    }
  }, [status, onDone])

  return (
    <Stack spacing={3}>
      <Paper
        elevation={0}
        sx={{ border: 1, borderColor: 'divider', borderRadius: 2, overflow: 'hidden' }}
      >
        <Stack spacing={2.5} sx={{ p: { xs: 2, sm: 3 } }}>
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={2}
            sx={{ alignItems: { xs: 'flex-start', sm: 'center' }, justifyContent: 'space-between' }}
          >
            <Box>
              <Typography component="h1" variant="h4">
                {title}
              </Typography>
              {subtitle && (
                <Typography color="text.secondary" sx={{ mt: 0.75 }}>
                  {subtitle}
                </Typography>
              )}
            </Box>
            <Chip
              color={statusConfig.chipColor}
              icon={statusConfig.icon}
              label={STATUS_LABELS[status]}
              variant={statusConfig.variant}
              sx={{ alignSelf: { xs: 'flex-start', sm: 'center' }, fontWeight: 700 }}
            />
          </Stack>

          {isActiveStatus(status) && (
            <LinearProgress aria-label={`${STATUS_LABELS[status]} progress`} color="primary" />
          )}

          {status === 'failed' ? (
            <Alert severity="error" role="alert">
              {error ?? statusConfig.description}
            </Alert>
          ) : (
            <Alert severity={statusConfig.alertSeverity} role="status">
              <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                {isActiveStatus(status) && <CircularProgress color="inherit" size={16} />}
                <span>{statusConfig.description}</span>
              </Stack>
            </Alert>
          )}
        </Stack>
      </Paper>

      <Paper
        ref={outputRef}
        elevation={0}
        aria-label="Stream output"
        aria-live="polite"
        role="log"
        sx={{
          bgcolor: 'background.paper',
          border: 1,
          borderColor: 'divider',
          borderRadius: 2,
          fontFamily:
            'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
          fontSize: '0.875rem',
          lineHeight: 1.7,
          maxHeight: 'calc(100vh - 18rem)',
          minHeight: 192,
          overflowY: 'auto',
          p: { xs: 2, sm: 3 },
        }}
      >
        {fullText ? (
          <Box
            component="pre"
            sx={{
              color: 'text.primary',
              fontFamily: 'inherit',
              m: 0,
              overflowWrap: 'anywhere',
              whiteSpace: 'pre-wrap',
            }}
          >
            {fullText}
          </Box>
        ) : (
          <Typography color="text.secondary" sx={{ fontFamily: 'inherit' }}>
            {status === 'failed' ? 'No output.' : 'Waiting for output…'}
          </Typography>
        )}
      </Paper>
    </Stack>
  )
}
