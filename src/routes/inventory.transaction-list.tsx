import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Chip from '@mui/material/Chip'
import Divider from '@mui/material/Divider'
import IconButton from '@mui/material/IconButton'
import InputAdornment from '@mui/material/InputAdornment'
import MenuItem from '@mui/material/MenuItem'
import OutlinedInput from '@mui/material/OutlinedInput'
import Paper from '@mui/material/Paper'
import Select from '@mui/material/Select'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import QrCodeScannerIcon from '@mui/icons-material/QrCodeScanner'
import ClearIcon from '@mui/icons-material/Clear'
import SearchIcon from '@mui/icons-material/Search'
import { useTranslation } from 'react-i18next'
import { useLayoutConfig } from '../hooks/useLayoutConfig'

export const Route = createFileRoute('/inventory/transaction-list')({
  component: TransactionListPage,
})

interface TransactionRow {
  slipNo: string
  date: string
  type: string
  productCode: string
  productName: string
  quantity: number
  amount: number
  operator: string
}

const MOCK_TRANSACTIONS: Record<string, TransactionRow[]> = {
  '1234567': [
    { slipNo: 'S20260501-001', date: '2026/05/01', type: '買取', productCode: '1234567', productName: 'レ_カーディガン', quantity: 1, amount: 2200, operator: '田中' },
    { slipNo: 'S20260410-032', date: '2026/04/10', type: '在庫調整', productCode: '1234567', productName: 'レ_カーディガン', quantity: -1, amount: 0, operator: '山田' },
    { slipNo: 'S20260325-015', date: '2026/03/25', type: '棚卸', productCode: '1234567', productName: 'レ_カーディガン', quantity: 3, amount: 6600, operator: '鈴木' },
  ],
  '7654321': [
    { slipNo: 'S20260502-007', date: '2026/05/02', type: '買取', productCode: '7654321', productName: 'メ_スラックス', quantity: 2, amount: 4400, operator: '田中' },
  ],
}

const BUSINESS_TYPES = ['全て', '買取', '販売', '棚卸', '在庫調整', '移動', '返品']

