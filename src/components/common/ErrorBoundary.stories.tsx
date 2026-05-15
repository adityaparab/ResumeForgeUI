import { Alert, Typography } from '@mui/material'
import type { Meta, StoryObj } from '@storybook/react'
import ErrorBoundary from './ErrorBoundary'

function BrokenPreview(): never {
  throw new Error('Storybook preview error')
}

const meta = {
  title: 'Common/ErrorBoundary',
  component: ErrorBoundary,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
} satisfies Meta<typeof ErrorBoundary>

export default meta
type Story = StoryObj<typeof meta>

export const Normal: Story = {
  args: {
    children: <Typography color="text.secondary">Protected content rendered.</Typography>,
  },
}

export const DefaultFallback: Story = {
  args: {
    children: <BrokenPreview />,
  },
}

export const CustomFallback: Story = {
  args: {
    children: <BrokenPreview />,
    fallback: <Alert severity="error">Custom recovery surface</Alert>,
  },
}
