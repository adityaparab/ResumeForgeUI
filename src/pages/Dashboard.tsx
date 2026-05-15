import AddRoundedIcon from '@mui/icons-material/AddRounded'
import AnalyticsRoundedIcon from '@mui/icons-material/AnalyticsRounded'
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded'
import DescriptionRoundedIcon from '@mui/icons-material/DescriptionRounded'
import PlaylistAddCheckRoundedIcon from '@mui/icons-material/PlaylistAddCheckRounded'
import QueryStatsRoundedIcon from '@mui/icons-material/QueryStatsRounded'
import RefreshRoundedIcon from '@mui/icons-material/RefreshRounded'
import UploadFileRoundedIcon from '@mui/icons-material/UploadFileRounded'
import { Alert, Box, Button, Chip, LinearProgress, Paper, Stack, Typography } from '@mui/material'
import { Link as RouterLink } from 'react-router'
import { StatsCard } from '@/features/dashboard/components/StatsCard'
import { StatsCardSkeleton } from '@/features/dashboard/components/StatsCardSkeleton'
import { useDashboardStats } from '@/features/dashboard/hooks/useDashboardStats'

function boundedPercent(value: number) {
  return Math.min(100, Math.max(0, value))
}

export default function Dashboard() {
  const { totalResumes, totalAnalyses, isLoading, isError, refetch } = useDashboardStats()
  const totalActivity = totalResumes + totalAnalyses
  const analysisCoverage =
    totalResumes > 0 ? boundedPercent(Math.round((totalAnalyses / totalResumes) * 100)) : 0
  const statusLabel = isError ? 'Needs attention' : isLoading ? 'Syncing' : 'Ready'
  const statusColor = isError ? 'error' : isLoading ? 'warning' : 'success'

  return (
    <Box sx={{ display: 'grid', gap: 4 }}>
      <Stack
        direction={{ xs: 'column', md: 'row' }}
        spacing={2.5}
        sx={{ alignItems: { xs: 'stretch', md: 'center' }, justifyContent: 'space-between' }}
      >
        <Box>
          <Typography component="h1" variant="h4">
            Dashboard
          </Typography>
          <Typography color="text.secondary" sx={{ mt: 0.75 }}>
            Overview of resume inventory, analysis volume, and next actions.
          </Typography>
        </Box>

        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
          <Button
            component={RouterLink}
            to="/analysis"
            variant="outlined"
            startIcon={<AnalyticsRoundedIcon />}
            fullWidth
          >
            Analyze Resume
          </Button>
          <Button
            component={RouterLink}
            to="/resume"
            variant="contained"
            startIcon={<AddRoundedIcon />}
            fullWidth
          >
            Upload Resume
          </Button>
        </Stack>
      </Stack>

      {isError && (
        <Alert
          severity="error"
          action={
            <Button
              color="inherit"
              size="small"
              startIcon={<RefreshRoundedIcon />}
              onClick={refetch}
            >
              Retry
            </Button>
          }
        >
          Failed to load dashboard stats. Please try again.
        </Alert>
      )}

      <Box component="section" aria-label="Summary statistics">
        <Box
          sx={{
            display: 'grid',
            gap: 2,
            gridTemplateColumns: {
              xs: '1fr',
              sm: 'repeat(2, minmax(0, 1fr))',
              lg: 'repeat(3, minmax(0, 1fr))',
            },
          }}
        >
          {isLoading ? (
            <>
              <StatsCardSkeleton />
              <StatsCardSkeleton />
              <StatsCardSkeleton />
            </>
          ) : (
            <>
              <StatsCard
                title="Total Resumes"
                value={totalResumes}
                description="Resumes uploaded so far"
                icon={<DescriptionRoundedIcon />}
              />
              <StatsCard
                title="Total Analyses"
                value={totalAnalyses}
                description="AI analyses completed"
                icon={<QueryStatsRoundedIcon />}
                tone="secondary"
              />
              <StatsCard
                title="Workspace Activity"
                value={totalActivity}
                description="Combined resume and analysis records"
                icon={<PlaylistAddCheckRoundedIcon />}
                tone="success"
              />
            </>
          )}
        </Box>
      </Box>

      <Box
        sx={{
          display: 'grid',
          gap: 3,
          gridTemplateColumns: { xs: '1fr', lg: 'minmax(0, 1.35fr) minmax(320px, 0.65fr)' },
        }}
      >
        <Box component="section" aria-label="Quick actions">
          <Stack spacing={2}>
            <Typography component="h2" variant="h6">
              Quick Actions
            </Typography>
            <Box
              sx={{
                display: 'grid',
                gap: 2,
                gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, minmax(0, 1fr))' },
              }}
            >
              <Paper
                elevation={0}
                sx={{ border: 1, borderColor: 'divider', borderRadius: 2, p: 2.5 }}
              >
                <Stack spacing={2}>
                  <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
                    <Box
                      sx={{
                        alignItems: 'center',
                        bgcolor: 'primary.main',
                        borderRadius: 1,
                        color: 'primary.contrastText',
                        display: 'flex',
                        height: 42,
                        justifyContent: 'center',
                        width: 42,
                      }}
                    >
                      <UploadFileRoundedIcon />
                    </Box>
                    <Box>
                      <Typography variant="subtitle1">Upload Resume</Typography>
                      <Typography color="text.secondary" variant="body2">
                        Add a PDF or DOCX file
                      </Typography>
                    </Box>
                  </Stack>
                  <Button
                    component={RouterLink}
                    to="/resume"
                    endIcon={<ArrowForwardRoundedIcon />}
                    variant="outlined"
                    fullWidth
                  >
                    Open resumes
                  </Button>
                </Stack>
              </Paper>

              <Paper
                elevation={0}
                sx={{ border: 1, borderColor: 'divider', borderRadius: 2, p: 2.5 }}
              >
                <Stack spacing={2}>
                  <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
                    <Box
                      sx={{
                        alignItems: 'center',
                        bgcolor: 'secondary.main',
                        borderRadius: 1,
                        color: 'secondary.contrastText',
                        display: 'flex',
                        height: 42,
                        justifyContent: 'center',
                        width: 42,
                      }}
                    >
                      <AnalyticsRoundedIcon />
                    </Box>
                    <Box>
                      <Typography variant="subtitle1">Analyze Resume</Typography>
                      <Typography color="text.secondary" variant="body2">
                        Compare against a job description
                      </Typography>
                    </Box>
                  </Stack>
                  <Button
                    component={RouterLink}
                    to="/analysis"
                    endIcon={<ArrowForwardRoundedIcon />}
                    variant="outlined"
                    fullWidth
                  >
                    Open analyses
                  </Button>
                </Stack>
              </Paper>
            </Box>
          </Stack>
        </Box>

        <Paper
          component="section"
          aria-label="Workflow status"
          elevation={0}
          sx={{ border: 1, borderColor: 'divider', borderRadius: 2, p: 3 }}
        >
          <Stack spacing={2.5}>
            <Stack
              direction="row"
              spacing={2}
              sx={{ alignItems: 'center', justifyContent: 'space-between' }}
            >
              <Box>
                <Typography component="h2" variant="h6">
                  Workflow Status
                </Typography>
                <Typography color="text.secondary" variant="body2">
                  Analysis coverage across uploaded resumes
                </Typography>
              </Box>
              <Chip color={statusColor} label={statusLabel} size="small" />
            </Stack>

            <Box>
              <Stack direction="row" sx={{ justifyContent: 'space-between', mb: 1 }}>
                <Typography color="text.secondary" variant="body2">
                  Coverage
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 700 }}>
                  {analysisCoverage}%
                </Typography>
              </Stack>
              <LinearProgress
                aria-label="Analysis coverage"
                value={analysisCoverage}
                variant="determinate"
                sx={{ borderRadius: 999, height: 8 }}
              />
            </Box>

            <Typography color="text.secondary" variant="body2">
              {totalResumes === 0
                ? 'Upload a resume to start building analysis history.'
                : `${totalAnalyses} analyses are available across ${totalResumes} uploaded resumes.`}
            </Typography>
          </Stack>
        </Paper>
      </Box>
    </Box>
  )
}
