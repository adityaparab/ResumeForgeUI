import { Box } from '@mui/material'
import type { Meta, StoryObj } from '@storybook/react'
import { expect, fn, userEvent, within } from '@storybook/test'
import type { ActiveJob } from '@/stores/uiSlice'
import Header from './Header'

const notificationJobs = [
  {
    id: 'analysis-story',
    type: 'analysis',
    status: 'processing',
    label: 'Senior React analysis',
    createdAt: '2026-05-15T10:00:00Z',
  },
  {
    id: 'resume-story',
    type: 'resume-upload',
    status: 'completed',
    label: 'aditya-resume.pdf',
    createdAt: '2026-05-15T09:30:00Z',
  },
] satisfies ActiveJob[]

const meta = {
  title: 'Layout/Header',
  component: Header,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
  },
  args: {
    onToggleSidebar: fn(),
  },
  decorators: [
    (Story) => (
      <Box sx={{ minHeight: 128, bgcolor: 'background.default', color: 'text.primary' }}>
        <Story />
      </Box>
    ),
  ],
} satisfies Meta<typeof Header>

export default meta
type Story = StoryObj<typeof meta>

export const Authenticated: Story = {}

export const SignedOut: Story = {
  parameters: {
    appState: {
      user: null,
    },
  },
}

export const DarkMode: Story = {
  parameters: {
    appState: {
      theme: 'dark',
    },
  },
}

export const WithNotificationsOpen: Story = {
  parameters: {
    appState: {
      activeJobs: notificationJobs,
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await userEvent.click(canvas.getByRole('button', { name: /notifications/i }))
    await expect(
      await within(document.body).findByRole('dialog', { name: /notifications/i }),
    ).toBeVisible()
  },
}
