import Alert from '@mui/material/Alert'
import TableCell from '@mui/material/TableCell'
import TableRow from '@mui/material/TableRow'

interface AppTableErrorProps {
  columnCount: number
  message?: string
}

export function AppTableError({
  columnCount,
  message = 'Failed to load data. Please try again.',
}: AppTableErrorProps) {
  return (
    <TableRow>
      <TableCell colSpan={columnCount} sx={{ border: 0 }}>
        <Alert severity="error" variant="outlined">
          {message}
        </Alert>
      </TableCell>
    </TableRow>
  )
}
