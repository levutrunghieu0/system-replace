import Skeleton from '@mui/material/Skeleton'
import TableCell from '@mui/material/TableCell'
import TableRow from '@mui/material/TableRow'

interface AppTableLoadingProps {
  columnCount: number
  rowCount?: number
}

export function AppTableLoading({ columnCount, rowCount = 5 }: AppTableLoadingProps) {
  return (
    <>
      {Array.from({ length: rowCount }, (_, rowIndex) => (
        <TableRow key={rowIndex}>
          {Array.from({ length: columnCount }, (_, colIndex) => (
            <TableCell key={colIndex}>
              <Skeleton
                variant="text"
                height={20}
                width={colIndex === 0 ? '40%' : `${60 + Math.random() * 30}%`}
              />
            </TableCell>
          ))}
        </TableRow>
      ))}
    </>
  )
}
