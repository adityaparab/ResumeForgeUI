import { useQuery } from '@tanstack/react-query'
import { BarChart3, CheckCircle2, ChevronLeft, XCircle, Zap } from 'lucide-react'
import { useNavigate, useParams } from 'react-router'
import LoadingSpinner from '@/components/common/LoadingSpinner'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { analysisApi } from '@/lib/api-client'
import { cn } from '@/lib/utils'

interface NormalizedAnalysisReport {
  score: number
  summary: string
  strengths: string[]
  gaps: string[]
  recommendations: string[]
  matchedKeywords: string[]
  missingKeywords: string[]
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function getStringList(value: unknown): string[] {
  if (!Array.isArray(value)) return []
  return value.filter((item): item is string => typeof item === 'string')
}

function getScore(value: unknown): number {
  const score = typeof value === 'number' ? value : Number(value)
  if (!Number.isFinite(score)) return 0
  return Math.min(100, Math.max(0, score))
}

function getSummary(value: unknown): string {
  return typeof value === 'string' && value.trim() ? value : 'No summary available.'
}

function getAnalysisReport(result: unknown): NormalizedAnalysisReport | null {
  if (!isRecord(result)) return null
  const source = isRecord(result.analysisReport) ? result.analysisReport : result
  return {
    score: getScore(source.score),
    summary: getSummary(source.summary),
    strengths: getStringList(source.strengths),
    gaps: getStringList(source.gaps),
    recommendations: getStringList(source.recommendations),
    matchedKeywords: getStringList(source.matchedKeywords),
    missingKeywords: getStringList(source.missingKeywords),
  }
}

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

function TagList({ items, variant }: { items: string[]; variant: 'success' | 'destructive' }) {
  if (items.length === 0) {
    return <p className="text-sm text-muted-foreground">None</p>
  }

  return (
    <div className="flex flex-wrap gap-2">
      {items.map((item) => (
        <Badge key={item} variant={variant}>
          {item}
        </Badge>
      ))}
    </div>
  )
}

function InsightList({ items, color }: { items: string[]; color: string }) {
  if (items.length === 0) {
    return <p className="text-sm text-muted-foreground">No items available.</p>
  }

  return (
    <ul className="space-y-2 text-sm text-muted-foreground">
      {items.map((item) => (
        <li key={item} className="flex items-start gap-2">
          <span className={cn('mt-1.5 size-1.5 shrink-0 rounded-full', color)} />
          {item}
        </li>
      ))}
    </ul>
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
    queryFn: () => analysisApi.getById(analysisId as string),
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

  const report = getAnalysisReport(analysis.result)

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
        <Badge
          variant={
            analysis.status === 'completed'
              ? 'success'
              : analysis.status === 'failed'
                ? 'destructive'
                : 'warning'
          }
        >
          {analysis.status}
        </Badge>
      </div>

      {!report && analysis.status !== 'failed' && (
        <Card className="px-4 py-6 text-center text-muted-foreground">
          {analysis.status === 'completed'
            ? 'Completed analysis has no result data available.'
            : 'Analysis is still processing. Check back soon.'}
        </Card>
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
          <Card className="flex items-center gap-8 p-6">
            <ScoreBadge score={report.score} />
            <div className="flex-1">
              <h2 className="mb-2 text-lg font-semibold text-foreground">Match Score</h2>
              <p className="text-sm text-muted-foreground">{report.summary}</p>
            </div>
            <BarChart3 className="size-10 shrink-0 text-muted-foreground/30" />
          </Card>

          <div className="grid gap-6 lg:grid-cols-2">
            {/* Strengths */}
            <Card className="p-6">
              <h2 className="mb-4 flex items-center gap-2 text-base font-semibold text-foreground">
                <CheckCircle2 className="size-5 text-green-500" />
                Strengths
              </h2>
              <InsightList items={report.strengths} color="bg-green-500" />
            </Card>

            {/* Gaps */}
            <Card className="p-6">
              <h2 className="mb-4 flex items-center gap-2 text-base font-semibold text-foreground">
                <XCircle className="size-5 text-destructive" />
                Gaps
              </h2>
              <InsightList items={report.gaps} color="bg-destructive" />
            </Card>
          </div>

          {/* Recommendations */}
          <Card className="p-6">
            <h2 className="mb-4 flex items-center gap-2 text-base font-semibold text-foreground">
              <Zap className="size-5 text-yellow-500" />
              Recommendations
            </h2>
            <InsightList items={report.recommendations} color="bg-yellow-500" />
          </Card>

          {/* Keywords */}
          <div className="grid gap-6 lg:grid-cols-2">
            <Card className="p-6">
              <h2 className="mb-4 text-base font-semibold text-foreground">Matched Keywords</h2>
              <TagList items={report.matchedKeywords} variant="success" />
            </Card>
            <Card className="p-6">
              <h2 className="mb-4 text-base font-semibold text-foreground">Missing Keywords</h2>
              <TagList items={report.missingKeywords} variant="destructive" />
            </Card>
          </div>
        </div>
      )}
    </div>
  )
}
