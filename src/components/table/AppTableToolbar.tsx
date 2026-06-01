import type { ReactNode } from 'react'
import type { Table } from '@tanstack/react-table'
import Box from '@mui/material/Box'
import Divider from '@mui/material/Divider'
import { AppTableColumnToggle } from './AppTableColumnToggle'
import { AppTableGlobalFilter } from './AppTableGlobalFilter'
import { AppTableSelectionActions } from './AppTableSelectionActions'

interface AppTableToolbarProps<TData> {
  table: Table<TData>
  searchable?: boolean
  columnVisibility?: boolean
  rowSelection?: boolean
  globalFilter: string
  onGlobalFilterChange: (value: string) => void
  toolbarLeft?: ReactNode
  toolbarRight?: ReactNode
}

export function AppTableToolbar<TData>({
  table,
  searchable,
  columnVisibility,
  rowSelection,
  globalFilter,
  onGlobalFilterChange,
  toolbarLeft,
  toolbarRight,
}: AppTableToolbarProps<TData>) {
  const selectedCount = rowSelection ? Object.keys(table.getState().rowSelection).length : 0
  const hasContent = searchable || columnVisibility || toolbarLeft || toolbarRight || selectedCount > 0

  if (!hasContent) return null

  return (
    <>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          px: 2,
          py: 1.25,
          flexWrap: 'wrap',
        }}
      >
        {selectedCount > 0 ? (
          <AppTableSelectionActions selectedCount={selectedCount} />
        ) : (
          toolbarLeft
        )}

        <Box sx={{ flexGrow: 1 }} />

        {searchable && (
          <AppTableGlobalFilter value={globalFilter} onChange={onGlobalFilterChange} />
        )}

        {toolbarRight}

        {columnVisibility && <AppTableColumnToggle table={table} />}
      </Box>
      <Divider />
    </>
  )
}
