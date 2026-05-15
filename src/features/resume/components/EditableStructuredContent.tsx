import {
  Box,
  Button,
  Card,
  Grid,
  HStack,
  Icon,
  Input,
  Text,
  Textarea,
  VStack,
} from '@chakra-ui/react'
import { RotateCcw, Save } from 'lucide-react'
import { useId } from 'react'
import type { StructuredContent } from '@/lib/schemas/resume.schema'

type PathSegment = string | number

interface EditableStructuredContentProps {
  content: StructuredContent
  isDirty: boolean
  isSubmitting: boolean
  onChange: (content: StructuredContent) => void
  onReset: () => void
  onSubmit: () => void
}

const MULTILINE_FIELDS = new Set([
  'summary',
  'description',
  'highlights',
  'courses',
  'keywords',
  'reference',
])

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function isEditableScalar(value: unknown): value is string | number | null | undefined {
  return (
    value === undefined || value === null || typeof value === 'string' || typeof value === 'number'
  )
}

function toDisplayValue(value: string | number | null | undefined): string {
  return value === undefined || value === null ? '' : String(value)
}

function hasRenderableValue(value: unknown): boolean {
  if (isEditableScalar(value)) return value !== undefined && value !== null
  if (Array.isArray(value)) return value.some(hasRenderableValue)
  return Object.values(value as Record<string, unknown>).some(hasRenderableValue)
}

function parseLines(value: string): string[] {
  return value
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
}

function formatLabel(value: string): string {
  return value
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, (letter) => letter.toUpperCase())
    .trim()
}

function formatSectionTitle(key: string): string {
  if (key === 'work') return 'Work Experience'
  return formatLabel(key)
}

function shouldUseTextarea(path: PathSegment[]): boolean {
  const last = path.at(-1)
  return typeof last === 'string' && MULTILINE_FIELDS.has(last)
}

function setValueAtPath(
  content: StructuredContent,
  path: PathSegment[],
  value: unknown,
): StructuredContent {
  const next = structuredClone(content) as Record<string, unknown>
  let target: unknown = next

  for (const segment of path.slice(0, -1)) {
    target =
      typeof segment === 'number'
        ? (target as unknown[])[segment]
        : (target as Record<string, unknown>)[segment]
  }

  const last = path.at(-1) as string
  ;(target as Record<string, unknown>)[last] = value

  return next as StructuredContent
}

function EditableField({
  label,
  value,
  multiline,
  onChange,
}: {
  label: string
  value: string
  multiline: boolean
  onChange: (value: string) => void
}) {
  const id = useId()

  return (
    <Box display="grid" gap={1.5} fontSize="sm">
      <Text as="label" htmlFor={id} fontWeight="medium" color="fg.muted">
        {label}
      </Text>
      {multiline ? (
        <Textarea id={id} value={value} onChange={(event) => onChange(event.target.value)} />
      ) : (
        <Input id={id} value={value} onChange={(event) => onChange(event.target.value)} />
      )}
    </Box>
  )
}

function EditableValue({
  content,
  label,
  path,
  value,
  onChange,
}: {
  content: StructuredContent
  label: string
  path: PathSegment[]
  value: unknown
  onChange: (content: StructuredContent) => void
}) {
  if (isEditableScalar(value)) {
    return (
      <EditableField
        label={formatLabel(label)}
        value={toDisplayValue(value)}
        multiline={shouldUseTextarea(path)}
        onChange={(nextValue) => onChange(setValueAtPath(content, path, nextValue))}
      />
    )
  }

  if (Array.isArray(value)) {
    if (value.length === 0) return null
    if (value.every(isEditableScalar)) {
      return (
        <EditableField
          label={formatLabel(label)}
          value={value.map(toDisplayValue).join('\n')}
          multiline={true}
          onChange={(nextValue) => onChange(setValueAtPath(content, path, parseLines(nextValue)))}
        />
      )
    }

    const records = value.filter(isRecord)
    return (
      <VStack gap={4} align="stretch">
        {records.map((item, index) => (
          <Box
            // biome-ignore lint/suspicious/noArrayIndexKey: structured resume arrays do not include stable IDs
            key={index}
            borderRadius="lg"
            borderWidth="1px"
            borderColor="border.subtle"
            bg="bg"
            p={4}
          >
            <Grid gap={4} templateColumns={{ md: 'repeat(2, 1fr)' }}>
              {Object.entries(item).map(([childKey, childValue]) => (
                <EditableValue
                  key={childKey}
                  content={content}
                  label={childKey}
                  path={[...path, index, childKey]}
                  value={childValue}
                  onChange={onChange}
                />
              ))}
            </Grid>
          </Box>
        ))}
      </VStack>
    )
  }

  return (
    <Grid gap={4} templateColumns={{ md: 'repeat(2, 1fr)' }}>
      {Object.entries(value as Record<string, unknown>).map(([childKey, childValue]) => (
        <EditableValue
          key={childKey}
          content={content}
          label={childKey}
          path={[...path, childKey]}
          value={childValue}
          onChange={onChange}
        />
      ))}
    </Grid>
  )
}

export function EditableStructuredContent({
  content,
  isDirty,
  isSubmitting,
  onChange,
  onReset,
  onSubmit,
}: EditableStructuredContentProps) {
  const sections = Object.entries(content).filter(([, value]) => hasRenderableValue(value))

  return (
    <VStack gap={6} align="stretch">
      <HStack justify="flex-end" wrap="wrap" gap={2}>
        <Button
          type="button"
          variant="outline"
          onClick={onReset}
          disabled={!isDirty || isSubmitting}
        >
          <Icon as={RotateCcw} />
          Reset
        </Button>
        <Button
          type="button"
          colorPalette="purple"
          onClick={onSubmit}
          disabled={!isDirty || isSubmitting}
        >
          <Icon as={Save} />
          Save changes
        </Button>
      </HStack>

      {sections.length > 0 ? (
        sections.map(([sectionKey, sectionValue]) => (
          <Card.Root key={sectionKey} variant="outline" borderRadius="xl">
            <Card.Body p={6}>
              <Text mb={4} fontSize="base" fontWeight="semibold">
                {formatSectionTitle(sectionKey)}
              </Text>
              <EditableValue
                content={content}
                label={sectionKey}
                path={[sectionKey]}
                value={sectionValue}
                onChange={onChange}
              />
            </Card.Body>
          </Card.Root>
        ))
      ) : (
        <Card.Root variant="outline" borderRadius="xl">
          <Card.Body px={4} py={8} textAlign="center">
            <Text color="fg.muted">No structured fields available.</Text>
          </Card.Body>
        </Card.Root>
      )}
    </VStack>
  )
}
