import { alpha, styled } from '@mui/material/styles'
import * as React from 'react'

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

const StyledInput = styled('input')(({ theme }) => ({
  backgroundColor: 'transparent',
  border: `1px solid ${theme.palette.divider}`,
  borderRadius: theme.shape.borderRadius,
  boxShadow: theme.shadows[1],
  color: theme.palette.text.primary,
  font: 'inherit',
  fontSize: theme.typography.body2.fontSize,
  height: 36,
  padding: '4px 12px',
  transition: theme.transitions.create(['border-color', 'box-shadow'], { duration: 120 }),
  width: '100%',
  '&::placeholder': {
    color: theme.palette.text.secondary,
    opacity: 1,
  },
  '&:focus-visible': {
    borderColor: theme.palette.primary.main,
    boxShadow: `0 0 0 3px ${alpha(theme.palette.primary.main, 0.16)}`,
    outline: 'none',
  },
  '&:disabled': {
    cursor: 'not-allowed',
    opacity: 0.5,
  },
  '&[aria-invalid="true"]': {
    borderColor: theme.palette.error.main,
  },
}))

const Input = React.forwardRef<HTMLInputElement, InputProps>(({ type, ...props }, ref) => (
  <StyledInput ref={ref} type={type} {...props} />
))
Input.displayName = 'Input'

export { Input }
