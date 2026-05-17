import AddRoundedIcon from '@mui/icons-material/AddRounded'
import CheckRoundedIcon from '@mui/icons-material/CheckRounded'
import CloseRoundedIcon from '@mui/icons-material/CloseRounded'
import DeleteRoundedIcon from '@mui/icons-material/DeleteRounded'
import EditRoundedIcon from '@mui/icons-material/EditRounded'
import SaveRoundedIcon from '@mui/icons-material/SaveRounded'
import {
  Alert,
  Box,
  Button,
  Chip,
  IconButton,
  Paper,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material'
import CircularProgress from '@mui/material/CircularProgress'
import { useId, useState } from 'react'
import type { StructuredContent } from '@/lib/schemas/resume.schema'

export type PathSegment = string | number

export interface EditableStructuredContentProps {
  content: StructuredContent
  mode?: 'edit' | 'create'
  onSaveField?: (path: PathSegment[], value: unknown) => Promise<void>
  onSubmit?: (content: StructuredContent) => Promise<void>
  isSubmitting?: boolean
}

// --- Helpers ---

const MULTILINE_FIELDS = new Set([
  'summary',
  'description',
  'highlights',
  'courses',
  'keywords',
  'reference',
])

// String-array keys: these render as textarea even when empty
const STRING_ARRAY_KEYS = new Set(['highlights', 'courses', 'keywords', 'roles'])

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
  if (isEditableScalar(value)) return value !== undefined && value !== null && value !== ''
  if (Array.isArray(value)) return value.length > 0
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

function insertAtPath(
  content: StructuredContent,
  path: PathSegment[],
  item: unknown,
): StructuredContent {
  const next = structuredClone(content) as Record<string, unknown>
  let target: unknown = next
  for (const segment of path) {
    target =
      typeof segment === 'number'
        ? (target as unknown[])[segment]
        : (target as Record<string, unknown>)[segment]
  }
  ;(target as unknown[]).push(item)
  return next as StructuredContent
}

function buildEmptyItem(existingItems: Record<string, unknown>[]): Record<string, unknown> {
  if (existingItems.length === 0) return {}
  const template = existingItems[0]
  if (!template) return {}
  const empty: Record<string, unknown> = {}
  for (const key of Object.keys(template)) {
    const val = template[key]
    if (Array.isArray(val)) empty[key] = []
    else if (isRecord(val)) empty[key] = {}
    else empty[key] = ''
  }
  return empty
}

// --- Inline Editable Field ---

interface InlineEditableFieldProps {
  label: string
  value: string
  multiline: boolean
  onSave: (newValue: string) => Promise<void>
}

function InlineEditableField({ label, value, multiline, onSave }: InlineEditableFieldProps) {
  const id = useId()
  const [isEditing, setIsEditing] = useState(false)
  const [editValue, setEditValue] = useState(value)
  const [isLoading, setIsLoading] = useState(false)
  const [fieldError, setFieldError] = useState<string | null>(null)

  const displayText = value || '—'

  const handleEdit = () => {
    setEditValue(value)
    setFieldError(null)
    setIsEditing(true)
  }

  const handleCancel = () => {
    setEditValue(value)
    setFieldError(null)
    setIsEditing(false)
  }

  const handleSave = async () => {
    setIsLoading(true)
    setFieldError(null)
    try {
      await onSave(editValue)
      setIsEditing(false)
    } catch {
      setFieldError('Failed to save. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  if (isEditing) {
    return (
      <Box>
        <Stack direction="row" spacing={1} sx={{ alignItems: 'flex-start' }}>
          <TextField
            autoFocus
            disabled={isLoading}
            fullWidth
            id={id}
            label={label}
            minRows={multiline ? 3 : undefined}
            multiline={multiline}
            onChange={(e) => setEditValue(e.target.value)}
            size="small"
            value={editValue}
            onKeyDown={(e) => {
              if (e.key === 'Escape') handleCancel()
              if (e.key === 'Enter' && !multiline) {
                e.preventDefault()
                void handleSave()
              }
            }}
          />
          <Stack direction="row" spacing={0.5} sx={{ pt: 0.5, flexShrink: 0 }}>
            {isLoading ? (
              <CircularProgress size={20} sx={{ mt: 0.5 }} />
            ) : (
              <>
                <Tooltip title="Save">
                  <IconButton
                    aria-label="Save field"
                    color="success"
                    onClick={() => void handleSave()}
                    size="small"
                  >
                    <CheckRoundedIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Cancel">
                  <IconButton aria-label="Cancel edit" onClick={handleCancel} size="small">
                    <CloseRoundedIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </>
            )}
          </Stack>
        </Stack>
        {fieldError && (
          <Typography color="error" variant="caption" sx={{ mt: 0.5, display: 'block' }}>
            {fieldError}
          </Typography>
        )}
      </Box>
    )
  }

  return (
    <Box
      onClick={handleEdit}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') handleEdit()
      }}
      sx={{
        borderRadius: 1,
        cursor: 'text',
        display: 'flex',
        alignItems: 'center',
        gap: 1,
        justifyContent: 'space-between',
        p: 1,
        '&:hover': { bgcolor: 'action.hover' },
        '&:hover .edit-icon': { opacity: 1 },
        '&:focus-visible': { outline: '2px solid', outlineColor: 'primary.main', outlineOffset: 2 },
      }}
    >
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.25 }}>
          {label}
        </Typography>
        <Typography
          variant="body2"
          sx={{
            whiteSpace: multiline ? 'pre-wrap' : 'nowrap',
            overflow: 'hidden',
            textOverflow: multiline ? 'clip' : 'ellipsis',
            color: value ? 'text.primary' : 'text.disabled',
          }}
        >
          {displayText}
        </Typography>
      </Box>
      <EditRoundedIcon
        className="edit-icon"
        fontSize="small"
        sx={{ color: 'text.disabled', flexShrink: 0, opacity: 0, transition: 'opacity 0.15s' }}
      />
    </Box>
  )
}

