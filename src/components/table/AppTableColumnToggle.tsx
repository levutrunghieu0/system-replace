import { useState } from 'react'
import type { Column, Table } from '@tanstack/react-table'
import Checkbox from '@mui/material/Checkbox'
import IconButton from '@mui/material/IconButton'
import ListItemText from '@mui/material/ListItemText'
import Menu from '@mui/material/Menu'
import MenuItem from '@mui/material/MenuItem'
import Tooltip from '@mui/material/Tooltip'
import ViewColumnIcon from '@mui/icons-material/ViewColumn'

function getHeaderLabel<TData>(column: Column<TData, unknown>): string {
  const header = column.columnDef.header
  if (typeof header === 'string') return header
  return column.id.replace(/_/g, ' ')
}

interface AppTableColumnToggleProps<TData> {
  table: Table<TData>
}

export function AppTableColumnToggle<TData>({ table }: AppTableColumnToggleProps<TData>) {
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null)
  const open = Boolean(anchorEl)

  const toggleableColumns = table
    .getAllLeafColumns()
    .filter((col) => col.id !== '__selection__')

  const visibleCount = toggleableColumns.filter((col) => col.getIsVisible()).length

  return (
    <>
      <Tooltip title="Toggle columns" arrow>
        <IconButton
          size="small"
          onClick={(e) => setAnchorEl(e.currentTarget)}
          aria-label="toggle columns"
        >
          <ViewColumnIcon fontSize="small" />
        </IconButton>
      </Tooltip>

      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={() => setAnchorEl(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        slotProps={{ paper: { sx: { minWidth: 180 } } }}
      >
        {toggleableColumns.map((column) => {
          const isVisible = column.getIsVisible()
          const isLastVisible = visibleCount === 1 && isVisible

          return (
            <MenuItem
              key={column.id}
              dense
              disabled={isLastVisible}
              onClick={() => column.toggleVisibility()}
            >
              <Checkbox
                size="small"
                checked={isVisible}
                disableRipple
                sx={{ p: 0, mr: 1 }}
              />
              <ListItemText
                primary={getHeaderLabel(column)}
                slotProps={{ primary: { sx: { textTransform: 'capitalize' } } }}
              />
            </MenuItem>
          )
        })}
      </Menu>
    </>
  )
}
