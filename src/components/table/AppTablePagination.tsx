import TablePagination from '@mui/material/TablePagination'

interface AppTablePaginationProps {
  count: number
  page: number
  rowsPerPage: number
  rowsPerPageOptions: number[]
  onPageChange: (page: number) => void
  onRowsPerPageChange: (pageSize: number) => void
}

export function AppTablePagination({
  count,
  page,
  rowsPerPage,
  rowsPerPageOptions,
  onPageChange,
  onRowsPerPageChange,
}: AppTablePaginationProps) {
  return (
    <TablePagination
      component="div"
      count={count}
      page={page}
      rowsPerPage={rowsPerPage}
      rowsPerPageOptions={rowsPerPageOptions}
      onPageChange={(_, newPage) => onPageChange(newPage)}
      onRowsPerPageChange={(e) => onRowsPerPageChange(parseInt(e.target.value, 10))}
      sx={{ borderTop: '1px solid', borderColor: 'divider' }}
    />
  )
}
