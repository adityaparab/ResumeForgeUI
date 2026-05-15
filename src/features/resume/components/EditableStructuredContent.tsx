import RestartAltRoundedIcon from '@mui/icons-material/RestartAltRounded'
import SaveRoundedIcon from '@mui/icons-material/SaveRounded'
import { Box, Button, Paper, Stack, TextField, Typography } from '@mui/material'
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
    <TextField
      fullWidth
      id={id}
      label={label}
      minRows={multiline ? 3 : undefined}
      multiline={multiline}
      onChange={(event) => onChange(event.target.value)}
      size="small"
      value={value}
    />
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
      <Stack spacing={2}>
        {records.map((item, index) => (
          <Box
            // biome-ignore lint/suspicious/noArrayIndexKey: structured resume arrays do not include stable IDs
            key={index}
            sx={{ border: 1, borderColor: 'divider', borderRadius: 1.5, p: { xs: 2, sm: 2.5 } }}
          >
            <Typography color="text.secondary" sx={{ mb: 2 }} variant="caption">
              {formatLabel(label)} {index + 1}
            </Typography>
            <Box
              sx={{ display: 'grid', gap: 2, gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' } }}
            >
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
            </Box>
          </Box>
        ))}
      </Stack>
    )
  }

  return (
    <Box sx={{ display: 'grid', gap: 2, gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' } }}>
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
    </Box>
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
    <Stack spacing={3}>
      <Paper
        elevation={0}
        sx={{
          border: 1,
          borderColor: 'divider',
          borderRadius: 2,
          p: { xs: 2, sm: 2.5 },
          position: { md: 'sticky' },
          top: { md: 80 },
          zIndex: 1,
        }}
      >
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          spacing={1.5}
          sx={{ alignItems: { xs: 'stretch', sm: 'center' }, justifyContent: 'space-between' }}
        >
          <Typography color={isDirty ? 'warning.main' : 'text.secondary'} variant="body2">
            {isDirty ? 'Unsaved changes' : 'No pending changes'}
          </Typography>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.25}>
            <Button
              disabled={!isDirty || isSubmitting}
              onClick={onReset}
              startIcon={<RestartAltRoundedIcon />}
              type="button"
              variant="outlined"
            >
              Reset
            </Button>
            <Button
              aria-busy={isSubmitting}
              disabled={!isDirty || isSubmitting}
              onClick={onSubmit}
              startIcon={<SaveRoundedIcon />}
              type="button"
              variant="contained"
            >
              {isSubmitting ? 'Saving changes...' : 'Save changes'}
            </Button>
          </Stack>
        </Stack>
      </Paper>

      {sections.length > 0 ? (
        sections.map(([sectionKey, sectionValue]) => (
          <Paper
            component="section"
            elevation={0}
            key={sectionKey}
            sx={{ border: 1, borderColor: 'divider', borderRadius: 2, p: { xs: 2, sm: 3 } }}
          >
            <Typography component="h2" sx={{ mb: 2.5 }} variant="h6">
              {formatSectionTitle(sectionKey)}
            </Typography>
            <EditableValue
              content={content}
              label={sectionKey}
              onChange={onChange}
              path={[sectionKey]}
              value={sectionValue}
            />
          </Paper>
        ))
      ) : (
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
          <Typography color="text.secondary">No structured fields available.</Typography>
        </Paper>
      )}
    </Stack>
  )
}
