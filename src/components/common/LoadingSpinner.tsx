import { CircularProgress, Stack, Typography } from '@mui/material'

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg'
  className?: string
  label?: string
}

const sizeMap = {
  sm: 18,
  md: 32,
  lg: 48,
}

export default function LoadingSpinner({ size = 'md', className, label }: LoadingSpinnerProps) {
  return (
    <Stack
      className={className}
      role="status"
      aria-label={label ?? 'Loading'}
      sx={{ alignItems: 'center', justifyContent: 'center', gap: 1 }}
    >
      <CircularProgress size={sizeMap[size]} thickness={4} aria-hidden="true" />
      {label && (
        <Typography variant="body2" color="text.secondary">
          {label}
        </Typography>
      )}
    </Stack>
  )
}
