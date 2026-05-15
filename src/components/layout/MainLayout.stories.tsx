import { Box, Paper, Stack, Typography } from '@mui/material'
import type { Meta, StoryObj } from '@storybook/react'
import { Route, Routes } from 'react-router'
import MainLayout from './MainLayout'

function StoryContent({ title }: { title: string }) {
  return (
    <Stack spacing={2.5}>
      <Box>
        <Typography component="h1" variant="h4">
          {title}
        </Typography>
        <Typography color="text.secondary" sx={{ mt: 0.75 }}>
          Authenticated workspace content renders inside the responsive MUI app shell.
        </Typography>
      </Box>
      <Paper elevation={0} sx={{ border: 1, borderColor: 'divider', borderRadius: 2, p: 3 }}>
        <Typography variant="subtitle1">Workspace preview</Typography>
        <Typography color="text.secondary" sx={{ mt: 1 }}>
          Sidebar, header actions, theme state, notification state, and route content share the same
          providers used by the application.
        </Typography>
      </Paper>
    </Stack>
  )
}

function renderShell() {
  return (
    <Routes>
      <Route element={<MainLayout />} path="/">
        <Route index element={<StoryContent title="Dashboard" />} />
        <Route path="resume" element={<StoryContent title="Resumes" />} />
        <Route path="settings" element={<StoryContent title="Settings" />} />
      </Route>
    </Routes>
  )
}

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

export const DefaultShell: Story = {
  render: renderShell,
}

export const DarkShell: Story = {
  render: renderShell,
  parameters: {
    appState: {
      initialEntries: ['/settings'],
      theme: 'dark',
    },
  },
}
