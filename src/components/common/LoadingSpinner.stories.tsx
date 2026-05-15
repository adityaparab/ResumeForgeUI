import type { Meta, StoryObj } from '@storybook/react'
import LoadingSpinner from './LoadingSpinner'

const meta = {
  title: 'Common/LoadingSpinner',
  component: LoadingSpinner,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
} satisfies Meta<typeof LoadingSpinner>

export default meta
type Story = StoryObj<typeof meta>

export const Medium: Story = {}

export const Small: Story = {
  args: {
    size: 'sm',
  },
}

export const LargeWithLabel: Story = {
  args: {
    size: 'lg',
    label: 'Loading resume analysis',
  },
}
