import {
  Badge,
  Box,
  Button,
  Card,
  Grid,
  Heading,
  HStack,
  Icon,
  Text,
  VStack,
} from '@chakra-ui/react'
import { useQuery } from '@tanstack/react-query'
import { BarChart3, CheckCircle2, ChevronLeft, Download, XCircle, Zap } from 'lucide-react'
import { useNavigate, useParams } from 'react-router'
import { toast } from 'sonner'
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

function ScoreBadge({ score }: { score: number }) {
  const color = score >= 80 ? 'green.600' : score >= 60 ? 'yellow.600' : 'red.600'
  return (
    <Box display="flex" flexDirection="column" alignItems="center" color={color}>
      <Text fontSize="5xl" fontWeight="bold">
        {score}
      </Text>
      <Text fontSize="sm" fontWeight="medium">
        / 100
      </Text>
    </Box>
  )
}

function TagList({ items, colorPalette }: { items: string[]; colorPalette: string }) {
  if (items.length === 0) {
    return (
      <Text fontSize="sm" color="fg.muted">
        None
      </Text>
    )
  }
  return (
    <Box display="flex" flexWrap="wrap" gap={2}>
      {items.map((item) => (
        <Badge key={item} colorPalette={colorPalette} variant="subtle">
          {item}
        </Badge>
      ))}
    </Box>
  )
}

function InsightList({ items, color }: { items: string[]; color: string }) {
  if (items.length === 0) {
    return (
      <Text fontSize="sm" color="fg.muted">
        No items available.
      </Text>
    )
  }
  return (
    <Box as="ul" display="flex" flexDirection="column" gap={2} fontSize="sm" color="fg.muted">
      {items.map((item) => (
        <Box as="li" key={item} display="flex" alignItems="flex-start" gap={2}>
          <Box mt={1.5} w={1.5} h={1.5} flexShrink={0} borderRadius="full" bg={color} />
          {item}
        </Box>
      ))}
    </Box>
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
      <Box role="alert" color="red.500">
        Invalid analysis ID.
      </Box>
    )
  }

  if (isLoading) {
    return (
      <Box display="flex" h="64" alignItems="center" justifyContent="center">
        <LoadingSpinner />
      </Box>
    )
  }

  if (isError || !analysis) {
    return (
      <Box
        role="alert"
        borderRadius="lg"
        borderWidth="1px"
        borderColor="red.200"
        bg="red.subtle"
        px={4}
        py={3}
        fontSize="sm"
        color="red.600"
      >
        Failed to load analysis result.
      </Box>
    )
  }

  const report = getAnalysisReport(analysis.result)
  const statusColor =
    analysis.status === 'completed' ? 'green' : analysis.status === 'failed' ? 'red' : 'yellow'

  const handleDownload = async () => {
    try {
      const blob = await analysisApi.download(analysisId as string)
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      /* v8 ignore next */
      a.download = `analysis-${analysisId}.pdf`
      a.click()
      URL.revokeObjectURL(url)
    } catch {
      toast.error('Could not download updated resume.')
    }
  }

  return (
    <VStack gap={6} align="stretch">
      <Box>
        <Button type="button" variant="ghost" size="sm" onClick={() => navigate('/analysis')}>
          <Icon as={ChevronLeft} />
          Back to Analyses
        </Button>
      </Box>

      <HStack justify="space-between" align="flex-start" gap={4} wrap="wrap">
        <Box>
          <Heading size="2xl" fontWeight="bold">
            Analysis Result
          </Heading>
          <Text mt={1} fontSize="sm" color="fg.muted" fontFamily="mono">
            {analysisId}
          </Text>
        </Box>
        <Badge colorPalette={statusColor} variant="subtle">
          {analysis.status}
        </Badge>
        {analysis.status === 'completed' && !!report && (
          <Button variant="outline" size="sm" onClick={handleDownload}>
            <Icon as={Download} />
            Download Updated Resume
          </Button>
        )}
      </HStack>

      {!report && analysis.status !== 'failed' && (
        <Card.Root variant="outline" borderRadius="xl">
          <Card.Body px={4} py={6} textAlign="center">
            <Text color="fg.muted">
              {analysis.status === 'completed'
                ? 'Completed analysis has no result data available.'
                : 'Analysis is still processing. Check back soon.'}
            </Text>
          </Card.Body>
        </Card.Root>
      )}

      {analysis.status === 'failed' && analysis.error && (
        <Box
          role="alert"
          borderRadius="lg"
          borderWidth="1px"
          borderColor="red.200"
          bg="red.subtle"
          px={4}
          py={3}
          fontSize="sm"
          color="red.600"
        >
          {analysis.error}
        </Box>
      )}

      {report && (
        <VStack gap={6} align="stretch">
          {/* Score card */}
          <Card.Root variant="outline" borderRadius="xl">
            <Card.Body p={6}>
              <HStack gap={8}>
                <ScoreBadge score={report.score} />
                <Box flex={1}>
                  <Heading size="lg" mb={2}>
                    Match Score
                  </Heading>
                  <Text fontSize="sm" color="fg.muted">
                    {report.summary}
                  </Text>
                </Box>
                <Icon as={BarChart3} boxSize={10} color="fg.muted" flexShrink={0} />
              </HStack>
            </Card.Body>
          </Card.Root>

          <Grid gap={6} templateColumns={{ lg: 'repeat(2, 1fr)' }}>
            {/* Strengths */}
            <Card.Root variant="outline" borderRadius="xl">
              <Card.Body p={6}>
                <HStack mb={4} gap={2}>
                  <Icon as={CheckCircle2} color="green.500" />
                  <Heading size="md">Strengths</Heading>
                </HStack>
                <InsightList items={report.strengths} color="green.500" />
              </Card.Body>
            </Card.Root>

            {/* Gaps */}
            <Card.Root variant="outline" borderRadius="xl">
              <Card.Body p={6}>
                <HStack mb={4} gap={2}>
                  <Icon as={XCircle} color="red.500" />
                  <Heading size="md">Gaps</Heading>
                </HStack>
                <InsightList items={report.gaps} color="red.500" />
              </Card.Body>
            </Card.Root>
          </Grid>

          {/* Recommendations */}
          <Card.Root variant="outline" borderRadius="xl">
            <Card.Body p={6}>
              <HStack mb={4} gap={2}>
                <Icon as={Zap} color="yellow.500" />
                <Heading size="md">Recommendations</Heading>
              </HStack>
              <InsightList items={report.recommendations} color="yellow.500" />
            </Card.Body>
          </Card.Root>

          {/* Keywords */}
          <Grid gap={6} templateColumns={{ lg: 'repeat(2, 1fr)' }}>
            <Card.Root variant="outline" borderRadius="xl">
              <Card.Body p={6}>
                <Heading size="md" mb={4}>
                  Matched Keywords
                </Heading>
                <TagList items={report.matchedKeywords} colorPalette="green" />
              </Card.Body>
            </Card.Root>
            <Card.Root variant="outline" borderRadius="xl">
              <Card.Body p={6}>
                <Heading size="md" mb={4}>
                  Missing Keywords
                </Heading>
                <TagList items={report.missingKeywords} colorPalette="red" />
              </Card.Body>
            </Card.Root>
          </Grid>
        </VStack>
      )}
    </VStack>
  )
}
