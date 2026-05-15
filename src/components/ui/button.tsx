import { Button as MuiButton, type ButtonProps as MuiButtonProps } from '@mui/material'
import type { SxProps, Theme } from '@mui/material/styles'
import type { ElementType, ReactElement } from 'react'
import { forwardRef, isValidElement } from 'react'

type LegacyButtonVariant = 'default' | 'outline' | 'secondary' | 'ghost' | 'destructive' | 'link'
type LegacyButtonSize = 'default' | 'xs' | 'sm' | 'lg' | 'icon' | 'icon-xs' | 'icon-sm' | 'icon-lg'

export type ButtonProps = Omit<MuiButtonProps, 'color' | 'size' | 'variant'> & {
  render?: ReactElement
  size?: LegacyButtonSize
  variant?: LegacyButtonVariant
}

function sxArray(sx: SxProps<Theme> | undefined) {
  if (!sx) return []
  return Array.isArray(sx) ? sx : [sx]
}

function getMuiVariant(variant: LegacyButtonVariant): Pick<MuiButtonProps, 'color' | 'variant'> {
  if (variant === 'outline') return { color: 'primary', variant: 'outlined' }
  if (variant === 'secondary') return { color: 'secondary', variant: 'contained' }
  if (variant === 'ghost') return { color: 'inherit', variant: 'text' }
  if (variant === 'destructive') return { color: 'error', variant: 'contained' }
  if (variant === 'link') return { color: 'primary', variant: 'text' }
  return { color: 'primary', variant: 'contained' }
}

function getMuiSize(size: LegacyButtonSize): MuiButtonProps['size'] {
  if (size === 'xs' || size === 'sm' || size === 'icon-xs' || size === 'icon-sm') return 'small'
  if (size === 'lg' || size === 'icon-lg') return 'large'
  return 'medium'
}

function getSizeSx(size: LegacyButtonSize) {
  if (size === 'xs') return { minHeight: 28, px: 1.25, py: 0.25 }
  if (size === 'sm') return { minHeight: 32, px: 1.5, py: 0.5 }
  if (size === 'lg') return { minHeight: 40, px: 2 }
  if (size === 'icon' || size === 'icon-sm') return { minHeight: 36, minWidth: 36, px: 0 }
  if (size === 'icon-xs') return { minHeight: 30, minWidth: 30, px: 0 }
  if (size === 'icon-lg') return { minHeight: 42, minWidth: 42, px: 0 }
  return { minHeight: 36 }
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ children, render, size = 'default', sx, variant = 'default', ...props }, ref) => {
    const { children: _renderChildren, ...renderProps } = isValidElement(render)
      ? (render.props as Record<string, unknown>)
      : {}
    const component = isValidElement(render) ? (render.type as ElementType) : undefined

    return (
      <MuiButton
        ref={ref}
        component={component}
        size={getMuiSize(size)}
        sx={[
          {
            borderRadius: 1,
            gap: 0.75,
            textTransform: 'none',
            whiteSpace: 'nowrap',
            ...(variant === 'link' && { minWidth: 0, p: 0 }),
          },
          getSizeSx(size),
          ...sxArray(sx),
        ]}
        {...getMuiVariant(variant)}
        {...renderProps}
        {...props}
      >
        {children}
      </MuiButton>
    )
  },
)
Button.displayName = 'Button'

export { Button }
