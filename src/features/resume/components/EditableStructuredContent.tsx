import { RotateCcw, Save } from 'lucide-react'
import { useId } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import type { StructuredContent } from '@/lib/schemas/resume.schema'
import { cn } from '@/lib/utils'

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
    <div className="grid gap-1.5 text-sm">
      <label htmlFor={id} className="font-medium text-muted-foreground">
        {label}
      </label>
      {multiline ? (
        <textarea
          id={id}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className="min-h-24 w-full resize-y rounded-lg border border-input bg-transparent px-3 py-2 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
        />
      ) : (
        <Input id={id} value={value} onChange={(event) => onChange(event.target.value)} />
      )}
    </div>
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
      <div className="space-y-4">
        {records.map((item, index) => (
          <div
            // biome-ignore lint/suspicious/noArrayIndexKey: structured resume arrays do not include stable IDs
            key={index}
            className="rounded-lg border border-border/70 bg-background/60 p-4"
          >
            <div className="grid gap-4 md:grid-cols-2">
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
            </div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="grid gap-4 md:grid-cols-2">
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
    </div>
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
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-end gap-2">
        <Button
          type="button"
          variant="outline"
          onClick={onReset}
          disabled={!isDirty || isSubmitting}
        >
          <RotateCcw className="size-4" />
          Reset
        </Button>
        <Button type="button" onClick={onSubmit} disabled={!isDirty || isSubmitting}>
          <Save className="size-4" />
          Save changes
        </Button>
      </div>

      {sections.length > 0 ? (
        sections.map(([sectionKey, sectionValue]) => (
          <section
            key={sectionKey}
            className="rounded-xl border border-border bg-card p-6 shadow-sm"
          >
            <h2 className="mb-4 text-base font-semibold text-foreground">
              {formatSectionTitle(sectionKey)}
            </h2>
            <EditableValue
              content={content}
              label={sectionKey}
              path={[sectionKey]}
              value={sectionValue}
              onChange={onChange}
            />
          </section>
        ))
      ) : (
        <div
          className={cn(
            'rounded-xl border border-border bg-card px-4 py-8 text-center text-muted-foreground',
          )}
        >
          No structured fields available.
        </div>
      )}
    </div>
  )
}
