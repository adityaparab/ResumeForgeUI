import { cn } from '@/lib/utils'

interface StatsCardProps {
  title: string
  value: number | string
  description?: string
  icon: React.ReactNode
  className?: string
}

export function StatsCard({ title, value, description, icon, className }: StatsCardProps) {
  return (
    <div className={cn('rounded-xl border border-border bg-card p-6 shadow-sm', className)}>
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-muted-foreground">{title}</p>
        <div className="text-muted-foreground">{icon}</div>
      </div>
      <p className="mt-2 text-3xl font-bold text-foreground">{value}</p>
      {description && <p className="mt-1 text-xs text-muted-foreground">{description}</p>}
    </div>
  )
}
