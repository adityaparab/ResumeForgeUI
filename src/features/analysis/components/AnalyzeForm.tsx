import { Box, Button, Field, HStack, NativeSelect, Spinner, Text, Textarea } from '@chakra-ui/react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { Link } from 'react-router'
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

  return (
    <Box as="form" onSubmit={handleSubmit(onSubmit)} noValidate aria-label="Analyze resume">
      <Box display="flex" flexDirection="column" gap={5}>
        {/* Resume select */}
        <Field.Root invalid={!!errors.resumeId}>
          <Field.Label>Resume</Field.Label>
          <NativeSelect.Root>
            <NativeSelect.Field
              disabled={resumesLoading}
              aria-invalid={!!errors.resumeId}
              aria-describedby={errors.resumeId ? 'resumeId-error' : undefined}
              {...register('resumeId')}
            >
              <option value="">{resumesLoading ? 'Loading resumes…' : 'Select a resume'}</option>
              {resumes.map((r) => (
                <option key={r.value} value={r.value}>
                  {r.label}
                </option>
              ))}
            </NativeSelect.Field>
            <NativeSelect.Indicator />
          </NativeSelect.Root>
          {errors.resumeId && (
            <Field.ErrorText id="resumeId-error">{errors.resumeId.message}</Field.ErrorText>
          )}
          {!resumesLoading && resumes.length === 0 && (
            <Text fontSize="xs" color="fg.muted">
              No completed resumes found.{' '}
              <Box as={Link} to="/resume" textDecoration="underline">
                Upload one first.
              </Box>
            </Text>
          )}
        </Field.Root>

        {/* Job description */}
        <Field.Root invalid={!!errors.jobDescription}>
          <Field.Label>Job Description</Field.Label>
          <Textarea
            id="jobDescription"
            rows={8}
            placeholder="Paste the full job description here (min 20 characters)…"
            aria-invalid={!!errors.jobDescription}
            aria-describedby={errors.jobDescription ? 'jobDescription-error' : undefined}
            {...register('jobDescription')}
          />
          {errors.jobDescription && (
            <Field.ErrorText id="jobDescription-error">
              {errors.jobDescription.message}
            </Field.ErrorText>
          )}
        </Field.Root>

        {/* Actions */}
        <HStack justify="flex-end" gap={3}>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => reset()}
            disabled={analysisMutation.isPending}
          >
            Reset
          </Button>
          <Button
            type="submit"
            colorPalette="purple"
            disabled={analysisMutation.isPending || resumes.length === 0}
            aria-busy={analysisMutation.isPending}
          >
            {analysisMutation.isPending ? (
              <>
                <Spinner size="sm" /> Starting analysis…
              </>
            ) : (
              'Analyze'
            )}
          </Button>
        </HStack>
      </Box>
    </Box>
  )
}
