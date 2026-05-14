import { BarChart3, FileText, Plus, RefreshCw } from 'lucide-react'
import { Link } from 'react-router'
import { Button } from '@/components/ui/button'
import { AnalyzeForm } from '@/features/analysis/components/AnalyzeForm'
import { StatsCard } from '@/features/dashboard/components/StatsCard'
import { StatsCardSkeleton } from '@/features/dashboard/components/StatsCardSkeleton'
import { useDashboardStats } from '@/features/dashboard/hooks/useDashboardStats'
import { ResumeUploadForm } from '@/features/resume/components/ResumeUploadForm'

export default function Dashboard() {
  const { totalResumes, totalAnalyses, isLoading, isError, refetch } = useDashboardStats()

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Overview of your resumes and analyses
          </p>
        </div>
        <div className="flex items-center gap-2">
          {isError && (
            <Button variant="outline" size="sm" onClick={refetch}>
              <RefreshCw className="mr-2 size-4" />
              Retry
            </Button>
          )}
          <Link
            to="/resume"
            className="inline-flex h-9 items-center justify-center gap-1.5 rounded-lg bg-primary px-3 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/80"
          >
            <Plus className="size-4" />
            Upload Resume
          </Link>
        </div>
      </div>

      {isError && (
        <div
          className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive"
          role="alert"
        >
          Failed to load dashboard stats. Please try again.
        </div>
      )}

      <section aria-label="Summary statistics">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {isLoading ? (
            <>
              <StatsCardSkeleton />
              <StatsCardSkeleton />
            </>
          ) : (
            <>
              <StatsCard
                title="Total Resumes"
                value={totalResumes}
                description="Resumes uploaded so far"
                icon={<FileText className="size-5" />}
              />
              <StatsCard
                title="Total Analyses"
                value={totalAnalyses}
                description="AI analyses completed"
                icon={<BarChart3 className="size-5" />}
              />
            </>
          )}
        </div>
      </section>

      <section aria-label="Quick actions">
        <h2 className="mb-4 text-lg font-semibold text-foreground">Quick Actions</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Link
            to="/resume"
            className="flex items-center gap-4 rounded-xl border border-border bg-card p-5 shadow-sm transition-colors hover:bg-accent hover:text-accent-foreground"
          >
            <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <FileText className="size-5" />
            </div>
            <div>
              <p className="font-medium">Upload Resume</p>
              <p className="text-sm text-muted-foreground">Add a new PDF or DOCX file</p>
            </div>
          </Link>
          <Link
            to="/analysis"
            className="flex items-center gap-4 rounded-xl border border-border bg-card p-5 shadow-sm transition-colors hover:bg-accent hover:text-accent-foreground"
          >
            <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <BarChart3 className="size-5" />
            </div>
            <div>
              <p className="font-medium">Analyze Resume</p>
              <p className="text-sm text-muted-foreground">Compare against a job description</p>
            </div>
          </Link>
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
        <section aria-label="Upload a new resume">
          <h2 className="mb-4 text-lg font-semibold text-foreground">Upload Resume</h2>
          <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
            <ResumeUploadForm />
          </div>
        </section>

        <section aria-label="Start a new analysis">
          <h2 className="mb-4 text-lg font-semibold text-foreground">Analyze Resume</h2>
          <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
            <AnalyzeForm />
          </div>
        </section>
      </div>
    </div>
  )
}
