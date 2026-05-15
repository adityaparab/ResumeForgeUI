import { styled } from '@mui/material/styles'
import * as React from 'react'

export interface LabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {}

const StyledLabel = styled('label')(({ theme }) => ({
  color: theme.palette.text.primary,
  fontSize: theme.typography.body2.fontSize,
  fontWeight: 700,
  lineHeight: 1.25,
}))

const Label = React.forwardRef<HTMLLabelElement, LabelProps>((props, ref) => (
  <StyledLabel ref={ref} {...props} />
))
Label.displayName = 'Label'

export { Label }
