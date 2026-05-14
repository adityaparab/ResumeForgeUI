import { useQuery } from '@tanstack/react-query'
import { BarChart3, CheckCircle2, ChevronLeft, XCircle, Zap } from 'lucide-react'
import { useNavigate, useParams } from 'react-router'
import LoadingSpinner from '@/components/common/LoadingSpinner'
import { analysisApi } from '@/lib/api-client'
import { cn } from '@/lib/utils'

function ScoreBadge({ score }: { score: number }) {
  const color =
    score >= 80 ? 'text-green-600' : score >= 60 ? 'text-yellow-600' : 'text-destructive'
  return (
    <div className={cn('flex flex-col items-center', color)}>
      <span className="text-5xl font-bold">{score}</span>
      <span className="text-sm font-medium">/ 100</span>
    </div>
  )
}

function TagList({ items, color }: { items: string[]; color: string }) {
  return (
    <div className="flex flex-wrap gap-2">
      {items.map((item) => (
        <span key={item} className={cn('rounded-full px-3 py-1 text-xs font-medium', color)}>
          {item}
        </span>
      ))}
    </div>
  )
}

export default function AnalysisResult() {
  const { analysisId } = useParams<{ analysisId: string }>()
  const navigate = useNavigate()

  const {
    data: analysis,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ['analysis', analysisId],
    queryFn: () => analysisApi.getById(analysisId!),
    enabled: !!analysisId,
  })

  if (!analysisId) {
    return (
      <div role="alert" className="text-destructive">
        Invalid analysis ID.
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <LoadingSpinner />
      </div>
    )
  }

  if (isError || !analysis) {
    return (
      <div
        role="alert"
        className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive"
      >
        Failed to load analysis result.
      </div>
    )
  }

  const report = analysis.result?.analysisReport

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => navigate('/analysis')}
          className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
        >
          <ChevronLeft className="size-4" />
          Back to Analyses
        </button>
      </div>

      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Analysis Result</h1>
          <p className="mt-1 text-sm text-muted-foreground font-mono">{analysisId}</p>
        </div>
        <span
          className={cn(
            'inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium',
            analysis.status === 'completed'
              ? 'bg-green-100 text-green-800'
              : analysis.status === 'failed'
                ? 'bg-red-100 text-red-800'
                : 'bg-yellow-100 text-yellow-800',
          )}
        >
          {analysis.status}
        </span>
      </div>

      {!report && analysis.status !== 'failed' && (
        <div className="rounded-lg border border-border bg-card px-4 py-6 text-center text-muted-foreground">
          Analysis is still processing. Check back soon.
        </div>
      )}

      {analysis.status === 'failed' && analysis.error && (
        <div
          role="alert"
          className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive"
        >
          {analysis.error}
        </div>
      )}

      {report && (
        <div className="space-y-6">
          {/* Score card */}
          <div className="flex items-center gap-8 rounded-xl border border-border bg-card p-6 shadow-sm">
            <ScoreBadge score={report.score} />
            <div className="flex-1">
              <h2 className="mb-2 text-lg font-semibold text-foreground">Match Score</h2>
              <p className="text-sm text-muted-foreground">{report.summary}</p>
            </div>
            <BarChart3 className="size-10 shrink-0 text-muted-foreground/30" />
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            {/* Strengths */}
            <section className="rounded-xl border border-border bg-card p-6 shadow-sm">
              <h2 className="mb-4 flex items-center gap-2 text-base font-semibold text-foreground">
                <CheckCircle2 className="size-5 text-green-500" />
                Strengths
              </h2>
              <ul className="space-y-2 text-sm text-muted-foreground">
                {report.strengths.map((s) => (
                  <li key={s} className="flex items-start gap-2">
                    <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-green-500" />
                    {s}
                  </li>
                ))}
              </ul>
            </section>

            {/* Gaps */}
            <section className="rounded-xl border border-border bg-card p-6 shadow-sm">
              <h2 className="mb-4 flex items-center gap-2 text-base font-semibold text-foreground">
                <XCircle className="size-5 text-destructive" />
                Gaps
              </h2>
              <ul className="space-y-2 text-sm text-muted-foreground">
                {report.gaps.map((g) => (
                  <li key={g} className="flex items-start gap-2">
                    <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-destructive" />
                    {g}
                  </li>
                ))}
              </ul>
            </section>
          </div>

          {/* Recommendations */}
          <section className="rounded-xl border border-border bg-card p-6 shadow-sm">
            <h2 className="mb-4 flex items-center gap-2 text-base font-semibold text-foreground">
              <Zap className="size-5 text-yellow-500" />
              Recommendations
            </h2>
            <ul className="space-y-2 text-sm text-muted-foreground">
              {report.recommendations.map((r) => (
                <li key={r} className="flex items-start gap-2">
                  <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-yellow-500" />
                  {r}
                </li>
              ))}
            </ul>
          </section>

          {/* Keywords */}
          <div className="grid gap-6 lg:grid-cols-2">
            <section className="rounded-xl border border-border bg-card p-6 shadow-sm">
              <h2 className="mb-4 text-base font-semibold text-foreground">Matched Keywords</h2>
              <TagList items={report.matchedKeywords} color="bg-green-100 text-green-800" />
            </section>
            <section className="rounded-xl border border-border bg-card p-6 shadow-sm">
              <h2 className="mb-4 text-base font-semibold text-foreground">Missing Keywords</h2>
              <TagList items={report.missingKeywords} color="bg-red-100 text-red-800" />
            </section>
          </div>
        </div>
      )}
    </div>
  )
}
