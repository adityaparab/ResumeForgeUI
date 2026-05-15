import DescriptionRoundedIcon from '@mui/icons-material/DescriptionRounded'
import { describe, expect, it } from 'vitest'
import { StatsCard } from '@/features/dashboard/components/StatsCard'
import { StatsCardSkeleton } from '@/features/dashboard/components/StatsCardSkeleton'
import { render, screen } from '@/tests/test-utils'

describe('StatsCard', () => {
  it('renders title and value', () => {
    render(<StatsCard title="Total Resumes" value={5} icon={<DescriptionRoundedIcon />} />)
    expect(screen.getByText('Total Resumes')).toBeInTheDocument()
    expect(screen.getByText('5')).toBeInTheDocument()
  })

  it('renders description when provided', () => {
    render(
      <StatsCard
        title="Analyses"
        value={3}
        icon={<DescriptionRoundedIcon />}
        description="All time"
      />,
    )
    expect(screen.getByText('All time')).toBeInTheDocument()
  })

  it('does not render description when not provided', () => {
    const { queryByText } = render(
      <StatsCard title="Count" value={0} icon={<DescriptionRoundedIcon />} />,
    )
    expect(queryByText(/description/i)).not.toBeInTheDocument()
  })
})

describe('StatsCardSkeleton', () => {
  it('renders an accessible loading placeholder', () => {
    render(<StatsCardSkeleton />)
    expect(screen.getByLabelText(/loading dashboard metric/i)).toBeInTheDocument()
  })
})