// --- Create-mode field ---

interface CreateModeFieldProps {
  label: string
  value: string
  multiline: boolean
  onChange: (newValue: string) => void
}

function CreateModeField({ label, value, multiline, onChange }: CreateModeFieldProps) {
  const id = useId()
  return (
    <TextField
      fullWidth
      id={id}
      label={label}
      minRows={multiline ? 3 : undefined}
      multiline={multiline}
      onChange={(e) => onChange(e.target.value)}
      size="small"
      value={value}
    />
  )
}

// --- Recursive renderer ---

interface EditableValueProps {
  content: StructuredContent
  label: string
  path: PathSegment[]
  value: unknown
  mode: 'edit' | 'create'
  onSaveField?: (path: PathSegment[], value: unknown) => Promise<void>
  onChange?: (content: StructuredContent) => void
}

function EditableValue({
  content,
  label,
  path,
  value,
  mode,
  onSaveField,
  onChange,
}: EditableValueProps) {
  if (isEditableScalar(value)) {
    const displayVal = toDisplayValue(value)
    const isMultiline = shouldUseTextarea(path)
    if (mode === 'edit') {
      return (
        <InlineEditableField
          label={formatLabel(label)}
          value={displayVal}
          multiline={isMultiline}
          onSave={async (newVal) => {
            if (!onSaveField) return
            await onSaveField(path, newVal)
          }}
        />
      )
    }
    return (
      <CreateModeField
        label={formatLabel(label)}
        value={displayVal}
        multiline={isMultiline}
        onChange={(newVal) => onChange?.(setValueAtPath(content, path, newVal))}
      />
    )
  }

  if (Array.isArray(value)) {
    if (value.length === 0 && mode === 'edit') return null

    const lastKey = path.at(-1)
    const isStringArrayKey = typeof lastKey === 'string' && STRING_ARRAY_KEYS.has(lastKey)

    if (value.every(isEditableScalar) || (value.length === 0 && isStringArrayKey)) {
      const joined = value.map(toDisplayValue).join('\n')
      if (mode === 'edit') {
        return (
          <InlineEditableField
            label={formatLabel(label)}
            value={joined}
            multiline={true}
            onSave={async (newVal) => {
              if (!onSaveField) return
              await onSaveField(path, parseLines(newVal))
            }}
          />
        )
      }
      return (
        <CreateModeField
          label={formatLabel(label)}
          value={joined}
          multiline={true}
          onChange={(newVal) => onChange?.(setValueAtPath(content, path, parseLines(newVal)))}
        />
      )
    }

    if (value.length === 0 && mode === 'create') {
      // Non-string-array empty array in create mode: show Add button to add first item
      return (
        <Button
          onClick={() => {
            const empty: Record<string, unknown> = {}
            onChange?.(insertAtPath(content, path, empty))
          }}
          size="small"
          startIcon={<AddRoundedIcon />}
          sx={{ alignSelf: 'flex-start' }}
          type="button"
          variant="outlined"
        >
          Add {formatLabel(label)}
        </Button>
      )
    }

    const records = value.filter(isRecord)
    return (
      <Stack spacing={2}>
        {records.map((item, index) => (
          <Box
            key={index}
            sx={{ border: 1, borderColor: 'divider', borderRadius: 1.5, p: { xs: 1.5, sm: 2 } }}
          >
            <Stack
              direction="row"
              spacing={1}
              sx={{ alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}
            >
              <Typography color="text.secondary" variant="caption">
                {formatLabel(label)} {index + 1}
              </Typography>
              {mode === 'edit' && (
                <Tooltip title={`Remove ${formatLabel(label)} ${index + 1}`}>
                  <IconButton
                    aria-label={`Remove ${formatLabel(label)} ${index + 1}`}
                    color="error"
                    size="small"
                    onClick={async () => {
                      if (!onSaveField) return
                      const newArray = records.filter((_, i) => i !== index)
                      await onSaveField(path, newArray)
                    }}
                  >
                    <DeleteRoundedIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              )}
            </Stack>
            <Box
              sx={{ display: 'grid', gap: 1.5, gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' } }}
            >
              {Object.entries(item).map(([childKey, childValue]) => (
                <EditableValue
                  key={childKey}
                  content={content}
                  label={childKey}
                  path={[...path, index, childKey]}
                  value={childValue}
                  mode={mode}
                  onSaveField={onSaveField}
                  onChange={onChange}
                />
              ))}
            </Box>
          </Box>
        ))}
        <Button
          onClick={async () => {
            const empty = buildEmptyItem(records)
            if (mode === 'edit') {
              if (!onSaveField) return
              const newArray = [...records, empty]
              await onSaveField(path, newArray)
            } else {
              onChange?.(insertAtPath(content, path, empty))
            }
          }}
          size="small"
          startIcon={<AddRoundedIcon />}
          sx={{ alignSelf: 'flex-start' }}
          type="button"
          variant="outlined"
        >
          Add {formatLabel(label)}
        </Button>
      </Stack>
    )
  }

  return (
    <Box sx={{ display: 'grid', gap: 1.5, gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' } }}>
      {Object.entries(value as Record<string, unknown>).map(([childKey, childValue]) => (
        <EditableValue
          key={childKey}
          content={content}
          label={childKey}
          path={[...path, childKey]}
          value={childValue}
          mode={mode}
          onSaveField={onSaveField}
          onChange={onChange}
        />
      ))}
    </Box>
  )
}

// --- Add Section UI ---

interface AddSectionProps {
  onAdd: (key: string, type: 'object' | 'array') => void
}

function AddSectionUI({ onAdd }: AddSectionProps) {
  const [open, setOpen] = useState(false)
  const [sectionName, setSectionName] = useState('')
  const [sectionType, setSectionType] = useState<'object' | 'array'>('array')

  const handleAdd = () => {
    const key = sectionName.trim().replace(/\s+/g, '_').toLowerCase()
    if (!key) return
    onAdd(key, sectionType)
    setSectionName('')
    setOpen(false)
  }

  if (!open) {
    return (
      <Button
        onClick={() => setOpen(true)}
        startIcon={<AddRoundedIcon />}
        type="button"
        variant="text"
        sx={{ alignSelf: 'flex-start' }}
      >
        Add Section
      </Button>
    )
  }

  return (
    <Paper elevation={0} sx={{ border: 1, borderColor: 'divider', borderRadius: 2, p: 2 }}>
      <Stack spacing={1.5}>
        <Typography variant="subtitle2">Add New Section</Typography>
        <TextField
          autoFocus
          label="Section name"
          placeholder="e.g. Hobbies, Patents"
          size="small"
          value={sectionName}
          onChange={(e) => setSectionName(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleAdd()
            if (e.key === 'Escape') setOpen(false)
          }}
        />
        <Stack direction="row" spacing={1}>
          <Chip
            clickable
            color={sectionType === 'array' ? 'primary' : 'default'}
            label="List of items"
            onClick={() => setSectionType('array')}
            size="small"
          />
          <Chip
            clickable
            color={sectionType === 'object' ? 'primary' : 'default'}
            label="Single item"
            onClick={() => setSectionType('object')}
            size="small"
          />
        </Stack>
        <Stack direction="row" spacing={1}>
          <Button onClick={handleAdd} size="small" type="button" variant="contained">
            Add
          </Button>
          <Button onClick={() => setOpen(false)} size="small" type="button" variant="text">
            Cancel
          </Button>
        </Stack>
      </Stack>
    </Paper>
  )
}

// --- Top-level component ---

export function EditableStructuredContent({
  content,
  mode = 'edit',
  onSaveField,
  onSubmit,
  isSubmitting = false,
}: EditableStructuredContentProps) {
  const [localContent, setLocalContent] = useState<StructuredContent>(content)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [lastSynced, setLastSynced] = useState(JSON.stringify(content))

  const contentJson = JSON.stringify(content)
  if (contentJson !== lastSynced) {
    setLastSynced(contentJson)
    setLocalContent(content)
  }

  const workingContent = mode === 'edit' ? content : localContent

  const sections =
    mode === 'edit'
      ? Object.entries(workingContent).filter(([, value]) => hasRenderableValue(value))
      : Object.entries(workingContent)

  const handleAddSection = (key: string, type: 'object' | 'array') => {
    setLocalContent((prev) => ({ ...prev, [key]: type === 'array' ? [] : {} }) as StructuredContent)
  }

  const handleSubmit = async () => {
    if (!onSubmit) return
    setSubmitError(null)
    try {
      await onSubmit(localContent)
    } catch {
      setSubmitError('Failed to create resume. Please try again.')
    }
  }

  return (
    <Stack spacing={3}>
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
              content={workingContent}
              label={sectionKey}
              path={[sectionKey]}
              value={sectionValue}
              mode={mode}
              onSaveField={onSaveField}
              onChange={setLocalContent}
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

      <AddSectionUI onAdd={handleAddSection} />

      {mode === 'create' && (
        <Paper
          elevation={0}
          sx={{
            border: 1,
            borderColor: 'divider',
            borderRadius: 2,
            p: { xs: 2, sm: 2.5 },
            position: { md: 'sticky' },
            bottom: { md: 16 },
            zIndex: 1,
          }}
        >
          {submitError && (
            <Alert severity="error" sx={{ mb: 1.5 }}>
              {submitError}
            </Alert>
          )}
          <Stack direction="row" spacing={1.5} sx={{ justifyContent: 'flex-end' }}>
            <Button
              aria-busy={isSubmitting}
              disabled={isSubmitting}
              onClick={() => void handleSubmit()}
              startIcon={
                isSubmitting ? <CircularProgress color="inherit" size={18} /> : <SaveRoundedIcon />
              }
              type="button"
              variant="contained"
            >
              {isSubmitting ? 'Creating...' : 'Create Resume'}
            </Button>
          </Stack>
        </Paper>
      )}
    </Stack>
  )
}
