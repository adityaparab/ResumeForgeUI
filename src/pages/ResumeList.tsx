import ArticleRoundedIcon from '@mui/icons-material/ArticleRounded'
import OpenInNewRoundedIcon from '@mui/icons-material/OpenInNewRounded'
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
import { ResumeUploadForm } from '@/features/resume/components/ResumeUploadForm'
import { useResumesList } from '@/features/resume/hooks/useResumesList'
import type { Resume } from '@/lib/schemas/resume.schema'

const STATUS_CHIP: Record<string, { color: ChipProps['color']; variant: ChipProps['variant'] }> = {
  completed: { color: 'success', variant: 'filled' },
  failed: { color: 'error', variant: 'filled' },
  pending: { color: 'warning', variant: 'filled' },
  processing: { color: 'info', variant: 'filled' },
  queued: { color: 'warning', variant: 'filled' },
}

const ONGOING_STATUSES = new Set(['pending', 'processing', 'queued'])
const SKELETON_ROWS = ['first', 'second', 'third'] as const
const SKELETON_CELLS = ['file', 'type', 'status', 'uploaded', 'actions'] as const

function isOngoingStatus(status: string) {
  return ONGOING_STATUSES.has(status)
}

function getFileTypeLabel(mimeType: string) {
  return mimeType.includes('pdf') ? 'PDF' : 'DOCX'
}

function getStatusChipProps(status: string) {
  return STATUS_CHIP[status] ?? { color: 'default', variant: 'outlined' as const }
}

function formatUploadedDate(value: string) {
  return new Date(value).toLocaleDateString()
}

export default function ResumeList() {
  const navigate = useNavigate()
  const { data, isLoading } = useResumesList()
  const resumes = data?.data ?? []

  function renderActions(resume: Resume) {
    if (resume.status === 'completed') {
      return (
        <Button
          type="button"
          size="small"
          endIcon={<OpenInNewRoundedIcon />}
          onClick={() => navigate(`/resume/${resume.id}`)}
        >
          View
        </Button>
      )
    }
    if (isOngoingStatus(resume.status)) {
      return (
        <Button
          type="button"
          size="small"
          endIcon={<TroubleshootRoundedIcon />}
          onClick={() => navigate(`/resume/stream/${resume.id}`)}
        >
          View Stream
        </Button>
      )
    }
    if (resume.status === 'failed') {
      return (
        <Button
          type="button"
          color="error"
          size="small"
          endIcon={<OpenInNewRoundedIcon />}
          onClick={() => navigate(`/resume/${resume.id}`)}
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
            Resumes
          </Typography>
          <Typography color="text.secondary" sx={{ mt: 0.75 }}>
            Upload, process, and inspect resume extraction jobs.
          </Typography>
        </Box>
        <Chip
          icon={<ArticleRoundedIcon />}
          label={`${data?.total ?? 0} total`}
          variant="outlined"
          sx={{ alignSelf: { xs: 'flex-start', md: 'center' } }}
        />
      </Stack>

      <Box component="section" aria-label="Upload a new resume">
        <Stack spacing={2}>
          <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
            <UploadFileRoundedIcon color="primary" />
            <Typography component="h2" variant="h6">
              Upload New Resume
            </Typography>
          </Stack>
          <ResumeUploadForm />
        </Stack>
      </Box>

      <Box component="section" aria-label="Your resumes">
        <Stack spacing={2}>
          <Typography component="h2" variant="h6">
            Your Resumes
          </Typography>
          <TableContainer
            component={Paper}
            elevation={0}
            sx={{ border: 1, borderColor: 'divider', borderRadius: 2 }}
          >
            <Table aria-label="Resume list" sx={{ minWidth: 760 }}>
              <TableHead>
                <TableRow>
                  <TableCell>File Name</TableCell>
                  <TableCell>Type</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Uploaded</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {isLoading ? (
                  SKELETON_ROWS.map((row) => (
                    <TableRow key={`resume-skeleton-${row}`}>
                      {SKELETON_CELLS.map((cell) => (
                        <TableCell key={`resume-skeleton-${row}-${cell}`}>
                          <Skeleton animation="wave" height={28} />
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : resumes.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} align="center" sx={{ py: 6 }}>
                      <Typography color="text.secondary">
                        No resumes yet. Upload one above to get started.
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  resumes.map((resume) => (
                    <TableRow hover key={resume.id}>
                      <TableCell>
                        <Typography variant="body2" sx={{ fontWeight: 700 }}>
                          {resume.originalName}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={getFileTypeLabel(resume.mimeType)}
                          size="small"
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={resume.status}
                          size="small"
                          {...getStatusChipProps(resume.status)}
                        />
                      </TableCell>
                      <TableCell>
                        <Typography color="text.secondary" variant="body2">
                          {formatUploadedDate(resume.createdAt)}
                        </Typography>
                      </TableCell>
                      <TableCell align="right">{renderActions(resume)}</TableCell>
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
