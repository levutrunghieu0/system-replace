import { createFileRoute } from '@tanstack/react-router'
import { useState, useMemo } from 'react'
import type { ColumnDef } from '@tanstack/react-table'
import Alert from '@mui/material/Alert'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Chip from '@mui/material/Chip'
import Divider from '@mui/material/Divider'
import IconButton from '@mui/material/IconButton'
import InputAdornment from '@mui/material/InputAdornment'
import Paper from '@mui/material/Paper'
import Snackbar from '@mui/material/Snackbar'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import DeleteOutlinedIcon from '@mui/icons-material/DeleteOutlined'
import PrintIcon from '@mui/icons-material/Print'
import QrCodeScannerIcon from '@mui/icons-material/QrCodeScanner'
import { useTranslation } from 'react-i18next'
import { AppTable } from '../components/table'
import { AppModal } from '../components/common/AppModal'
import { InventorySetupTabBar } from '../components/common/InventorySetupTabBar'
import { useLayoutConfig } from '../hooks/useLayoutConfig'

export const Route = createFileRoute('/inventory/shelf-registration')({
  component: ShelfRegistrationPage,
})

type ActionMode = 'none' | 'excludeRegister' | 'excludeRelease'

interface ExcludedShelf {
  id: number
  number: string
}

function ShelfRegistrationPage() {
  const { t } = useTranslation()
  const [shelfFrom, setShelfFrom] = useState('')
  const [shelfTo, setShelfTo] = useState('')
  const [levelFrom, setLevelFrom] = useState('')
  const [levelTo, setLevelTo] = useState('')
  const [registeredStart, setRegisteredStart] = useState<string | null>(null)
  const [registeredEnd, setRegisteredEnd] = useState<string | null>(null)
  const [actionMode, setActionMode] = useState<ActionMode>('none')
  const [excluded, setExcluded] = useState<ExcludedShelf[]>([
    { id: 1, number: '005-01' },
    { id: 2, number: '100-05' },
  ])
  const [scanInput, setScanInput] = useState('')
  const [initDialog, setInitDialog] = useState(false)
  const [toast, setToast] = useState({ open: false, message: '', severity: 'success' as 'success' | 'info' })

  useLayoutConfig({
    title: t('page.tanazaoroshi.shelfRegistration.title'),
    actions: [
      {
        key: 'print',
        labelKey: 'page.warehouse.list.action.print',
        position: 'right',
        variant: 'outlined',
        color: 'inherit',
        startIcon: <PrintIcon fontSize="small" />,
        onClick: () => setToast({ open: true, message: t('page.tanazaoroshi.shelfRegistration.toast.printing'), severity: 'info' }),
      },
    ],
  })

  const handleRegister = () => {
    if (!shelfFrom || !shelfTo) return
    setRegisteredStart(shelfFrom)
    setRegisteredEnd(shelfTo)
    setToast({ open: true, message: t('page.tanazaoroshi.shelfRegistration.toast.registered'), severity: 'success' })
    setActionMode('none')
  }

  const handleExcludeToggle = (mode: 'excludeRegister' | 'excludeRelease') => {
    setActionMode((prev) => (prev === mode ? 'none' : mode))
  }

  const handleShelfScan = () => {
    const num = scanInput.trim()
    if (!num) return
    if (actionMode === 'excludeRegister') {
      setExcluded((prev) => [...prev, { id: Date.now(), number: num }])
      setToast({ open: true, message: t('page.tanazaoroshi.shelfRegistration.toast.excluded'), severity: 'success' })
    } else if (actionMode === 'excludeRelease') {
      setExcluded((prev) => prev.filter((e) => e.number !== num))
      setToast({ open: true, message: t('page.tanazaoroshi.shelfRegistration.toast.released'), severity: 'success' })
    }
    setScanInput('')
    setActionMode('none')
  }

  const handleInitialize = () => {
    setShelfFrom('')
    setShelfTo('')
    setLevelFrom('')
    setLevelTo('')
    setRegisteredStart(null)
    setRegisteredEnd(null)
    setExcluded([])
    setInitDialog(false)
    setToast({ open: true, message: '初期化しました。', severity: 'info' })
  }

  const excludedColumns = useMemo<ColumnDef<ExcludedShelf>[]>(() => [
    {
      accessorKey: 'number',
      header: t('page.tanazaoroshi.shelfRegistration.excludedList'),
      meta: { headerSx: { fontSize: '0.75rem', fontWeight: 600, color: 'text.secondary', py: 0.5, px: 1.5 }, cellSx: { fontSize: '0.82rem', py: 0.5, px: 1.5 } },
    },
    {
      id: 'delete',
      header: '',
      size: 40,
      cell: ({ row }) => (
        <IconButton size="small" onClick={() => setExcluded((prev) => prev.filter((x) => x.id !== row.original.id))}>
          <DeleteOutlinedIcon fontSize="small" sx={{ color: 'text.disabled' }} />
        </IconButton>
      ),
      meta: { cellSx: { py: 0.5, px: 0.5, textAlign: 'center' } },
    },
  ], [t])

  const sectionTitleSx = { fontWeight: 700, fontSize: '0.85rem', color: 'text.primary', mb: 1 }
  const labelSx = { fontSize: '0.8rem', color: 'text.secondary', width: 56, flexShrink: 0 }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <InventorySetupTabBar activeTab="shelf" />

      <Box sx={{ flex: 1, overflow: 'auto', display: 'flex', flexDirection: 'column', gap: 2 }}>
      {/* Action mode indicator */}
      {actionMode !== 'none' && (
        <Alert severity="info" sx={{ fontSize: '0.82rem' }}>
          {actionMode === 'excludeRegister'
            ? '除外登録モード：棚番をスキャンして除外番号として登録します'
            : '除外解除モード：解除したい棚番をスキャンしてください'}
        </Alert>
      )}

      <Paper variant="outlined" sx={{ p: 2 }}>
        <Typography sx={sectionTitleSx}>{t('page.tanazaoroshi.shelfRegistration.rangeSection')}</Typography>

        {/* Shelf No range */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
          <Typography sx={labelSx}>{t('page.tanazaoroshi.shelfRegistration.shelfNo')}</Typography>
          <TextField
            size="small"
            placeholder={t('page.tanazaoroshi.shelfRegistration.from')}
            value={shelfFrom}
            onChange={(e) => setShelfFrom(e.target.value)}
            sx={{ width: 100 }}
          />
          <Typography sx={{ fontSize: '0.8rem', color: 'text.secondary' }}>〜</Typography>
          <TextField
            size="small"
            placeholder={t('page.tanazaoroshi.shelfRegistration.to')}
            value={shelfTo}
            onChange={(e) => setShelfTo(e.target.value)}
            sx={{ width: 100 }}
          />
        </Box>

        {/* Level No range */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
          <Typography sx={labelSx}>{t('page.tanazaoroshi.shelfRegistration.shelfLevel')}</Typography>
          <TextField
            size="small"
            placeholder={t('page.tanazaoroshi.shelfRegistration.from')}
            value={levelFrom}
            onChange={(e) => setLevelFrom(e.target.value)}
            sx={{ width: 100 }}
          />
          <Typography sx={{ fontSize: '0.8rem', color: 'text.secondary' }}>〜</Typography>
          <TextField
            size="small"
            placeholder={t('page.tanazaoroshi.shelfRegistration.to')}
            value={levelTo}
            onChange={(e) => setLevelTo(e.target.value)}
            sx={{ width: 100 }}
          />
        </Box>

        {/* Registered range display */}
        {registeredStart && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
            <Typography sx={{ fontSize: '0.8rem', color: 'text.secondary' }}>
              {t('page.tanazaoroshi.shelfRegistration.registered')}：
            </Typography>
            <Chip label={`${registeredStart} 〜 ${registeredEnd}`} size="small" color="primary" variant="outlined" />
          </Box>
        )}

        <Divider sx={{ my: 1.5 }} />

        {/* Excluded shelves section */}
        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
          <Box sx={{ flex: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
              <Typography sx={{ ...sectionTitleSx, mb: 0 }}>
                {t('page.tanazaoroshi.shelfRegistration.excluded')}
              </Typography>
              <Typography sx={{ fontSize: '0.78rem', color: 'text.secondary' }}>
                {t('page.tanazaoroshi.shelfRegistration.excludedCount')}：{excluded.length}　
                {t('page.tanazaoroshi.shelfRegistration.excludedTarget')}：
                {registeredStart ? `${registeredStart}～${registeredEnd}` : 'ー'}
              </Typography>
            </Box>
            <AppTable<ExcludedShelf>
              data={excluded}
              columns={excludedColumns}
              getRowId={(row) => String(row.id)}
              stickyHeader
              containerMaxHeight={160}
              dense
              emptyMessage="除外棚番なし"
            />
          </Box>
        </Box>
      </Paper>

      {/* Scan input in action mode */}
      {actionMode !== 'none' && (
        <Box sx={{ display: 'flex', gap: 1 }}>
          <TextField
            size="small"
            autoFocus
            value={scanInput}
            onChange={(e) => setScanInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleShelfScan()}
            placeholder="棚番をスキャンまたは入力"
            slotProps={{ input: { startAdornment: <InputAdornment position="start"><QrCodeScannerIcon fontSize="small" sx={{ color: 'text.secondary' }} /></InputAdornment> } }}
            sx={{ width: 280 }}
          />
          <Button variant="contained" size="small" onClick={handleShelfScan} disabled={!scanInput.trim()}>
            確定
          </Button>
        </Box>
      )}

      {/* Action buttons */}
      <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
        <Button variant="contained" size="small" onClick={handleRegister} disabled={!shelfFrom || !shelfTo}>
          {t('page.tanazaoroshi.shelfRegistration.action.register')}
        </Button>
        <Button
          variant={actionMode === 'excludeRegister' ? 'contained' : 'outlined'}
          color={actionMode === 'excludeRegister' ? 'warning' : 'inherit'}
          size="small"
          onClick={() => handleExcludeToggle('excludeRegister')}
        >
          {t('page.tanazaoroshi.shelfRegistration.action.excludeRegister')}
        </Button>
        <Button
          variant={actionMode === 'excludeRelease' ? 'contained' : 'outlined'}
          color={actionMode === 'excludeRelease' ? 'info' : 'inherit'}
          size="small"
          onClick={() => handleExcludeToggle('excludeRelease')}
        >
          {t('page.tanazaoroshi.shelfRegistration.action.excludeRelease')}
        </Button>
        <Button variant="outlined" color="error" size="small" onClick={() => setInitDialog(true)}>
          {t('page.tanazaoroshi.shelfRegistration.action.initialize')}
        </Button>
      </Box>

      {/* Initialize confirm dialog */}
      <AppModal
        open={initDialog}
        onClose={() => setInitDialog(false)}
        title={t('page.tanazaoroshi.shelfRegistration.action.initialize')}
        actions={[
          { label: t('page.tanazaoroshi.shelfRegistration.dialog.no'), onClick: () => setInitDialog(false), color: 'inherit' },
          { label: t('page.tanazaoroshi.shelfRegistration.dialog.yes'), onClick: handleInitialize, variant: 'contained', color: 'error' },
        ]}
      >
        <Typography sx={{ fontSize: '0.9rem' }}>
          {t('page.tanazaoroshi.shelfRegistration.dialog.initConfirm')}
        </Typography>
      </AppModal>

      <Snackbar
        open={toast.open}
        autoHideDuration={3000}
        onClose={() => setToast((p) => ({ ...p, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
      >
        <Alert severity={toast.severity} variant="filled" sx={{ fontSize: '0.85rem' }}>
          {toast.message}
        </Alert>
      </Snackbar>
      </Box>
    </Box>
  )
}
