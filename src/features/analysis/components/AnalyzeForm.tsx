import { zodResolver } from '@hookform/resolvers/zod'
import RestartAltRoundedIcon from '@mui/icons-material/RestartAltRounded'
import TroubleshootRoundedIcon from '@mui/icons-material/TroubleshootRounded'
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Link as MuiLink,
  Stack,
  TextField,
} from '@mui/material'
import { useForm } from 'react-hook-form'
import { Link as RouterLink } from 'react-router'
import { type CreateAnalysisDto, CreateAnalysisDtoSchema } from '@/lib/schemas/analysis.schema'
import { useCreateAnalysisMutation } from '../hooks/useCreateAnalysisMutation'
import { useResumesForSelect } from '../hooks/useResumesForSelect'

export function AnalyzeForm() {
  const { data: resumes = [], isLoading: resumesLoading } = useResumesForSelect()
  const analysisMutation = useCreateAnalysisMutation()

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateAnalysisDto>({
    resolver: zodResolver(CreateAnalysisDtoSchema),
  })

  function onSubmit(data: CreateAnalysisDto) {
    analysisMutation.mutate(data)
  }

  const { ref: resumeRef, ...resumeField } = register('resumeId')
  const { ref: jobDescriptionRef, ...jobDescriptionField } = register('jobDescription')

  return (
    <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate aria-label="Analyze resume">
      <Stack spacing={2.5}>
        <TextField
          id="resumeId"
          label="Resume"
          select
          disabled={resumesLoading}
          error={Boolean(errors.resumeId)}
          helperText={errors.resumeId?.message}
          inputRef={resumeRef}
          fullWidth
          slotProps={{
            select: {
              native: true,
            },
            formHelperText: {
              id: 'resumeId-error',
              role: errors.resumeId ? 'alert' : undefined,
            },
          }}
          {...resumeField}
        >
          <option value="">{resumesLoading ? 'Loading resumes...' : 'Select a resume'}</option>
          {resumes.map((resume) => (
            <option key={resume.value} value={resume.value}>
              {resume.label}
            </option>
          ))}
        </TextField>

        {!resumesLoading && resumes.length === 0 && (
          <Alert severity="info">
            No completed resumes found.{' '}
            <MuiLink component={RouterLink} to="/resume" underline="hover" sx={{ fontWeight: 700 }}>
              Upload one first.
            </MuiLink>
          </Alert>
        )}

        <TextField
          id="jobDescription"
          label="Job Description"
          multiline
          minRows={8}
          placeholder="Paste the full job description here (min 20 characters)"
          error={Boolean(errors.jobDescription)}
          helperText={errors.jobDescription?.message}
          inputRef={jobDescriptionRef}
          fullWidth
          slotProps={{
            formHelperText: {
              id: 'jobDescription-error',
              role: errors.jobDescription ? 'alert' : undefined,
            },
          }}
          {...jobDescriptionField}
        />

        <Stack
          direction={{ xs: 'column-reverse', sm: 'row' }}
          spacing={1.5}
          sx={{ justifyContent: 'flex-end' }}
        >
          <Button
            type="button"
            variant="text"
            onClick={() => reset()}
            disabled={analysisMutation.isPending}
            startIcon={<RestartAltRoundedIcon />}
          >
            Reset
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={analysisMutation.isPending || resumes.length === 0}
            aria-busy={analysisMutation.isPending}
            startIcon={
              analysisMutation.isPending ? (
                <CircularProgress color="inherit" size={18} />
              ) : (
                <TroubleshootRoundedIcon />
              )
            }
          >
            {analysisMutation.isPending ? 'Starting analysis...' : 'Analyze'}
          </Button>
        </Stack>
      </Stack>
    </Box>
  )
}
