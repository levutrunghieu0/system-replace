import Box from '@mui/material/Box'
import TableCell from '@mui/material/TableCell'
import TableRow from '@mui/material/TableRow'
import Typography from '@mui/material/Typography'
import type { ReactNode } from 'react'
// import InboxIcon from '@mui/icons-material/Inbox'

interface AppTableEmptyProps {
  columnCount: number
  message?: ReactNode
}

export function AppTableEmpty({ columnCount, message = 'No data to display' }: AppTableEmptyProps) {
  return (
    <TableRow>
      <TableCell colSpan={columnCount} sx={{ border: 0, py: 0 }}>
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            py: 8,
            gap: 1.5,
            color: 'text.disabled',
          }}
        >
          {/* <InboxIcon sx={{ fontSize: 48 }} /> */}
          <Typography variant="body2">{message}</Typography>
        </Box>
      </TableCell>
    </TableRow>
  )
}
