import { Box, type BoxProps, Paper, type PaperProps } from '@mui/material'
import type { SxProps, Theme } from '@mui/material/styles'
import { forwardRef } from 'react'

function sxArray(sx: SxProps<Theme> | undefined) {
  if (!sx) return []
  return Array.isArray(sx) ? sx : [sx]
}

const Card = forwardRef<HTMLDivElement, PaperProps>(({ sx, ...props }, ref) => (
  <Paper
    ref={ref}
    elevation={0}
    sx={[
      {
        bgcolor: 'background.paper',
        border: 1,
        borderColor: 'divider',
        borderRadius: 2,
        color: 'text.primary',
      },
      ...sxArray(sx),
    ]}
    {...props}
  />
))
Card.displayName = 'Card'

const CardHeader = forwardRef<HTMLDivElement, BoxProps>(({ sx, ...props }, ref) => (
  <Box
    ref={ref}
    sx={[{ display: 'flex', flexDirection: 'column', gap: 0.75, p: 3 }, ...sxArray(sx)]}
    {...props}
  />
))
CardHeader.displayName = 'CardHeader'

const CardTitle = forwardRef<HTMLDivElement, BoxProps>(({ sx, ...props }, ref) => (
  <Box ref={ref} sx={[{ fontWeight: 700, lineHeight: 1.25 }, ...sxArray(sx)]} {...props} />
))
CardTitle.displayName = 'CardTitle'

const CardDescription = forwardRef<HTMLDivElement, BoxProps>(({ sx, ...props }, ref) => (
  <Box
    ref={ref}
    sx={[{ color: 'text.secondary', fontSize: '0.875rem' }, ...sxArray(sx)]}
    {...props}
  />
))
CardDescription.displayName = 'CardDescription'

const CardContent = forwardRef<HTMLDivElement, BoxProps>(({ sx, ...props }, ref) => (
  <Box ref={ref} sx={[{ p: 3, pt: 0 }, ...sxArray(sx)]} {...props} />
))
CardContent.displayName = 'CardContent'

const CardFooter = forwardRef<HTMLDivElement, BoxProps>(({ sx, ...props }, ref) => (
  <Box
    ref={ref}
    sx={[{ alignItems: 'center', display: 'flex', p: 3, pt: 0 }, ...sxArray(sx)]}
    {...props}
  />
))
CardFooter.displayName = 'CardFooter'

export { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle }
