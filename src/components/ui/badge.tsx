import { Chip, type ChipProps } from '@mui/material'
import { alpha, type SxProps, type Theme } from '@mui/material/styles'
import type { ReactNode } from 'react'

type BadgeVariant = 'default' | 'secondary' | 'outline' | 'success' | 'warning' | 'destructive'

export type BadgeProps = Omit<ChipProps, 'children' | 'color' | 'label' | 'size' | 'variant'> & {
  children?: ReactNode
  variant?: BadgeVariant
}

function sxArray(sx: SxProps<Theme> | undefined) {
  if (!sx) return []
  return Array.isArray(sx) ? sx : [sx]
}

function getBadgeProps(variant: BadgeVariant): Pick<ChipProps, 'color' | 'variant'> {
  if (variant === 'secondary') return { color: 'secondary', variant: 'filled' }
  if (variant === 'success') return { color: 'success', variant: 'filled' }
  if (variant === 'warning') return { color: 'warning', variant: 'filled' }
  if (variant === 'destructive') return { color: 'error', variant: 'filled' }
  if (variant === 'outline') return { color: 'default', variant: 'outlined' }
  return { color: 'primary', variant: 'outlined' }
}

function getBadgeSx(variant: BadgeVariant): SxProps<Theme> {
  if (variant === 'default') {
    return (theme) => ({
      bgcolor: alpha(theme.palette.primary.main, 0.08),
      borderColor: alpha(theme.palette.primary.main, 0.28),
    })
  }
  return {}
}

function Badge({ children, sx, variant = 'default', ...props }: BadgeProps) {
  return (
    <Chip
      component="span"
      label={children}
      size="small"
      sx={[{ borderRadius: 999, fontWeight: 700 }, getBadgeSx(variant), ...sxArray(sx)]}
      {...getBadgeProps(variant)}
      {...props}
    />
  )
}

export { Badge }
