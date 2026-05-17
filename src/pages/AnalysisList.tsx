import AnalyticsRoundedIcon from '@mui/icons-material/AnalyticsRounded'
import OpenInNewRoundedIcon from '@mui/icons-material/OpenInNewRounded'
import PsychologyRoundedIcon from '@mui/icons-material/PsychologyRounded'
import TroubleshootRoundedIcon from '@mui/icons-material/TroubleshootRounded'
import UploadFileRoundedIcon from '@mui/icons-material/UploadFileRounded'
import {
  Box,
  Button,
  Chip,
  Paper,
  Skeleton,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material'
import type { ChipProps } from '@mui/material/Chip'
import { useNavigate } from 'react-router'
import LoadingSpinner from '@/components/common/LoadingSpinner'
import { toast } from '@/components/common/toast'
import { AnalyzeForm } from '@/features/analysis/components/AnalyzeForm'
import { useAnalysesList } from '@/features/analysis/hooks/useAnalysesList'
import { useResumesForSelect } from '@/features/analysis/hooks/useResumesForSelect'
import { ResumeUploadForm } from '@/features/resume/components/ResumeUploadForm'
import type { Analysis } from '@/lib/schemas/analysis.schema'

const STATUS_CHIP: Record<string, { color: ChipProps['color']; variant: ChipProps['variant'] }> = {
  completed: { color: 'success', variant: 'filled' },
  failed: { color: 'error', variant: 'filled' },
  pending: { color: 'warning', variant: 'filled' },
  processing: { color: 'info', variant: 'filled' },
  queued: { color: 'warning', variant: 'filled' },
}

const ONGOING_STATUSES = new Set(['pending', 'processing', 'queued'])
const SKELETON_ROWS = ['first', 'second', 'third'] as const
const SKELETON_CELLS = ['id', 'resume', 'status', 'created', 'actions'] as const

function isOngoingStatus(status: string) {
  return ONGOING_STATUSES.has(status)
}

function shortId(id: string) {
  return `${id.slice(0, 8)}...`
}

function getStatusChipProps(status: string) {
  return STATUS_CHIP[status] ?? { color: 'default', variant: 'outlined' as const }
}

function formatCreatedDate(value: string) {
  return new Date(value).toLocaleDateString()
}

export default function AnalysisList() {
  const navigate = useNavigate()
  const { data, isLoading } = useAnalysesList()
  const { data: completedResumes = [], isLoading: isResumesLoading } = useResumesForSelect()
  const shouldShowUploadFallback = !isResumesLoading && completedResumes.length === 0
  const analyses = data?.data ?? []

  function renderActions(analysis: Analysis) {
    if (analysis.status === 'completed') {
      return (
        <Stack direction="row" spacing={1} sx={{ justifyContent: 'flex-end' }}>
          <Button
            type="button"
            size="small"
            endIcon={<OpenInNewRoundedIcon />}
            onClick={() => navigate(`/analysis/${analysis.id}`)}
          >
            View Result
          </Button>
          <Button
            type="button"
            size="small"
            variant="outlined"
            endIcon={<PsychologyRoundedIcon />}
            onClick={() => toast.info('Interview prep coming soon!')}
            title="Interview Prep (coming soon)"
          >
            Interview Prep
          </Button>
        </Stack>
      )
    }
    if (isOngoingStatus(analysis.status)) {
      return (
        <Button
          type="button"
          size="small"
          endIcon={<TroubleshootRoundedIcon />}
          onClick={() => navigate(`/analysis/stream/${analysis.id}`)}
        >
          View Stream
        </Button>
      )
    }
    if (analysis.status === 'failed') {
      return (
        <Button
          type="button"
          color="error"
          size="small"
          endIcon={<OpenInNewRoundedIcon />}
          onClick={() => navigate(`/analysis/${analysis.id}`)}
        >
          Failure Details
        </Button>
      )
    }
    return (
      <Typography color="text.secondary" variant="caption">
        No actions
      </Typography>
    )
  }

  return (
    <Box sx={{ display: 'grid', gap: 4 }}>
      <Stack
        direction={{ xs: 'column', md: 'row' }}
        spacing={2}
        sx={{ justifyContent: 'space-between' }}
      >
        <Box>
          <Typography component="h1" variant="h4">
            Analyses
          </Typography>
          <Typography color="text.secondary" sx={{ mt: 0.75 }}>
            Compare completed resumes against job descriptions and review analysis history.
          </Typography>
        </Box>
        <Chip
          icon={<AnalyticsRoundedIcon />}
          label={`${data?.total ?? 0} total`}
          variant="outlined"
          sx={{ alignSelf: { xs: 'flex-start', md: 'center' } }}
        />
      </Stack>

      <Box
        component="section"
        aria-label={
          shouldShowUploadFallback ? 'Upload resume for analysis' : 'Start a new analysis'
        }
      >
        <Stack spacing={2}>
          <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
            {shouldShowUploadFallback ? (
              <UploadFileRoundedIcon color="primary" />
            ) : (
              <TroubleshootRoundedIcon color="primary" />
            )}
            <Typography component="h2" variant="h6">
              {shouldShowUploadFallback ? 'Upload Resume' : 'New Analysis'}
            </Typography>
          </Stack>
          {isResumesLoading && (
            <Paper
              elevation={0}
              sx={{ border: 1, borderColor: 'divider', borderRadius: 2, p: { xs: 2, sm: 3 } }}
            >
              <LoadingSpinner label="Loading resumes" />
            </Paper>
          )}
          {shouldShowUploadFallback && <ResumeUploadForm />}
          {!isResumesLoading && !shouldShowUploadFallback && (
            <Paper
              elevation={0}
              sx={{ border: 1, borderColor: 'divider', borderRadius: 2, p: { xs: 2, sm: 3 } }}
            >
              <AnalyzeForm />
            </Paper>
          )}
        </Stack>
      </Box>

      <Box component="section" aria-label="Analysis history">
        <Stack spacing={2}>
          <Typography component="h2" variant="h6">
            History
          </Typography>
          <TableContainer
            component={Paper}
            elevation={0}
            sx={{ border: 1, borderColor: 'divider', borderRadius: 2 }}
          >
            <Table aria-label="Analysis history" sx={{ minWidth: 820 }}>
              <TableHead>
                <TableRow>
                  <TableCell>Title</TableCell>
                  <TableCell>Resume ID</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Created</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {isLoading ? (
                  SKELETON_ROWS.map((row) => (
                    <TableRow key={`analysis-skeleton-${row}`}>
                      {SKELETON_CELLS.map((cell) => (
                        <TableCell key={`analysis-skeleton-${row}-${cell}`}>
                          <Skeleton animation="wave" height={28} />
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : analyses.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} align="center" sx={{ py: 6 }}>
                      <Typography color="text.secondary">
                        No analyses yet. Submit a job description above to get started.
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  analyses.map((analysis) => (
                    <TableRow hover key={analysis.id}>
                      <TableCell>
                        {analysis.status === 'completed' ? (
                          <Typography variant="body2">{shortId(analysis.id)}</Typography>
                        ) : (
                          <Typography
                            color="text.secondary"
                            variant="body2"
                            sx={{ fontFamily: 'monospace' }}
                          >
                            {shortId(analysis.id)}
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                          {shortId(analysis.resumeId)}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={analysis.status}
                          size="small"
                          {...getStatusChipProps(analysis.status)}
                        />
                      </TableCell>
                      <TableCell>
                        <Typography color="text.secondary" variant="body2">
                          {formatCreatedDate(analysis.createdAt)}
                        </Typography>
                      </TableCell>
                      <TableCell align="right">{renderActions(analysis)}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Stack>
      </Box>
    </Box>
  )
}
