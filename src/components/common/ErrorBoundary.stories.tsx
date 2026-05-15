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
    children: <p className="text-sm text-muted-foreground">Protected content rendered.</p>,
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
    fallback: (
      <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-6 py-4 text-destructive text-sm">
        Custom recovery surface
      </div>
    ),
  },
}
