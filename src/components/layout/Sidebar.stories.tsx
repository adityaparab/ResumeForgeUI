import type { Meta, StoryObj } from '@storybook/react'
import { fn } from '@storybook/test'
import Sidebar from './Sidebar'

const meta = {
  title: 'Layout/Sidebar',
  component: Sidebar,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    appState: {
      initialEntries: ['/analysis'],
    },
  },
  args: {
    isOpen: true,
    onClose: fn(),
  },
  decorators: [
    (Story) => (
      <div className="min-h-screen bg-background text-foreground">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Sidebar>

export default meta
type Story = StoryObj<typeof meta>

export const DesktopOpen: Story = {}

export const MobileOpen: Story = {
  parameters: {
    viewport: {
      defaultViewport: 'mobile1',
    },
  },
}

export const MobileClosed: Story = {
  args: {
    isOpen: false,
  },
  parameters: {
    viewport: {
      defaultViewport: 'mobile1',
    },
  },
}
