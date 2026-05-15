import { Box, Paper, Stack, Typography } from '@mui/material'
import type { ReactNode } from 'react'

type StatsCardTone = 'primary' | 'secondary' | 'success' | 'warning'

interface StatsCardProps {
  description?: string
  icon: ReactNode
  title: string
  tone?: StatsCardTone
  value: number | string
}

const tonePalette: Record<StatsCardTone, string> = {
  primary: 'primary.main',
  secondary: 'secondary.main',
  success: 'success.main',
  warning: 'warning.main',
}

export function StatsCard({ description, icon, title, tone = 'primary', value }: StatsCardProps) {
  return (
    <Paper
      elevation={0}
      sx={{
        bgcolor: 'background.paper',
        border: 1,
        borderColor: 'divider',
        borderRadius: 2,
        height: '100%',
        p: 3,
      }}
    >
      <Stack spacing={2}>
        <Stack
          direction="row"
          spacing={2}
          sx={{ alignItems: 'flex-start', justifyContent: 'space-between' }}
        >
          <Typography color="text.secondary" variant="body2" sx={{ fontWeight: 700 }}>
            {title}
          </Typography>
          <Box
            sx={{
              alignItems: 'center',
              bgcolor: `${tonePalette[tone]}14`,
              borderRadius: 1,
              color: tonePalette[tone],
              display: 'flex',
              height: 40,
              justifyContent: 'center',
              width: 40,
              '& svg': { fontSize: 22 },
            }}
          >
            {icon}
          </Box>
        </Stack>

        <Box>
          <Typography component="p" variant="h3">
            {value}
          </Typography>
          {description && (
            <Typography color="text.secondary" variant="caption">
              {description}
            </Typography>
          )}
        </Box>
      </Stack>
    </Paper>
  )
}
