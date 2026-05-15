import type { Meta, StoryObj } from '@storybook/react'
import MainLayout from './MainLayout'

const meta = {
  title: 'Layout/MainLayout',
  component: MainLayout,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    appState: {
      initialEntries: ['/resume'],
    },
  },
} satisfies Meta<typeof MainLayout>

export default meta
type Story = StoryObj<typeof meta>

export const DefaultShell: Story = {}

export const DarkShell: Story = {
  parameters: {
    appState: {
      initialEntries: ['/settings'],
      theme: 'dark',
    },
  },
}
