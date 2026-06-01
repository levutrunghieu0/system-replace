import { createFileRoute } from '@tanstack/react-router'
import { useState, useMemo } from 'react'
import type { ColumnDef } from '@tanstack/react-table'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import IconButton from '@mui/material/IconButton'
import InputAdornment from '@mui/material/InputAdornment'
import OutlinedInput from '@mui/material/OutlinedInput'
import Snackbar from '@mui/material/Snackbar'
import Alert from '@mui/material/Alert'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import QrCodeScannerIcon from '@mui/icons-material/QrCodeScanner'
import ClearIcon from '@mui/icons-material/Clear'
import PlayArrowIcon from '@mui/icons-material/PlayArrow'
import { useTranslation } from 'react-i18next'
import { AppTable } from '../components/table'
import { AppModal } from '../components/common/AppModal'
import { useLayoutConfig } from '../hooks/useLayoutConfig'

export const Route = createFileRoute('/inventory/single')({
  component: SingleInventoryPage,
})

interface ScannedItem {
  id: number
  productCode: string
  productName: string
  differential: number
  subCategory: string
}

const MOCK_PRODUCTS: Record<string, { name: string; subCategory: string }> = {
  '1234567': { name: 'レ_カーディガン', subCategory: '01衣料' },
  '7654321': { name: 'メ_スラックス', subCategory: '02服飾' },
  '1111111': { name: 'レ_ブラウス', subCategory: '01衣料' },
  '2222222': { name: 'メ_ジャケット', subCategory: '02服飾' },
}

function SingleInventoryPage() {
  const { t } = useTranslation()
  const [scanInput, setScanInput] = useState('')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [pendingCode, setPendingCode] = useState('')
  const [differential, setDifferential] = useState('')
  const [items, setItems] = useState<ScannedItem[]>([])
  const [toast, setToast] = useState({ open: false, message: '' })

  useLayoutConfig({
    title: t('page.tanazaoroshi.single.title'),
    actions: [
      {
        key: 'run',
        labelKey: 'page.tanazaoroshi.single.action.run',
        position: 'right',
        variant: 'contained',
        color: 'success',
        startIcon: <PlayArrowIcon fontSize="small" />,
        disabled: items.length === 0,
        onClick: () => {
          setItems([])
          setToast({ open: true, message: t('page.tanazaoroshi.single.toast.completed') })
        },
      },
    ],
  })

  const handleScan = () => {
    const code = scanInput.trim()
    if (!code) return
    setPendingCode(code)
    setDifferential(code.length === 13 ? '-1' : '')
    setDialogOpen(true)
    setScanInput('')
  }

  const handleConfirm = () => {
    const product = MOCK_PRODUCTS[pendingCode] ?? { name: '（不明商品）', subCategory: 'ー' }
    setItems((prev) => [
      ...prev,
      {
        id: Date.now(),
        productCode: pendingCode,
        productName: product.name,
        differential: parseInt(differential || '0', 10),
        subCategory: product.subCategory,
      },
    ])
    setDialogOpen(false)
    setDifferential('')
  }

  const headerSx = {
    fontSize: '0.78rem', fontWeight: 600, color: 'text.secondary',
    py: 1, px: 1.5, whiteSpace: 'nowrap' as const,
    bgcolor: 'background.paper', borderBottom: '2px solid', borderColor: 'divider',
  }
  const cellSx = { fontSize: '0.82rem', py: 0.75, px: 1.5, whiteSpace: 'nowrap' as const }

  const columns = useMemo<ColumnDef<ScannedItem>[]>(() => [
    {
      accessorKey: 'productCode',
      header: t('page.tanazaoroshi.single.col.productCode'),
      meta: { headerSx, cellSx },
    },
    {
      accessorKey: 'productName',
      header: t('page.tanazaoroshi.single.col.productName'),
      meta: { headerSx, cellSx },
    },
    {
      accessorKey: 'subCategory',
      header: t('page.tanazaoroshi.single.col.subCategory'),
      meta: { headerSx, cellSx },
    },
    {
      accessorKey: 'differential',
      header: t('page.tanazaoroshi.single.col.differential'),
      cell: ({ getValue }) => {
        const v = getValue<number>()
        return (
          <Typography sx={{ fontSize: '0.82rem', fontWeight: 700, color: v < 0 ? 'error.main' : v > 0 ? 'success.main' : 'text.primary' }}>
            {v > 0 ? `+${v}` : v}
          </Typography>
        )
      },
      meta: { headerSx, cellSx },
    },
  ], [t])

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, height: '100%' }}>
      {/* Scan input */}
      <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
        <OutlinedInput
          size="small"
          value={scanInput}
          onChange={(e) => setScanInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleScan()}
          placeholder={t('page.tanazaoroshi.single.scanPlaceholder')}
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
          sx={{ width: 320 }}
        />
        <Button variant="contained" size="small" onClick={handleScan} disabled={!scanInput.trim()}>
          {t('action.search')}
        </Button>
      </Box>

      {/* Result table */}
      <AppTable<ScannedItem>
        data={items}
        columns={columns}
        getRowId={(row) => String(row.id)}
        stickyHeader
        containerMaxHeight={440}
        dense
        emptyMessage="商品をスキャンしてください"
      />

      {/* Differential count dialog */}
      <AppModal
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        title={t('page.tanazaoroshi.single.dialog.title')}
        actions={[
          { label: t('page.tanazaoroshi.single.dialog.cancel'), onClick: () => setDialogOpen(false), color: 'inherit' },
          { label: t('page.tanazaoroshi.single.dialog.confirm'), onClick: handleConfirm, variant: 'contained', disabled: differential === '' },
        ]}
      >
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Typography variant="body2" color="text.secondary" sx={{ minWidth: 80 }}>
              {t('page.tanazaoroshi.single.dialog.productCode')}
            </Typography>
            <Typography variant="body2" sx={{ fontWeight: 600 }}>{pendingCode}</Typography>
          </Box>
          {MOCK_PRODUCTS[pendingCode] && (
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Typography variant="body2" color="text.secondary" sx={{ minWidth: 80 }}>
                {t('page.tanazaoroshi.single.dialog.productName')}
              </Typography>
              <Typography variant="body2">{MOCK_PRODUCTS[pendingCode]?.name}</Typography>
            </Box>
          )}
          <TextField
            label={t('page.tanazaoroshi.single.dialog.differentialCount')}
            size="small"
            type="number"
            value={differential}
            onChange={(e) => setDifferential(e.target.value)}
            autoFocus
            onKeyDown={(e) => e.key === 'Enter' && handleConfirm()}
            slotProps={{ input: { readOnly: pendingCode.length === 13 } }}
          />
        </Box>
      </AppModal>

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
