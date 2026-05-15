import { BarChart3, FileText, Plus, RefreshCw } from 'lucide-react'
import { Link } from 'react-router'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { StatsCard } from '@/features/dashboard/components/StatsCard'
import { StatsCardSkeleton } from '@/features/dashboard/components/StatsCardSkeleton'
import { useDashboardStats } from '@/features/dashboard/hooks/useDashboardStats'

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
          <Button size="lg" render={<Link to="/resume" />}>
            <Plus className="size-4" />
            Upload Resume
          </Button>
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
          <Card className="transition-colors hover:bg-accent hover:text-accent-foreground">
            <Link to="/resume" className="flex items-center gap-4 p-5">
              <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <FileText className="size-5" />
              </div>
              <div>
                <p className="font-medium">Upload Resume</p>
                <p className="text-sm text-muted-foreground">Add a new PDF or DOCX file</p>
              </div>
            </Link>
          </Card>
          <Card className="transition-colors hover:bg-accent hover:text-accent-foreground">
            <Link to="/analysis" className="flex items-center gap-4 p-5">
              <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <BarChart3 className="size-5" />
              </div>
              <div>
                <p className="font-medium">Analyze Resume</p>
                <p className="text-sm text-muted-foreground">Compare against a job description</p>
              </div>
            </Link>
          </Card>
        </div>
      </section>
    </div>
  )
}
