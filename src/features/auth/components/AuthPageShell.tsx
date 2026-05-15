import AutoAwesomeRoundedIcon from '@mui/icons-material/AutoAwesomeRounded'
import DescriptionRoundedIcon from '@mui/icons-material/DescriptionRounded'
import InsightsRoundedIcon from '@mui/icons-material/InsightsRounded'
import LockRoundedIcon from '@mui/icons-material/LockRounded'
import { Box, Container, Paper, Stack, Typography } from '@mui/material'
import type { ReactNode } from 'react'

type AuthPageShellProps = {
  children: ReactNode
  footer: ReactNode
  subtitle: string
  title: string
}

const highlights = [
  { icon: InsightsRoundedIcon, label: 'Resume intelligence dashboard' },
  { icon: AutoAwesomeRoundedIcon, label: 'AI-backed analysis workflows' },
  { icon: LockRoundedIcon, label: 'Protected hiring workspace' },
]

export default function AuthPageShell({ children, footer, subtitle, title }: AuthPageShellProps) {
  return (
    <Box
      sx={{
        alignItems: 'center',
        bgcolor: 'background.default',
        display: 'flex',
        minHeight: '100dvh',
        px: { xs: 2, sm: 3 },
        py: { xs: 4, md: 8 },
      }}
    >
      <Container maxWidth="lg" disableGutters>
        <Paper
          elevation={0}
          sx={{
            border: 1,
            borderColor: 'divider',
            borderRadius: 2,
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', md: '0.95fr 1fr' },
            minHeight: { md: 640 },
            overflow: 'hidden',
          }}
        >
          <Box
            sx={{
              bgcolor: 'primary.dark',
              color: 'primary.contrastText',
              display: { xs: 'none', md: 'flex' },
              flexDirection: 'column',
              justifyContent: 'space-between',
              p: { md: 5, lg: 6 },
            }}
          >
            <Stack spacing={5}>
              <Stack spacing={2}>
                <Typography component="p" variant="overline" sx={{ opacity: 0.72 }}>
                  Resume operations
                </Typography>
                <Typography component="h1" variant="h3" sx={{ maxWidth: 420 }}>
                  Modern resume review, analysis, and tracking in one workspace.
                </Typography>
                <Typography variant="body1" sx={{ maxWidth: 440, opacity: 0.82 }}>
                  Upload resumes, launch analysis jobs, and review outcomes from a focused admin
                  dashboard built for repeated work.
                </Typography>
              </Stack>
            </Stack>

            <Stack spacing={2.25}>
              {highlights.map(({ icon: Icon, label }) => (
                <Stack key={label} direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
                  <Box
                    sx={{
                      alignItems: 'center',
                      bgcolor: 'rgba(255,255,255,0.14)',
                      border: '1px solid rgba(255,255,255,0.22)',
                      borderRadius: 1,
                      display: 'flex',
                      height: 36,
                      justifyContent: 'center',
                      width: 36,
                    }}
                  >
                    <Icon fontSize="small" />
                  </Box>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>
                    {label}
                  </Typography>
                </Stack>
              ))}
            </Stack>
          </Box>

          <Box
            sx={{
              alignItems: 'center',
              display: 'flex',
              justifyContent: 'center',
              p: { xs: 3, sm: 5, md: 6 },
            }}
          >
            <Stack spacing={4} sx={{ maxWidth: 440, width: '100%' }}>
              <Stack spacing={1.5} sx={{ textAlign: { xs: 'center', md: 'left' } }}>
                <Stack
                  direction="row"
                  spacing={1.25}
                  sx={{
                    alignItems: 'center',
                    justifyContent: { xs: 'center', md: 'flex-start' },
                  }}
                >
                  <DescriptionRoundedIcon color="primary" />
                  <Typography component="span" variant="h5" sx={{ fontWeight: 800 }}>
                    ResumeForge
                  </Typography>
                </Stack>
                <Box>
                  <Typography component="h2" variant="h4">
                    {title}
                  </Typography>
                  <Typography color="text.secondary" sx={{ mt: 1 }}>
                    {subtitle}
                  </Typography>
                </Box>
              </Stack>

              {children}

              <Typography color="text.secondary" variant="body2" sx={{ textAlign: 'center' }}>
                {footer}
              </Typography>
            </Stack>
          </Box>
        </Paper>
      </Container>
    </Box>
  )
}
