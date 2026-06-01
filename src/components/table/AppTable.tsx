import { useCallback, useMemo, useState } from 'react'
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table'
import type {
  ColumnDef,
  RowSelectionState,
  Updater,
  VisibilityState,
} from '@tanstack/react-table'
import Box from '@mui/material/Box'
import Checkbox from '@mui/material/Checkbox'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import TableSortLabel from '@mui/material/TableSortLabel'
import type { AppTableProps } from './types/table'
import { useTablePagination } from './hooks/useTablePagination'
import { useTableSorting } from './hooks/useTableSorting'
import { AppTableContainer } from './AppTableContainer'
import { AppTableEmpty } from './AppTableEmpty'
import { AppTableError } from './AppTableError'
import { AppTableLoading } from './AppTableLoading'
import { AppTablePagination } from './AppTablePagination'
import { AppTableToolbar } from './AppTableToolbar'

export function AppTable<TData>({
  data,
  columns,
  loading = false,
  error = false,
  errorMessage,
  emptyMessage,
  pagination: enablePagination = false,
  sorting: enableSorting = false,
  searchable = false,
  columnVisibility: enableColumnVisibility = false,
  rowSelection: enableRowSelection = false,
  pageSizeOptions = [10, 25, 50, 100],
  initialPageSize = 10,
  manualPagination = false,
  manualSorting = false,
  manualFiltering = false,
  totalRows,
  state,
  onPaginationChange,
  onSortingChange,
  onRowSelectionChange,
  onGlobalFilterChange,
  onColumnVisibilityChange,
  getRowId,
  onRowClick,
  toolbarLeft,
  toolbarRight,
  dense = false,
  stickyHeader = false,
  containerMaxHeight = 600,
  tableSx,
}: AppTableProps<TData>) {
  const { pagination, onPaginationChange: handlePaginationChange } = useTablePagination({
    initialPageSize,
    controlled: state?.pagination,
    onChange: onPaginationChange,
  })

  const { sorting, onSortingChange: handleSortingChange } = useTableSorting({
    controlled: state?.sorting,
    onChange: onSortingChange,
  })

  const [internalRowSelection, setInternalRowSelection] = useState<RowSelectionState>(
    state?.rowSelection ?? {},
  )
  const [internalColumnVisibility, setInternalColumnVisibility] = useState<VisibilityState>(
    state?.columnVisibility ?? {},
  )
  const [internalGlobalFilter, setInternalGlobalFilter] = useState(state?.globalFilter ?? '')

  const resolvedRowSelection = state?.rowSelection ?? internalRowSelection
  const resolvedColumnVisibility = state?.columnVisibility ?? internalColumnVisibility
  const resolvedGlobalFilter = state?.globalFilter ?? internalGlobalFilter

  const handleRowSelectionChange = (updater: Updater<RowSelectionState>) => {
    const next = typeof updater === 'function' ? updater(resolvedRowSelection) : updater
    if (!state?.rowSelection) setInternalRowSelection(next)
    onRowSelectionChange?.(next)
  }

  const handleColumnVisibilityChange = (updater: Updater<VisibilityState>) => {
    const next = typeof updater === 'function' ? updater(resolvedColumnVisibility) : updater
    if (!state?.columnVisibility) setInternalColumnVisibility(next)
    onColumnVisibilityChange?.(next)
  }

  const handleGlobalFilterChange = useCallback(
    (value: string) => {
      if (!state?.globalFilter) setInternalGlobalFilter(value)
      onGlobalFilterChange?.(value)
    },
    [state?.globalFilter, onGlobalFilterChange],
  )

  const selectionColumn = useMemo<ColumnDef<TData>>(
    () => ({
      id: '__selection__',
      size: 48,
      enableSorting: false,
      enableGlobalFilter: false,
      header: ({ table }) => (
        <Checkbox
          size="small"
          checked={table.getIsAllPageRowsSelected()}
          indeterminate={
            table.getIsSomePageRowsSelected() && !table.getIsAllPageRowsSelected()
          }
          onChange={table.getToggleAllPageRowsSelectedHandler()}
          onClick={(e) => e.stopPropagation()}
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          size="small"
          checked={row.getIsSelected()}
          disabled={!row.getCanSelect()}
          onChange={row.getToggleSelectedHandler()}
          onClick={(e) => e.stopPropagation()}
        />
      ),
    }),
    [],
  )

  const effectiveColumns = useMemo<ColumnDef<TData>[]>(
    () => (enableRowSelection ? [selectionColumn, ...columns] : columns),
    [enableRowSelection, selectionColumn, columns],
  )

  const table = useReactTable<TData>({
    data,
    columns: effectiveColumns,
    getCoreRowModel: getCoreRowModel(),
    ...(enableSorting && { getSortedRowModel: getSortedRowModel() }),
    ...(searchable && { getFilteredRowModel: getFilteredRowModel() }),
    ...(enablePagination && { getPaginationRowModel: getPaginationRowModel() }),
    state: {
      sorting,
      pagination,
      rowSelection: resolvedRowSelection,
      columnVisibility: resolvedColumnVisibility,
      globalFilter: resolvedGlobalFilter,
    },
    onSortingChange: handleSortingChange,
    onPaginationChange: handlePaginationChange,
    onRowSelectionChange: handleRowSelectionChange,
    onColumnVisibilityChange: handleColumnVisibilityChange,
    onGlobalFilterChange: (updater) => {
      const next = typeof updater === 'function' ? updater(resolvedGlobalFilter) : updater
      handleGlobalFilterChange(String(next))
    },
    manualPagination,
    manualSorting,
    manualFiltering,
    pageCount:
      manualPagination && totalRows !== undefined
        ? Math.ceil(totalRows / pagination.pageSize)
        : undefined,
    getRowId: getRowId ? (row, index) => getRowId(row, index) : undefined,
    enableSorting,
    enableRowSelection,
    enableGlobalFilter: searchable,
  })

  const { rows } = table.getRowModel()
  const columnCount = table.getVisibleLeafColumns().length
  const showEmpty = !loading && !error && rows.length === 0
  const showRows = !loading && !error && rows.length > 0

  const totalCount = manualPagination && totalRows !== undefined
    ? totalRows
    : table.getFilteredRowModel().rows.length

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
      <AppTableContainer stickyHeader={stickyHeader} maxHeight={containerMaxHeight}>
        <AppTableToolbar
          table={table}
          searchable={searchable}
          columnVisibility={enableColumnVisibility}
          rowSelection={enableRowSelection}
          globalFilter={resolvedGlobalFilter}
          onGlobalFilterChange={handleGlobalFilterChange}
          toolbarLeft={toolbarLeft}
          toolbarRight={toolbarRight}
        />

        <Table
          size={dense ? 'small' : 'medium'}
          stickyHeader={stickyHeader}
          aria-label="data table"
          sx={tableSx}
        >
          <TableHead>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  const canSort = enableSorting && header.column.getCanSort()
                  const sorted = header.column.getIsSorted()

                  return (
                    <TableCell
                      key={header.id}
                      colSpan={header.colSpan}
                      style={{ width: header.getSize() !== 150 ? header.getSize() : undefined }}
                      sx={header.column.columnDef.meta?.headerSx}
                    >
                      {header.isPlaceholder ? null : canSort ? (
                        <TableSortLabel
                          active={sorted !== false}
                          direction={sorted === 'asc' ? 'asc' : 'desc'}
                          onClick={header.column.getToggleSortingHandler()}
                        >
                          {flexRender(header.column.columnDef.header, header.getContext())}
                        </TableSortLabel>
                      ) : (
                        flexRender(header.column.columnDef.header, header.getContext())
                      )}
                    </TableCell>
                  )
                })}
              </TableRow>
            ))}
          </TableHead>

          <TableBody>
            {loading && <AppTableLoading columnCount={columnCount} />}
            {error && <AppTableError columnCount={columnCount} message={errorMessage} />}
            {showEmpty && <AppTableEmpty columnCount={columnCount} message={emptyMessage} />}

            {showRows &&
              rows.map((row) => (
                <TableRow
                  key={row.id}
                  hover={Boolean(onRowClick)}
                  selected={row.getIsSelected()}
                  onClick={onRowClick ? () => onRowClick(row.original) : undefined}
                  sx={onRowClick ? { cursor: 'pointer' } : undefined}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} sx={cell.column.columnDef.meta?.cellSx}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
          </TableBody>
        </Table>

        {enablePagination && (
          <AppTablePagination
            count={totalCount}
            page={pagination.pageIndex}
            rowsPerPage={pagination.pageSize}
            rowsPerPageOptions={pageSizeOptions}
            onPageChange={(page) =>
              handlePaginationChange({ pageIndex: page, pageSize: pagination.pageSize })
            }
            onRowsPerPageChange={(pageSize) =>
              handlePaginationChange({ pageIndex: 0, pageSize })
            }
          />
        )}
      </AppTableContainer>
    </Box>
  )
}
