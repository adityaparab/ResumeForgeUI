import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { type CreateAnalysisDto, CreateAnalysisDtoSchema } from '@/lib/schemas/analysis.schema'
import { cn } from '@/lib/utils'
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
    <form onSubmit={handleSubmit(onSubmit)} noValidate aria-label="Analyze resume">
      <div className="space-y-5">
        {/* Resume select */}
        <div className="space-y-1.5">
          <Label htmlFor="resumeId">Resume</Label>
          <select
            id="resumeId"
            className={cn(
              'flex h-9 w-full rounded-lg border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors',
              'focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring',
              'disabled:cursor-not-allowed disabled:opacity-50',
              errors.resumeId && 'border-destructive',
            )}
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
          </select>
          {errors.resumeId && (
            <p id="resumeId-error" className="text-xs text-destructive" role="alert">
              {errors.resumeId.message}
            </p>
          )}
          {!resumesLoading && resumes.length === 0 && (
            <p className="text-xs text-muted-foreground">
              No completed resumes found.{' '}
              <a href="/resume" className="underline hover:text-foreground">
                Upload one first.
              </a>
            </p>
          )}
        </div>

        {/* Job description */}
        <div className="space-y-1.5">
          <Label htmlFor="jobDescription">Job Description</Label>
          <textarea
            id="jobDescription"
            rows={8}
            placeholder="Paste the full job description here (min 20 characters)…"
            className={cn(
              'flex w-full rounded-lg border border-input bg-transparent px-3 py-2 text-sm shadow-sm',
              'transition-colors placeholder:text-muted-foreground',
              'focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring',
              'disabled:cursor-not-allowed disabled:opacity-50 resize-y',
              errors.jobDescription && 'border-destructive',
            )}
            aria-invalid={!!errors.jobDescription}
            aria-describedby={errors.jobDescription ? 'jobDescription-error' : undefined}
            {...register('jobDescription')}
          />
          {errors.jobDescription && (
            <p id="jobDescription-error" className="text-xs text-destructive" role="alert">
              {errors.jobDescription.message}
            </p>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3">
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
            disabled={analysisMutation.isPending || resumes.length === 0}
            aria-busy={analysisMutation.isPending}
          >
            {analysisMutation.isPending ? 'Starting analysis…' : 'Analyze'}
          </Button>
        </div>
      </div>
    </form>
  )
}
