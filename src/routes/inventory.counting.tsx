import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import Alert from '@mui/material/Alert'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Chip from '@mui/material/Chip'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import IconButton from '@mui/material/IconButton'
import InputAdornment from '@mui/material/InputAdornment'
import OutlinedInput from '@mui/material/OutlinedInput'
import Snackbar from '@mui/material/Snackbar'
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
import EditIcon from '@mui/icons-material/Edit'
import PlayArrowIcon from '@mui/icons-material/PlayArrow'
import { useTranslation } from 'react-i18next'
import { useLayoutConfig } from '../hooks/useLayoutConfig'

export const Route = createFileRoute('/inventory/counting')({
  component: InventoryCountingPage,
})

interface ProductRow {
  id: number
  productCode: string
  productName: string
  quantity: number
  subCategory: string
  operator: string
}

const MOCK_PRODUCTS_BY_SHELF: Record<string, ProductRow[]> = {
  '001-01': [
    { id: 1, productCode: '1234567', productName: 'レ_カーディガン', quantity: 3, subCategory: '01衣料', operator: '田中' },
    { id: 2, productCode: '1234568', productName: 'レ_ブラウス', quantity: 1, subCategory: '01衣料', operator: '田中' },
  ],
  '002-03': [
    { id: 3, productCode: '7654321', productName: 'メ_スラックス', quantity: 2, subCategory: '02服飾', operator: '鈴木' },
  ],
}

