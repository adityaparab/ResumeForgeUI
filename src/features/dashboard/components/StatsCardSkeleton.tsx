export function StatsCardSkeleton() {
  return (
    <div className="rounded-xl border border-border bg-card p-6 shadow-sm animate-pulse">
      <div className="flex items-center justify-between">
        <div className="h-4 w-24 rounded bg-muted" />
        <div className="h-5 w-5 rounded bg-muted" />
      </div>
      <div className="mt-2 h-9 w-16 rounded bg-muted" />
      <div className="mt-1 h-3 w-32 rounded bg-muted" />
    </div>
  )
}
