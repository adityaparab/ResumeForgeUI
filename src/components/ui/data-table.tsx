import { Box, Skeleton, Table, Text } from '@chakra-ui/react'
import {
  type ColumnDef,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  type SortingState,
  useReactTable,
} from '@tanstack/react-table'
import { ChevronDown, ChevronsUpDown, ChevronUp } from 'lucide-react'
import { useState } from 'react'

interface DataTableProps<TData> {
  columns: ColumnDef<TData, unknown>[]
  data: TData[]
  isLoading?: boolean
  emptyMessage?: string
}

function SortIcon({ sorted }: { sorted: false | 'asc' | 'desc' }) {
  if (sorted === 'asc') return <ChevronUp size={14} />
  if (sorted === 'desc') return <ChevronDown size={14} />
  return <ChevronsUpDown size={14} opacity={0.5} />
}

export function DataTable<TData>({
  columns,
  data,
  isLoading = false,
  emptyMessage = 'No results found.',
}: DataTableProps<TData>) {
  const [sorting, setSorting] = useState<SortingState>([])

  const table = useReactTable({
    data,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  })

  return (
    <Box w="full" overflowX="auto" borderRadius="xl" borderWidth="1px" borderColor="border.subtle">
      <Table.Root size="sm">
        <Table.Header>
          {table.getHeaderGroups().map((headerGroup) => (
            <Table.Row key={headerGroup.id} bg="bg.subtle">
              {headerGroup.headers.map((header) => (
                <Table.ColumnHeader
                  key={header.id}
                  px={4}
                  py={3}
                  textAlign="left"
                  fontSize="xs"
                  fontWeight="600"
                  color="fg.muted"
                  textTransform="uppercase"
                  letterSpacing="wide"
                  style={{ width: header.getSize() !== 150 ? header.getSize() : undefined }}
                >
                  {header.isPlaceholder ? null : header.column.getCanSort() ? (
                    <Box
                      as="button"
                      type="button"
                      display="inline-flex"
                      alignItems="center"
                      gap={1}
                      cursor="pointer"
                      _hover={{ color: 'fg' }}
                      transition="color 0.15s"
                      onClick={header.column.getToggleSortingHandler()}
                      aria-label={`Sort by ${typeof header.column.columnDef.header === 'string' ? header.column.columnDef.header : header.id}`}
                    >
                      {flexRender(header.column.columnDef.header, header.getContext())}
                      <SortIcon sorted={header.column.getIsSorted()} />
                    </Box>
                  ) : (
                    flexRender(header.column.columnDef.header, header.getContext())
                  )}
                </Table.ColumnHeader>
              ))}
            </Table.Row>
          ))}
        </Table.Header>
        <Table.Body>
          {isLoading ? (
            Array.from({ length: 3 }).map((_, i) => (
              // biome-ignore lint/suspicious/noArrayIndexKey: skeleton rows have stable order
              <Table.Row key={i}>
                {columns.map((_, j) => (
                  // biome-ignore lint/suspicious/noArrayIndexKey: skeleton columns have stable order
                  <Table.Cell key={j} px={4} py={3}>
                    <Skeleton h={4} w="full" borderRadius="sm" />
                  </Table.Cell>
                ))}
              </Table.Row>
            ))
          ) : table.getRowModel().rows.length === 0 ? (
            <Table.Row>
              <Table.Cell colSpan={columns.length} px={4} py={8} textAlign="center">
                <Text color="fg.muted">{emptyMessage}</Text>
              </Table.Cell>
            </Table.Row>
          ) : (
            table.getRowModel().rows.map((row) => (
              <Table.Row key={row.id} _hover={{ bg: 'bg.subtle' }} transition="background 0.15s">
                {row.getVisibleCells().map((cell) => (
                  <Table.Cell key={cell.id} px={4} py={3}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </Table.Cell>
                ))}
              </Table.Row>
            ))
          )}
        </Table.Body>
      </Table.Root>
    </Box>
  )
}