function InventoryCountingPage() {
  const { t } = useTranslation()
  const [shelfInput, setShelfInput] = useState('')
  const [currentShelf, setCurrentShelf] = useState<string | null>(null)
  const [rows, setRows] = useState<ProductRow[]>([])
  const [correctDialog, setCorrectDialog] = useState<{ open: boolean; row: ProductRow | null }>({ open: false, row: null })
  const [newQty, setNewQty] = useState('')
  const [toast, setToast] = useState({ open: false, message: '' })

  useLayoutConfig({
    title: t('page.tanazaoroshi.counting.title'),
    actions: [
      {
        key: 'correct',
        labelKey: 'page.tanazaoroshi.counting.action.correct',
        position: 'left',
        variant: 'outlined',
        color: 'inherit',
        startIcon: <EditIcon fontSize="small" />,
        disabled: rows.length === 0,
        onClick: () => {},
      },
      {
        key: 'run',
        labelKey: 'page.tanazaoroshi.counting.action.run',
        position: 'right',
        variant: 'contained',
        color: 'success',
        startIcon: <PlayArrowIcon fontSize="small" />,
        disabled: rows.length === 0,
        onClick: () => {
          setRows([])
          setCurrentShelf(null)
          setToast({ open: true, message: t('page.tanazaoroshi.counting.toast.saved') })
        },
      },
    ],
  })

  const handleShelfSearch = () => {
    const shelf = shelfInput.trim()
    if (!shelf) return
    setCurrentShelf(shelf)
    setRows(MOCK_PRODUCTS_BY_SHELF[shelf] ?? [])
    setShelfInput('')
  }

  const handleOpenCorrect = (row: ProductRow) => {
    setCorrectDialog({ open: true, row })
    setNewQty(String(row.quantity))
  }

  const handleSaveCorrect = () => {
    if (!correctDialog.row) return
    const qty = parseInt(newQty, 10)
    if (isNaN(qty) || qty < 0) return
    setRows((prev) => prev.map((r) => r.id === correctDialog.row!.id ? { ...r, quantity: qty } : r))
    setCorrectDialog({ open: false, row: null })
  }

  const headerSx = {
    fontSize: '0.75rem', fontWeight: 600, color: 'text.secondary',
    py: 0.75, px: 1.5, whiteSpace: 'nowrap' as const,
    bgcolor: 'background.paper', borderBottom: '2px solid', borderColor: 'divider',
  }
  const cellSx = { fontSize: '0.82rem', py: 0.75, px: 1.5, whiteSpace: 'nowrap' as const }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, height: '100%' }}>
      {/* Shelf input */}
      <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
        <OutlinedInput
          size="small"
          value={shelfInput}
          onChange={(e) => setShelfInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleShelfSearch()}
          placeholder={t('page.tanazaoroshi.counting.shelfPlaceholder')}
          startAdornment={
            <InputAdornment position="start">
              <QrCodeScannerIcon fontSize="small" sx={{ color: 'text.secondary' }} />
            </InputAdornment>
          }
          endAdornment={
            shelfInput ? (
              <InputAdornment position="end">
                <IconButton size="small" onClick={() => setShelfInput('')}>
                  <ClearIcon fontSize="small" />
                </IconButton>
              </InputAdornment>
            ) : null
          }
          sx={{ width: 280 }}
        />
        <Button variant="contained" size="small" onClick={handleShelfSearch} disabled={!shelfInput.trim()}>
          {t('action.search')}
        </Button>
        {currentShelf && (
          <Chip
            label={`棚番：${currentShelf}`}
            size="small"
            color="primary"
            variant="outlined"
          />
        )}
      </Box>

      {/* Product table */}
      <TableContainer sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 1, flex: 1 }}>
        <Table size="small" stickyHeader>
          <TableHead>
            <TableRow>
              {(['productCode', 'productName', 'subCategory', 'quantity', 'operator'] as const).map((col) => (
                <TableCell key={col} sx={headerSx}>
                  {t(`page.tanazaoroshi.counting.col.${col}`)}
                </TableCell>
              ))}
              <TableCell sx={headerSx} />
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} align="center" sx={{ py: 4, color: 'text.secondary', fontSize: '0.82rem' }}>
                  {currentShelf ? 'この棚番にスキャンデータはありません' : '棚番を入力してください'}
                </TableCell>
              </TableRow>
            ) : (
              rows.map((row) => (
                <TableRow key={row.id} hover>
                  <TableCell sx={cellSx}>{row.productCode}</TableCell>
                  <TableCell sx={cellSx}>{row.productName}</TableCell>
                  <TableCell sx={cellSx}>{row.subCategory}</TableCell>
                  <TableCell sx={{ ...cellSx, fontWeight: 700 }}>{row.quantity}</TableCell>
                  <TableCell sx={cellSx}>{row.operator}</TableCell>
                  <TableCell sx={{ py: 0.5, px: 0.5, textAlign: 'center' }}>
                    <IconButton size="small" onClick={() => handleOpenCorrect(row)}>
                      <EditIcon fontSize="small" sx={{ color: 'text.secondary' }} />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Correct quantity dialog */}
      <Dialog open={correctDialog.open} onClose={() => setCorrectDialog({ open: false, row: null })} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 700, fontSize: '1rem' }}>
          {t('page.tanazaoroshi.counting.dialog.correctTitle')}
        </DialogTitle>
        <DialogContent sx={{ pt: '12px !important' }}>
          <Typography sx={{ fontSize: '0.82rem', color: 'text.secondary', mb: 1 }}>
            {correctDialog.row?.productName}（{correctDialog.row?.productCode}）
          </Typography>
          <TextField
            label={t('page.tanazaoroshi.counting.dialog.quantity')}
            size="small"
            type="number"
            value={newQty}
            onChange={(e) => setNewQty(e.target.value)}
            fullWidth
            autoFocus
            onKeyDown={(e) => e.key === 'Enter' && handleSaveCorrect()}
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setCorrectDialog({ open: false, row: null })} color="inherit">
            {t('page.tanazaoroshi.counting.dialog.cancel')}
          </Button>
          <Button onClick={handleSaveCorrect} variant="contained">
            {t('page.tanazaoroshi.counting.dialog.save')}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={toast.open}
        autoHideDuration={3000}
        onClose={() => setToast((p) => ({ ...p, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
      >
        <Alert severity="success" variant="filled" sx={{ fontSize: '0.85rem' }}>
          {toast.message}
        </Alert>
      </Snackbar>
    </Box>
  )
}
