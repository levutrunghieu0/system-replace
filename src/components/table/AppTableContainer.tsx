import type { ReactNode } from 'react'
import Paper from '@mui/material/Paper'
import TableContainer from '@mui/material/TableContainer'

interface AppTableContainerProps {
  children: ReactNode
  stickyHeader?: boolean
  maxHeight?: number | string
}

export function AppTableContainer({ children, stickyHeader, maxHeight = 600 }: AppTableContainerProps) {
  return (
    <Paper
      elevation={0}
      sx={{
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: 2,
        overflow: 'hidden',
      }}
    >
      <TableContainer sx={stickyHeader ? { maxHeight } : undefined}>
        {children}
      </TableContainer>
    </Paper>
  )
}
