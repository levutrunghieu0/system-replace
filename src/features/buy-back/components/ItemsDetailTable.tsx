import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import Chip from '@mui/material/Chip'
import IconButton from '@mui/material/IconButton'
import DeleteOutlinedIcon from '@mui/icons-material/DeleteOutlined'
import WarningAmberIcon from '@mui/icons-material/WarningAmber'
import { useTranslation } from 'react-i18next'
import type { PurchaseLineItem } from '../types'

const thSx = {
  fontSize: '0.72rem',
  fontWeight: 700,
  color: 'text.secondary',
  py: 0.75,
  px: 1,
  bgcolor: 'grey.50',
  borderBottom: '2px solid',
  borderColor: 'divider',
  whiteSpace: 'nowrap' as const,
}

const tdSx = {
  fontSize: '0.82rem',
  py: 0.75,
  px: 1,
  borderBottom: '1px solid',
  borderColor: 'divider',
}

interface Props {
  items: PurchaseLineItem[]
  onDelete: (id: string) => void
}

export function ItemsDetailTable({ items, onDelete }: Props) {
  const { t } = useTranslation()

  if (items.length === 0) {
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', py: 4, border: '1px dashed', borderColor: 'divider', borderRadius: 1, color: 'text.disabled', gap: 1 }}>
        <Typography variant="body2">{t('page.purchase.itemsTable.empty')}</Typography>
      </Box>
    )
  }

  return (
    <Box sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 1, overflow: 'hidden' }}>
      <Table size="small" stickyHeader>
        <TableHead>
          <TableRow>
            {(['no', 'brand', 'model', 'size', 'condition', 'appraisalValue', 'purchasePrice'] as const).map((col) => (
              <TableCell key={col} sx={thSx}>
                {t(`page.purchase.itemsTable.col.${col}` as Parameters<typeof t>[0])}
              </TableCell>
            ))}
            <TableCell sx={thSx} />
          </TableRow>
        </TableHead>
        <TableBody>
          {items.map((item, idx) => (
            <TableRow key={item.id} hover>
              <TableCell sx={{ ...tdSx, color: 'text.secondary' }}>{idx + 1}</TableCell>
              <TableCell sx={tdSx}><Typography variant="body2" sx={{ fontWeight: 600 }}>{item.brand}</Typography></TableCell>
              <TableCell sx={tdSx}>{item.model}</TableCell>
              <TableCell sx={tdSx}>{item.size}</TableCell>
              <TableCell sx={tdSx}>
                <Chip label={item.condition} size="small" sx={{ fontSize: '0.7rem', height: 20, bgcolor: 'action.hover', fontWeight: 600 }} />
              </TableCell>
              <TableCell sx={{ ...tdSx, textAlign: 'right' }}>
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>¥{item.appraisalValue.toLocaleString()}</Typography>
              </TableCell>
              <TableCell sx={{ ...tdSx, textAlign: 'right' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 0.5 }}>
                  {item.manualOverride && <WarningAmberIcon sx={{ fontSize: '0.9rem', color: 'warning.main' }} />}
                  <Typography variant="body2" sx={{ fontWeight: 700, color: item.manualOverride ? 'warning.dark' : 'text.primary' }}>
                    ¥{item.purchasePrice.toLocaleString()}
                  </Typography>
                </Box>
              </TableCell>
              <TableCell sx={{ ...tdSx, width: 40, pr: 0.5 }}>
                <IconButton size="small" onClick={() => onDelete(item.id)} sx={{ color: 'text.disabled', '&:hover': { color: 'error.main' } }}>
                  <DeleteOutlinedIcon sx={{ fontSize: '1rem' }} />
                </IconButton>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Box>
  )
}