function TransactionListPage() {
  const { t } = useTranslation()
  const [scanInput, setScanInput] = useState('')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [businessType, setBusinessType] = useState('全て')
  const [rows, setRows] = useState<TransactionRow[]>([])
  const [searched, setSearched] = useState(false)

  useLayoutConfig({
    title: t('page.tanazaoroshi.transactionList.title'),
  })

  const handleSearch = () => {
    const code = scanInput.trim()
    let result = code ? (MOCK_TRANSACTIONS[code] ?? []) : Object.values(MOCK_TRANSACTIONS).flat()
    if (businessType !== '全て') {
      result = result.filter((r) => r.type === businessType)
    }
    setRows(result)
    setSearched(true)
  }

  const headerSx = {
    fontSize: '0.75rem', fontWeight: 600, color: 'text.secondary',
    py: 0.75, px: 1.5, whiteSpace: 'nowrap' as const,
    bgcolor: 'background.paper', borderBottom: '2px solid', borderColor: 'divider',
  }
  const cellSx = { fontSize: '0.82rem', py: 0.75, px: 1.5, whiteSpace: 'nowrap' as const }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, height: '100%' }}>
      {/* Search panel */}
      <Paper variant="outlined" sx={{ p: 1.5 }}>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5, alignItems: 'flex-end' }}>
          {/* Product code / scan */}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
            <Typography sx={{ fontSize: '0.78rem', color: 'text.secondary' }}>
              {t('page.tanazaoroshi.transactionList.filter.productCode')}
            </Typography>
            <OutlinedInput
              size="small"
              value={scanInput}
              onChange={(e) => setScanInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              placeholder={t('page.tanazaoroshi.transactionList.searchPlaceholder')}
              startAdornment={
                <InputAdornment position="start">
                  <QrCodeScannerIcon fontSize="small" sx={{ color: 'text.secondary' }} />
                </InputAdornment>
              }
              endAdornment={
                scanInput ? (
                  <InputAdornment position="end">
                    <IconButton size="small" onClick={() => setScanInput('')}>
                      <ClearIcon fontSize="small" />
                    </IconButton>
                  </InputAdornment>
                ) : null
              }
              sx={{ width: 240 }}
            />
          </Box>

          {/* Date range */}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
            <Typography sx={{ fontSize: '0.78rem', color: 'text.secondary' }}>
              {t('page.tanazaoroshi.transactionList.filter.period')}
            </Typography>
            <Box sx={{ display: 'flex', gap: 0.5, alignItems: 'center' }}>
              <TextField size="small" type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} sx={{ width: 140 }} />
              <Typography sx={{ fontSize: '0.8rem', color: 'text.secondary' }}>〜</Typography>
              <TextField size="small" type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} sx={{ width: 140 }} />
            </Box>
          </Box>

          {/* Business type */}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
            <Typography sx={{ fontSize: '0.78rem', color: 'text.secondary' }}>
              {t('page.tanazaoroshi.transactionList.filter.business')}
            </Typography>
            <Select
              size="small"
              value={businessType}
              onChange={(e) => setBusinessType(e.target.value)}
              sx={{ fontSize: '0.85rem', minWidth: 120 }}
            >
              {BUSINESS_TYPES.map((bt) => (
                <MenuItem key={bt} value={bt} sx={{ fontSize: '0.85rem' }}>{bt}</MenuItem>
              ))}
            </Select>
          </Box>

          <Button
            variant="contained"
            size="small"
            startIcon={<SearchIcon fontSize="small" />}
            onClick={handleSearch}
            sx={{ alignSelf: 'flex-end' }}
          >
            {t('page.tanazaoroshi.transactionList.filter.search')}
          </Button>
        </Box>

        {/* Active filters display */}
        {searched && (
          <>
            <Divider sx={{ my: 1 }} />
            <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap', alignItems: 'center' }}>
              <Typography sx={{ fontSize: '0.75rem', color: 'text.secondary' }}>検索条件：</Typography>
              {scanInput && <Chip label={`商品：${scanInput}`} size="small" variant="outlined" />}
              {dateFrom && <Chip label={`${dateFrom} 〜 ${dateTo || '現在'}`} size="small" variant="outlined" />}
              {businessType !== '全て' && <Chip label={businessType} size="small" variant="outlined" color="primary" />}
              <Typography sx={{ fontSize: '0.75rem', color: 'text.secondary', ml: 'auto' }}>
                {rows.length} 件
              </Typography>
            </Box>
          </>
        )}
      </Paper>

      {/* Result table */}
      <TableContainer sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 1, flex: 1 }}>
        <Table size="small" stickyHeader>
          <TableHead>
            <TableRow>
              {(['slipNo', 'date', 'type', 'productCode', 'productName', 'quantity', 'amount', 'operator'] as const).map((col) => (
                <TableCell key={col} sx={{ ...headerSx, textAlign: col === 'quantity' || col === 'amount' ? 'right' : 'left' }}>
                  {t(`page.tanazaoroshi.transactionList.col.${col}`)}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} align="center" sx={{ py: 4, color: 'text.secondary', fontSize: '0.82rem' }}>
                  {searched ? '該当する取引データはありません' : '商品コードを入力して検索してください'}
                </TableCell>
              </TableRow>
            ) : (
              rows.map((row, idx) => (
                <TableRow key={idx} hover>
                  <TableCell sx={cellSx}>{row.slipNo}</TableCell>
                  <TableCell sx={cellSx}>{row.date}</TableCell>
                  <TableCell sx={cellSx}>
                    <Chip label={row.type} size="small" variant="outlined" sx={{ fontSize: '0.72rem', height: 20 }} />
                  </TableCell>
                  <TableCell sx={cellSx}>{row.productCode}</TableCell>
                  <TableCell sx={cellSx}>{row.productName}</TableCell>
                  <TableCell sx={{ ...cellSx, textAlign: 'right', fontWeight: 700, color: row.quantity < 0 ? 'error.main' : 'text.primary' }}>
                    {row.quantity > 0 ? `+${row.quantity}` : row.quantity}
                  </TableCell>
                  <TableCell sx={{ ...cellSx, textAlign: 'right' }}>
                    {row.amount > 0 ? `¥${row.amount.toLocaleString()}` : 'ー'}
                  </TableCell>
                  <TableCell sx={cellSx}>{row.operator}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  )
}
