import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded'
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded'
import ErrorRoundedIcon from '@mui/icons-material/ErrorRounded'
import SellRoundedIcon from '@mui/icons-material/SellRounded'
import TipsAndUpdatesRoundedIcon from '@mui/icons-material/TipsAndUpdatesRounded'
import TrendingUpRoundedIcon from '@mui/icons-material/TrendingUpRounded'
import {
  Alert,
  Box,
  Button,
  Card,
  Chip,
  LinearProgress,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Paper,
  Stack,
  Typography,
} from '@mui/material'
import type { ChipProps } from '@mui/material/Chip'
import type { LinearProgressProps } from '@mui/material/LinearProgress'
import { useQuery } from '@tanstack/react-query'
import type { ReactNode } from 'react'
import { useNavigate, useParams } from 'react-router'
import LoadingSpinner from '@/components/common/LoadingSpinner'
import { analysisApi } from '@/lib/api-client'

interface NormalizedAnalysisReport {
  score: number
  summary: string
  strengths: string[]
  gaps: string[]
  recommendations: string[]
  matchedKeywords: string[]
  missingKeywords: string[]
}

const STATUS_CHIP: Record<string, ChipProps['color']> = {
  completed: 'success',
  failed: 'error',
  processing: 'info',
  queued: 'warning',
  pending: 'warning',
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

const getAnalysisReport = (input: unknown): NormalizedAnalysisReport | null => {
  if (!input || typeof input !== 'object' || Array.isArray(input)) return null
  const record = input as Record<string, unknown>
  const source = isRecord(record.analysisReport) ? record.analysisReport : record
  return extractReport(source)
}

function extractReport(source: unknown): NormalizedAnalysisReport | null {
  const src = source as Record<string, unknown>
  const suggestions = isRecord(src.detailedImprovementSuggestions)
    ? (src.detailedImprovementSuggestions as Record<string, unknown>)
    : {}
  const skillsGaps = isRecord(src.skillsGaps) ? (src.skillsGaps as Record<string, unknown>) : {}
  const criticalGaps = Array.isArray(skillsGaps.criticalGaps)
    ? (skillsGaps.criticalGaps as Array<Record<string, unknown>>)
    : []

  return {
    score: getScore(src.overallScore ?? src.score),
    summary: getSummary(suggestions.summary ?? src.summary),
    strengths: getStringList(src.strongMatchingPoints ?? src.strengths),
    gaps: getStringList(
      criticalGaps.length > 0
        ? criticalGaps.map((gap) => String(gap.skill ?? ''))
        : (src.gaps ?? []),
    ),
    recommendations: getStringList(suggestions.skills ?? src.recommendations),
    matchedKeywords: getStringList(src.strongMatchingPoints ?? src.matchedKeywords),
    missingKeywords: getStringList(
      criticalGaps.length > 0
        ? criticalGaps.map((gap) => String(gap.skill ?? ''))
        : (src.missingKeywords ?? []),
    ),
  }
}

function getScoreColor(score: number): LinearProgressProps['color'] {
  if (score >= 80) return 'success'
  if (score >= 60) return 'warning'
  return 'error'
}

function ScoreSummary({ score }: { score: number }) {
  const scoreColor = getScoreColor(score)
  return (
    <Box sx={{ minWidth: { xs: '100%', sm: 180 } }}>
      <Stack direction="row" spacing={0.75} sx={{ alignItems: 'baseline' }}>
        <Typography color={`${scoreColor}.main`} component="span" variant="h2">
          {score}
        </Typography>
        <Typography color="text.secondary" component="span" variant="subtitle1">
          / 100
        </Typography>
      </Stack>
      <LinearProgress
        aria-label={`Match score ${score} out of 100`}
        color={scoreColor}
        sx={{ mt: 1.5, borderRadius: 999, height: 8 }}
        value={score}
        variant="determinate"
      />
    </Box>
  )
}

function TagList({ items, color }: { items: string[]; color: ChipProps['color'] }) {
  if (items.length === 0) {
    return <Typography color="text.secondary">None</Typography>
  }

  return (
    <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', gap: 1 }}>
      {items.map((item) => (
        <Chip color={color} key={item} label={item} size="small" variant="outlined" />
      ))}
    </Stack>
  )
}

function InsightList({ items, icon }: { items: string[]; icon: ReactNode }) {
  if (items.length === 0) {
    return <Typography color="text.secondary">No items available.</Typography>
  }

  return (
    <List disablePadding>
      {items.map((item) => (
        <ListItem disableGutters key={item} sx={{ alignItems: 'flex-start', py: 0.75 }}>
          <ListItemIcon sx={{ minWidth: 32, pt: 0.25 }}>{icon}</ListItemIcon>
          <ListItemText
            primary={item}
            slotProps={{ primary: { color: 'text.secondary', variant: 'body2' } }}
          />
        </ListItem>
      ))}
    </List>
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
    queryFn: () => {
      if (!analysisId) throw new Error('Missing analysis ID')
      return analysisApi.getById(analysisId)
    },
    enabled: !!analysisId,
  })

  if (!analysisId) {
    return (
      <Paper elevation={0} sx={{ border: 1, borderColor: 'divider', borderRadius: 2, p: 3 }}>
        <Alert severity="error" role="alert">
          Invalid analysis ID.
        </Alert>
      </Paper>
    )
  }

  if (isLoading) {
    return (
      <Paper
        elevation={0}
        sx={{
          border: 1,
          borderColor: 'divider',
          borderRadius: 2,
          display: 'grid',
          minHeight: 256,
          placeItems: 'center',
        }}
      >
        <LoadingSpinner label="Loading analysis result" />
      </Paper>
    )
  }

  if (isError || !analysis) {
    return (
      <Paper elevation={0} sx={{ border: 1, borderColor: 'divider', borderRadius: 2, p: 3 }}>
        <Alert severity="error" role="alert">
          Failed to load analysis result.
        </Alert>
      </Paper>
    )
  }

  const report = getAnalysisReport(analysis.result)

  return (
    <Stack spacing={3}>
      <Box>
        <Button
          type="button"
          onClick={() => navigate('/analysis')}
          startIcon={<ArrowBackRoundedIcon />}
          variant="text"
        >
          Back to Analyses
        </Button>
      </Box>

      <Paper
        elevation={0}
        sx={{ border: 1, borderColor: 'divider', borderRadius: 2, p: { xs: 2, sm: 3 } }}
      >
        <Stack
          direction={{ xs: 'column', md: 'row' }}
          spacing={2}
          sx={{ alignItems: { xs: 'flex-start', md: 'center' }, justifyContent: 'space-between' }}
        >
          <Box>
            <Typography component="h1" variant="h4">
              Analysis Result
            </Typography>
            <Typography
              color="text.secondary"
              sx={{ fontFamily: 'monospace', mt: 0.75 }}
              variant="body2"
            >
              {analysisId}
            </Typography>
          </Box>
          <Chip
            color={STATUS_CHIP[analysis.status] ?? 'default'}
            label={analysis.status}
            size="small"
          />
        </Stack>
      </Paper>

      {!report && analysis.status !== 'failed' && (
        <Paper
          elevation={0}
          sx={{
            border: 1,
            borderColor: 'divider',
            borderRadius: 2,
            px: 2,
            py: 6,
            textAlign: 'center',
          }}
        >
          <Typography color="text.secondary">
            {analysis.status === 'completed'
              ? 'Completed analysis has no result data available.'
              : 'Analysis is still processing. Check back soon.'}
          </Typography>
        </Paper>
      )}

      {analysis.status === 'failed' && (
        <Alert severity="error" role="alert">
          {analysis.error ?? 'Analysis failed before a result was generated.'}
        </Alert>
      )}

      {report && (
        <Stack spacing={3}>
          <Card
            elevation={0}
            sx={{ border: 1, borderColor: 'divider', borderRadius: 2, p: { xs: 2, sm: 3 } }}
          >
            <Stack
              direction={{ xs: 'column', md: 'row' }}
              spacing={3}
              sx={{ alignItems: { xs: 'stretch', md: 'center' } }}
            >
              <ScoreSummary score={report.score} />
              <Box sx={{ flex: 1 }}>
                <Stack direction="row" spacing={1} sx={{ alignItems: 'center', mb: 1 }}>
                  <TrendingUpRoundedIcon color="primary" />
                  <Typography component="h2" variant="h6">
                    Match Score
                  </Typography>
                </Stack>
                <Typography color="text.secondary">{report.summary}</Typography>
              </Box>
            </Stack>
          </Card>

          <Box sx={{ display: 'grid', gap: 3, gridTemplateColumns: { xs: '1fr', lg: '1fr 1fr' } }}>
            <Card
              elevation={0}
              sx={{ border: 1, borderColor: 'divider', borderRadius: 2, p: { xs: 2, sm: 3 } }}
            >
              <Stack direction="row" spacing={1} sx={{ alignItems: 'center', mb: 1.5 }}>
                <CheckCircleRoundedIcon color="success" />
                <Typography component="h2" variant="h6">
                  Strengths
                </Typography>
              </Stack>
              <InsightList
                items={report.strengths}
                icon={<CheckCircleRoundedIcon color="success" fontSize="small" />}
              />
            </Card>

            <Card
              elevation={0}
              sx={{ border: 1, borderColor: 'divider', borderRadius: 2, p: { xs: 2, sm: 3 } }}
            >
              <Stack direction="row" spacing={1} sx={{ alignItems: 'center', mb: 1.5 }}>
                <ErrorRoundedIcon color="error" />
                <Typography component="h2" variant="h6">
                  Gaps
                </Typography>
              </Stack>
              <InsightList
                items={report.gaps}
                icon={<ErrorRoundedIcon color="error" fontSize="small" />}
              />
            </Card>
          </Box>

          <Card
            elevation={0}
            sx={{ border: 1, borderColor: 'divider', borderRadius: 2, p: { xs: 2, sm: 3 } }}
          >
            <Stack direction="row" spacing={1} sx={{ alignItems: 'center', mb: 1.5 }}>
              <TipsAndUpdatesRoundedIcon color="warning" />
              <Typography component="h2" variant="h6">
                Recommendations
              </Typography>
            </Stack>
            <InsightList
              items={report.recommendations}
              icon={<TipsAndUpdatesRoundedIcon color="warning" fontSize="small" />}
            />
          </Card>

          <Box sx={{ display: 'grid', gap: 3, gridTemplateColumns: { xs: '1fr', lg: '1fr 1fr' } }}>
            <Card
              elevation={0}
              sx={{ border: 1, borderColor: 'divider', borderRadius: 2, p: { xs: 2, sm: 3 } }}
            >
              <Stack direction="row" spacing={1} sx={{ alignItems: 'center', mb: 1.5 }}>
                <SellRoundedIcon color="success" />
                <Typography component="h2" variant="h6">
                  Matched Keywords
                </Typography>
              </Stack>
              <TagList color="success" items={report.matchedKeywords} />
            </Card>
            <Card
              elevation={0}
              sx={{ border: 1, borderColor: 'divider', borderRadius: 2, p: { xs: 2, sm: 3 } }}
            >
              <Stack direction="row" spacing={1} sx={{ alignItems: 'center', mb: 1.5 }}>
                <SellRoundedIcon color="error" />
                <Typography component="h2" variant="h6">
                  Missing Keywords
                </Typography>
              </Stack>
              <TagList color="error" items={report.missingKeywords} />
            </Card>
          </Box>
        </Stack>
      )}
    </Stack>
  )
}
