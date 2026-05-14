import { useQuery } from '@tanstack/react-query'
import { ChevronLeft, Download } from 'lucide-react'
import { useNavigate, useParams } from 'react-router'
import LoadingSpinner from '@/components/common/LoadingSpinner'
import { resumeApi } from '@/lib/api-client'
import type { StructuredContent } from '@/lib/schemas/resume.schema'
import { cn } from '@/lib/utils'

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-xl border border-border bg-card p-6 shadow-sm">
      <h2 className="mb-4 text-base font-semibold text-foreground">{title}</h2>
      {children}
    </section>
  )
}

function StructuredContentView({ content }: { content: StructuredContent }) {
  return (
    <div className="space-y-6">
      {content.basics && (
        <Section title="Basics">
          <div className="space-y-1 text-sm">
            {content.basics.name && (
              <p className="text-lg font-semibold text-foreground">{content.basics.name}</p>
            )}
            {content.basics.label && (
              <p className="text-muted-foreground">{content.basics.label}</p>
            )}
            {content.basics.email && (
              <p>
                <a href={`mailto:${content.basics.email}`} className="text-primary hover:underline">
                  {content.basics.email}
                </a>
              </p>
            )}
            {content.basics.phone && (
              <p className="text-muted-foreground">{content.basics.phone}</p>
            )}
            {content.basics.summary && (
              <p className="mt-3 text-muted-foreground">{content.basics.summary}</p>
            )}
          </div>
        </Section>
      )}

      {content.work && content.work.length > 0 && (
        <Section title="Work Experience">
          <div className="space-y-4">
            {content.work.map((job, i) => (
              // biome-ignore lint/suspicious/noArrayIndexKey: API items lack stable IDs
              <div key={i} className="border-l-2 border-border pl-4">
                <p className="font-medium text-foreground">{job.position}</p>
                <p className="text-sm text-muted-foreground">{job.name}</p>
                {(job.startDate ?? job.endDate) && (
                  <p className="text-xs text-muted-foreground">
                    {job.startDate} – {job.endDate ?? 'Present'}
                  </p>
                )}
                {job.summary && <p className="mt-1 text-sm text-muted-foreground">{job.summary}</p>}
              </div>
            ))}
          </div>
        </Section>
      )}

      {content.education && content.education.length > 0 && (
        <Section title="Education">
          <div className="space-y-4">
            {content.education.map((edu, i) => (
              // biome-ignore lint/suspicious/noArrayIndexKey: API items lack stable IDs
              <div key={i} className="border-l-2 border-border pl-4">
                <p className="font-medium text-foreground">{edu.institution}</p>
                <p className="text-sm text-muted-foreground">
                  {edu.studyType} {edu.area ? `in ${edu.area}` : ''}
                </p>
                {(edu.startDate ?? edu.endDate) && (
                  <p className="text-xs text-muted-foreground">
                    {edu.startDate} – {edu.endDate ?? 'Present'}
                  </p>
                )}
              </div>
            ))}
          </div>
        </Section>
      )}

      {content.skills && content.skills.length > 0 && (
        <Section title="Skills">
          <div className="flex flex-wrap gap-2">
            {content.skills.flatMap((skill) =>
              (skill.keywords ?? [skill.name ?? '']).map((kw) => (
                <span
                  key={kw}
                  className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary"
                >
                  {kw}
                </span>
              )),
            )}
          </div>
        </Section>
      )}
    </div>
  )
}

export default function ResumeDetail() {
  const { resumeId } = useParams<{ resumeId: string }>()
  const navigate = useNavigate()

  const {
    data: resume,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ['resume', resumeId],
    queryFn: () => resumeApi.getById(resumeId!),
    enabled: !!resumeId,
  })

  const handleDownload = async () => {
    /* v8 ignore next */
    if (!resumeId) return
    const blob = await resumeApi.download(resumeId)
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    /* v8 ignore next */
    a.download = resume?.originalName ?? 'resume.pdf'
    a.click()
    URL.revokeObjectURL(url)
  }

  if (!resumeId) {
    return (
      <div role="alert" className="text-destructive">
        Invalid resume ID.
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

  if (isError || !resume) {
    return (
      <div
        role="alert"
        className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive"
      >
        Failed to load resume.
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => navigate('/resume')}
          className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
        >
          <ChevronLeft className="size-4" />
          Back to Resumes
        </button>
      </div>

      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">{resume.originalName}</h1>
          <p className="mt-1 font-mono text-sm text-muted-foreground">{resumeId}</p>
        </div>
        <div className="flex items-center gap-2">
          <span
            className={cn(
              'inline-flex items-center rounded-full px-3 py-1 text-xs font-medium',
              resume.status === 'completed'
                ? 'bg-green-100 text-green-800'
                : resume.status === 'failed'
                  ? 'bg-red-100 text-red-800'
                  : 'bg-yellow-100 text-yellow-800',
            )}
          >
            {resume.status}
          </span>
          {resume.status === 'completed' && (
            <button
              type="button"
              onClick={handleDownload}
              className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-background px-3 py-1.5 text-sm font-medium hover:bg-muted"
            >
              <Download className="size-4" />
              Download
            </button>
          )}
        </div>
      </div>

      {resume.structuredContent ? (
        <StructuredContentView content={resume.structuredContent} />
      ) : (
        <div className="rounded-xl border border-border bg-card px-4 py-8 text-center text-muted-foreground">
          {resume.status === 'completed'
            ? 'No structured content available.'
            : 'Resume is still being processed.'}
        </div>
      )}
    </div>
  )
}
