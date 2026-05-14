import type { ColumnDef } from '@tanstack/react-table'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { DataTable } from '@/components/ui/data-table'

interface Row {
  name: string
  score: number
}

const columns: ColumnDef<Row>[] = [
  { accessorKey: 'name', header: 'Name' },
  { accessorKey: 'score', header: 'Score' },
]

const columnsWithSize: ColumnDef<Row>[] = [
  { accessorKey: 'name', header: 'Name', size: 200 },
  { accessorKey: 'score', header: 'Score', enableSorting: false },
]

const data: Row[] = [
  { name: 'Alice', score: 90 },
  { name: 'Bob', score: 80 },
  { name: 'Charlie', score: 95 },
]

describe('DataTable', () => {
  it('renders column headers', () => {
    render(<DataTable columns={columns} data={data} />)
    expect(screen.getByText('Name')).toBeInTheDocument()
    expect(screen.getByText('Score')).toBeInTheDocument()
  })

  it('renders all data rows', () => {
    render(<DataTable columns={columns} data={data} />)
    expect(screen.getByText('Alice')).toBeInTheDocument()
    expect(screen.getByText('Bob')).toBeInTheDocument()
    expect(screen.getByText('Charlie')).toBeInTheDocument()
  })

  it('shows empty message when no data', () => {
    render(<DataTable columns={columns} data={[]} emptyMessage="Nothing here" />)
    expect(screen.getByText('Nothing here')).toBeInTheDocument()
  })

  it('shows loading skeletons when isLoading=true', () => {
    render(<DataTable columns={columns} data={[]} isLoading />)
    const skeletons = document.querySelectorAll('.animate-pulse')
    expect(skeletons.length).toBeGreaterThan(0)
  })

  it('sorts by column on first click', async () => {
    const user = userEvent.setup()
    render(<DataTable columns={columns} data={data} />)

    await user.click(screen.getByRole('button', { name: /sort by score/i }))

    const rows = document.querySelectorAll('tbody tr')
    const scoreValues = Array.from(rows).map((row) => {
      const tds = row.querySelectorAll('td')
      return Number(tds[1]?.textContent)
    })
    // First click: descending (highest first — TanStack Table default)
    expect(scoreValues).toEqual([95, 90, 80])
  })

  it('reverses sort on second click', async () => {
    const user = userEvent.setup()
    render(<DataTable columns={columns} data={data} />)

    const sortBtn = screen.getByRole('button', { name: /sort by score/i })
    await user.click(sortBtn)

    const firstRows = document.querySelectorAll('tbody tr')
    const firstValues = Array.from(firstRows).map((row) =>
      Number(row.querySelectorAll('td')[1]?.textContent),
    )

    await user.click(sortBtn)

    const secondRows = document.querySelectorAll('tbody tr')
    const secondValues = Array.from(secondRows).map((row) =>
      Number(row.querySelectorAll('td')[1]?.textContent),
    )

    // Second click should produce the reverse order of first click
    expect(secondValues).toEqual([...firstValues].reverse())
  })

  it('applies custom className to wrapper', () => {
    const { container } = render(
      <DataTable columns={columns} data={data} className="custom-table" />,
    )
    expect(container.firstChild).toHaveClass('custom-table')
  })

  it('renders columns with custom size', () => {
    render(<DataTable columns={columnsWithSize} data={data} />)
    expect(screen.getByText('Name')).toBeInTheDocument()
    expect(screen.getByText('Score')).toBeInTheDocument()
  })

  it('renders column group headers (isPlaceholder branch)', () => {
    // Using a non-string header function to cover typeof header !== 'string' branch
    const columnsWithFnHeader: ColumnDef<Row>[] = [
      {
        accessorKey: 'name',
        header: () => <span>Custom Name</span>,
      },
      { accessorKey: 'score', header: 'Score' },
    ]
    render(<DataTable columns={columnsWithFnHeader} data={data} />)
    expect(screen.getByText('Custom Name')).toBeInTheDocument()
  })

  it('renders with column groups (covers isPlaceholder=true headers)', () => {
    // Mix grouped and non-grouped columns to trigger isPlaceholder=true in TanStack Table
    // When a top-level column exists alongside a grouped column,
    // the top-level column gets a placeholder header in the sub-row
    const groupedColumns: ColumnDef<Row>[] = [
      // Non-grouped top-level column (will be isPlaceholder in the 2nd header row)
      { accessorKey: 'name', header: 'Name' },
      {
        id: 'stats',
        header: 'Stats Group',
        columns: [{ accessorKey: 'score', header: 'Score' }],
      },
    ]
    render(<DataTable columns={groupedColumns} data={data} />)
    expect(screen.getByText('Stats Group')).toBeInTheDocument()
    expect(screen.getByText('Score')).toBeInTheDocument()
  })
})
