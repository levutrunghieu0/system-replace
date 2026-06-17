import type { ReactNode } from 'react'
import type { SxProps, Theme } from '@mui/material/styles'
import type {
  ColumnDef,
  PaginationState,
  RowData,
  RowSelectionState,
  SortingState,
  VisibilityState,
} from '@tanstack/react-table'

declare module '@tanstack/react-table' {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  interface ColumnMeta<TData extends RowData, TValue> {
    headerSx?: SxProps<Theme>
    cellSx?: SxProps<Theme>
  }
}

export interface AppTableProps<TData> {
  data: TData[]
  columns: ColumnDef<TData>[]

  loading?: boolean
  error?: boolean
  errorMessage?: string
  emptyMessage?: ReactNode

  pagination?: boolean
  sorting?: boolean
  searchable?: boolean
  columnVisibility?: boolean
  rowSelection?: boolean

  pageSizeOptions?: number[]
  initialPageSize?: number

  manualPagination?: boolean
  manualSorting?: boolean
  manualFiltering?: boolean
  totalRows?: number

  state?: {
    pagination?: PaginationState
    sorting?: SortingState
    rowSelection?: RowSelectionState
    columnVisibility?: VisibilityState
    globalFilter?: string
  }

  onPaginationChange?: (pagination: PaginationState) => void
  onSortingChange?: (sorting: SortingState) => void
  onRowSelectionChange?: (rowSelection: RowSelectionState) => void
  onGlobalFilterChange?: (value: string) => void
  onColumnVisibilityChange?: (visibility: VisibilityState) => void

  getRowId?: (row: TData, index: number) => string
  onRowClick?: (row: TData) => void
  getRowSx?: (row: TData) => SxProps<Theme>

  toolbarLeft?: ReactNode
  toolbarRight?: ReactNode

  /** Rendered as the first <TableRow> inside <TableBody>, before data rows. */
  topInputRow?: ReactNode

  dense?: boolean
  stickyHeader?: boolean
  containerMaxHeight?: number | string
  tableSx?: SxProps<Theme>
}
