import { createFileRoute, useRouter } from '@tanstack/react-router'
import { useRef, useState } from 'react'
import Box from '@mui/material/Box'
import Chip from '@mui/material/Chip'
import FormControl from '@mui/material/FormControl'
import FormControlLabel from '@mui/material/FormControlLabel'
import FormLabel from '@mui/material/FormLabel'
import IconButton from '@mui/material/IconButton'
import InputAdornment from '@mui/material/InputAdornment'
import InputBase from '@mui/material/InputBase'
import MenuItem from '@mui/material/MenuItem'
import Radio from '@mui/material/Radio'
import RadioGroup from '@mui/material/RadioGroup'
import Select from '@mui/material/Select'
import Snackbar from '@mui/material/Snackbar'
import Alert from '@mui/material/Alert'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import BlockIcon from '@mui/icons-material/Block'
import ClearIcon from '@mui/icons-material/Clear'
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutlined'
import EditIcon from '@mui/icons-material/Edit'
import PlayArrowIcon from '@mui/icons-material/PlayArrow'
import { useTranslation } from 'react-i18next'
import { useLayoutConfig } from '../hooks/useLayoutConfig'
import AppModal from '../components/AppModal'
import { AppTableContainer, AppTableEmpty } from '../components/table'

export const Route = createFileRoute('/warehouse/transfer-out')({
  component: TransferOutPage,
})

// ─── Types ────────────────────────────────────────────────────────────────────

type ProcessMode = 'transfer' | 'slip'
type ItemType = 'reuse' | 'semi' | 'gross'

interface ShipItem {
  id: string
  no: number
  code: string
  maker: string
  productName: string
  size: string
  type: ItemType
  condition: string
  unitPrice: number
  lastUpdated: string
  qty: number
}

interface SessionInfo {
  mode: ProcessMode
  business: string
  instructionNo: string
  supplierCode: string
}

// ─── Constants ────────────────────────────────────────────────────────────────

const BUSINESS_OPTIONS = [
  '一般出荷',
  '店間移動',
  '倉庫移動',
  '本社移動',
  '廃棄処理',
  '不良品返品',
  '展示品出荷',
  '本部指示',
]

const CONDITIONS = ['S', 'A', 'B', 'C', 'D']

const RAND_TYPES: ItemType[] = ['reuse', 'reuse', 'reuse', 'semi', 'gross']
const RAND_MAKERS = ['RED WING', 'NIKE', 'ADIDAS', 'NEW BALANCE', 'CONVERSE', 'VANS']
const RAND_PRODUCTS = [
  'PLAIN TOE/プレーントウ',
  'AIR MAX/エアマックス',
  'STAN SMITH/スタンスミス',
  'OLD SKOOL/オールドスクール',
  'CLASSIC LEATHER/クラシックレザー',
  'CHUCK TAYLOR/チャックテイラー',
]
const RAND_SIZES = ['S', 'M', 'L', 'XL', 'US9.5', '26.0cm', '25.5cm']
const RAND_PRICES = [4900, 7900, 9900, 12900, 19900, 24900]

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

function generateItem(code: string, no: number): ShipItem {
  const type = pick(RAND_TYPES)
  return {
    id: `${code}-${Date.now()}`,
    no,
    code,
    maker: pick(RAND_MAKERS),
    productName: pick(RAND_PRODUCTS),
    size: pick(RAND_SIZES),
    type,
    condition: type === 'reuse' ? 'A' : '−',
    unitPrice: pick(RAND_PRICES),
    lastUpdated: '2026/02/25',
    qty: 1,
  }
}

// ─── Type chip ────────────────────────────────────────────────────────────────

function TypeChip({ type }: { type: ItemType }) {
  const { t } = useTranslation()
  const colorMap: Record<ItemType, { bg: string; color: string }> = {
    reuse: { bg: '#ede7f6', color: '#7b1fa2' },
    semi:  { bg: '#fff3e0', color: '#e65100' },
    gross: { bg: '#e8f5e9', color: '#2e7d32' },
  }
  const { bg, color } = colorMap[type]
  return (
    <Chip
      label={t(`page.transferOut.type.${type}` as Parameters<typeof t>[0])}
      size="small"
      sx={{ bgcolor: bg, color, fontWeight: 600, fontSize: '0.72rem', height: 20, borderRadius: '4px' }}
    />
  )
}

// ─── Setup dialog ─────────────────────────────────────────────────────────────

function SetupDialog({
  open,
  onCancel,
  onConfirm,
}: {
  open: boolean
  onCancel: () => void
  onConfirm: (info: SessionInfo) => void
}) {
  const { t } = useTranslation()
  const [mode, setMode] = useState<ProcessMode>('transfer')
  const [business, setBusiness] = useState('')
  const [instructionNo, setInstructionNo] = useState('')
  const [supplierCode, setSupplierCode] = useState('')

  const isHQ = business === '本部指示'
  const canRun = business !== '' && supplierCode.trim() !== '' && (!isHQ || instructionNo.trim() !== '')

  return (
    <AppModal
      open={open}
      title={t('page.transferOut.dialog.title')}
      cancelLabel={t('action.cancel')}
      confirmLabel={t('action.run')}
      onCancel={onCancel}
      onConfirm={() => onConfirm({ mode, business, instructionNo, supplierCode: supplierCode.trim() })}
      confirmDisabled={!canRun}
      disableBackdropClose
      contentSx={{ display: 'flex', flexDirection: 'column', gap: 2 }}
    >
      <FormControl>
        <FormLabel sx={{ fontSize: '0.8rem', mb: 0.5 }}>
          {t('page.transferOut.dialog.modeLabel')}
        </FormLabel>
        <RadioGroup row value={mode} onChange={e => setMode(e.target.value as ProcessMode)}>
          <FormControlLabel
            value="transfer"
            control={<Radio size="small" />}
            label={<Typography sx={{ fontSize: '0.875rem' }}>{t('page.transferOut.dialog.modeTransfer')}</Typography>}
          />
          <FormControlLabel
            value="slip"
            control={<Radio size="small" />}
            label={<Typography sx={{ fontSize: '0.875rem' }}>{t('page.transferOut.dialog.modeSlip')}</Typography>}
          />
        </RadioGroup>
      </FormControl>

      <FormControl fullWidth size="small">
        <FormLabel sx={{ fontSize: '0.8rem', mb: 0.5 }}>
          {t('page.transferOut.dialog.businessLabel')}
        </FormLabel>
        <Select
          value={business}
          onChange={e => {
            setBusiness(e.target.value)
            if (e.target.value !== '本部指示') setInstructionNo('')
          }}
          displayEmpty
          sx={{ fontSize: '0.875rem' }}
        >
          <MenuItem value="" disabled sx={{ fontSize: '0.875rem', color: 'text.disabled' }}>
            {t('page.transferOut.dialog.businessPlaceholder')}
          </MenuItem>
          {BUSINESS_OPTIONS.map(opt => (
            <MenuItem key={opt} value={opt} sx={{ fontSize: '0.875rem' }}>{opt}</MenuItem>
          ))}
        </Select>
      </FormControl>

      {isHQ && (
        <TextField
          size="small"
          label={t('page.transferOut.dialog.instructionNoLabel')}
          value={instructionNo}
          onChange={e => setInstructionNo(e.target.value)}
          autoFocus
          slotProps={{ htmlInput: { style: { fontSize: '0.875rem' } } }}
        />
      )}

      <TextField
        size="small"
        label={t('page.transferOut.dialog.supplierCodeLabel')}
        value={supplierCode}
        onChange={e => setSupplierCode(e.target.value)}
        slotProps={{
          htmlInput: { style: { fontSize: '0.875rem' } },
          input: {
            endAdornment: supplierCode ? (
              <InputAdornment position="end">
                <IconButton size="small" onClick={() => setSupplierCode('')}>
                  <ClearIcon fontSize="small" />
                </IconButton>
              </InputAdornment>
            ) : undefined,
          },
        }}
      />
    </AppModal>
  )
}

// ─── Session info bar ─────────────────────────────────────────────────────────

function SessionInfoBar({
  info,
  itemCount,
  totalAmount,
}: {
  info: SessionInfo
  itemCount: number
  totalAmount: number
}) {
  const { t } = useTranslation()

  const infoItems = [
    { key: 'business', value: info.business + (info.instructionNo ? ` (${info.instructionNo})` : '') },
    { key: 'supplierCode', value: info.supplierCode },
    { key: 'totalQuantity', value: `${itemCount}` },
    { key: 'totalAmount', value: `¥${totalAmount.toLocaleString()}` },
  ] as const

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        px: 2,
        py: 0.75,
        borderBottom: '1px solid',
        borderColor: 'divider',
        bgcolor: 'grey.50',
        flexWrap: 'wrap',
        gap: 2,
        flexShrink: 0,
      }}
    >
      {infoItems.map(({ key, value }) => (
        <Typography key={key} sx={{ fontSize: '0.78rem', whiteSpace: 'nowrap' }}>
          <Box component="span" sx={{ color: 'text.secondary', mr: 0.5 }}>
            {t(`page.transferOut.info.${key}` as Parameters<typeof t>[0])}：
          </Box>
          <Box component="span" sx={{ fontWeight: 600, color: 'text.primary' }}>{value}</Box>
        </Typography>
      ))}
    </Box>
  )
}

// ─── Correction dialog ────────────────────────────────────────────────────────

function CorrectDialog({
  open,
  items,
  onClose,
  onDelete,
}: {
  open: boolean
  items: ShipItem[]
  onClose: () => void
  onDelete: (id: string) => void
}) {
  const { t } = useTranslation()

  return (
    <AppModal
      open={open}
      title={t('page.transferOut.correct.title')}
      maxWidth="sm"
      cancelLabel={t('action.cancel')}
      onCancel={onClose}
      dividers={items.length > 0}
      contentSx={items.length === 0 ? undefined : { p: 0 }}
    >
      {items.length === 0 ? (
        <Typography sx={{ fontSize: '0.875rem', color: 'text.secondary' }}>
          {t('page.transferOut.correct.empty')}
        </Typography>
      ) : (
        <Table size="small">
          <TableBody>
            {items.map(item => (
              <TableRow key={item.id} hover>
                <TableCell sx={{ fontSize: '0.82rem', color: 'text.secondary', width: 40, pl: 2 }}>
                  {item.no}
                </TableCell>
                <TableCell sx={{ fontSize: '0.82rem', fontFamily: 'monospace' }}>
                  {item.code}
                </TableCell>
                <TableCell sx={{ fontSize: '0.82rem' }}>
                  {item.productName}
                </TableCell>
                <TableCell sx={{ fontSize: '0.82rem', color: 'text.secondary' }}>
                  {item.size}
                </TableCell>
                <TableCell sx={{ width: 48, pr: 1.5, textAlign: 'right' }}>
                  <IconButton size="small" color="error" onClick={() => onDelete(item.id)} sx={{ p: 0.25 }}>
                    <DeleteOutlineIcon fontSize="small" />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </AppModal>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

function TransferOutPage() {
  const router = useRouter()
  const { t } = useTranslation()
  const inputRef = useRef<HTMLInputElement>(null)

  const [setupOpen, setSetupOpen] = useState(true)
  const [sessionInfo, setSessionInfo] = useState<SessionInfo | null>(null)
  const [items, setItems] = useState<ShipItem[]>([])
  const [codeInput, setCodeInput] = useState('')
  const [correctOpen, setCorrectOpen] = useState(false)
  const [completeOpen, setCompleteOpen] = useState(false)
  const [toast, setToast] = useState<{ open: boolean; severity: 'success' | 'info'; message: string }>({
    open: false, severity: 'info', message: '',
  })

  const hasItems = items.length > 0
  const totalAmount = items.reduce((sum, i) => sum + i.unitPrice * i.qty, 0)

  const handleSetupConfirm = (info: SessionInfo) => {
    setSessionInfo(info)
    setSetupOpen(false)
    setTimeout(() => inputRef.current?.focus(), 50)
  }

  const handleSetupCancel = () => {
    router.history.back()
  }

  const handleScan = () => {
    const code = codeInput.trim()
    if (!code) return
    setItems(prev => [...prev, generateItem(code, prev.length + 1)])
    setCodeInput('')
    setTimeout(() => inputRef.current?.focus(), 0)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') handleScan()
  }

  const handleDeleteItem = (id: string) => {
    setItems(prev => {
      const next = prev.filter(i => i.id !== id)
      return next.map((item, idx) => ({ ...item, no: idx + 1 }))
    })
  }

  const handleStop = () => router.history.back()

  const handleRun = () => {
    setToast({ open: true, severity: 'info', message: t('page.transferOut.toast.processing') })
    setTimeout(() => {
      setToast({ open: true, severity: 'info', message: t('page.transferOut.toast.issuingSlip') })
      setTimeout(() => {
        setItems([])
        setCompleteOpen(true)
      }, 1500)
    }, 1500)
  }

  const handleContinue = () => {
    setCompleteOpen(false)
    setItems([])
    setCodeInput('')
    setSetupOpen(true)
  }

  const handleReturnTop = () => {
    setCompleteOpen(false)
    setItems([])
    setCodeInput('')
    setTimeout(() => inputRef.current?.focus(), 50)
  }

  const updateCondition = (id: string, condition: string) => {
    setItems(prev => prev.map(i => i.id === id ? { ...i, condition } : i))
  }

  useLayoutConfig({
    title: t('page.transferOut.title'),
    hideSecondaryNav: true,
    actions: [
      {
        key: 'correct',
        labelKey: 'page.transferOut.action.correct',
        position: 'left',
        variant: 'outlined',
        color: 'inherit',
        startIcon: <EditIcon fontSize="small" />,
        disabled: !hasItems,
        onClick: () => setCorrectOpen(true),
      },
      {
        key: 'stop',
        labelKey: 'page.transferOut.action.stop',
        position: 'right',
        variant: 'outlined',
        color: 'inherit',
        startIcon: <BlockIcon fontSize="small" />,
        onClick: handleStop,
      },
      {
        key: 'run',
        labelKey: 'page.transferOut.action.run',
        position: 'right',
        variant: 'contained',
        color: 'primary',
        startIcon: <PlayArrowIcon fontSize="small" />,
        disabled: !hasItems,
        onClick: handleRun,
      },
    ],
  })

  const hSx = {
    fontWeight: 700,
    fontSize: '0.78rem',
    color: 'text.secondary',
    bgcolor: 'grey.50',
    whiteSpace: 'nowrap' as const,
    py: 0.75,
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>

      {/* ── Setup dialog ── */}
      <SetupDialog
        open={setupOpen}
        onCancel={handleSetupCancel}
        onConfirm={handleSetupConfirm}
      />

      {/* ── Session info bar ── */}
      {sessionInfo && (
        <SessionInfoBar info={sessionInfo} itemCount={items.length} totalAmount={totalAmount} />
      )}

      {/* ── Table ── */}
      <Box sx={{ flex: 1, minHeight: 0, overflow: 'hidden', '& > .MuiPaper-root': { height: '100%' } }}>
        <AppTableContainer stickyHeader maxHeight="100%">
          <Table size="small" stickyHeader sx={{ tableLayout: 'fixed' }}>
            <TableHead>
              <TableRow>
                <TableCell sx={{ ...hSx, width: 44, textAlign: 'center' }}>
                  {t('page.transferOut.col.no')}
                </TableCell>
                <TableCell sx={hSx}>
                  {t('page.transferOut.col.productInfo')}
                </TableCell>
                <TableCell sx={{ ...hSx, width: 96, textAlign: 'center' }}>
                  {t('page.transferOut.col.type')}
                </TableCell>
                <TableCell sx={{ ...hSx, width: 72, textAlign: 'center' }}>
                  {t('page.transferOut.col.condition')}
                </TableCell>
                <TableCell sx={{ ...hSx, width: 112 }}>
                  {t('page.transferOut.col.code')}
                </TableCell>
                <TableCell sx={{ ...hSx, width: 96, textAlign: 'right' }}>
                  {t('page.transferOut.col.price')}
                </TableCell>
                <TableCell sx={{ ...hSx, width: 52, textAlign: 'right' }}>
                  {t('page.transferOut.col.qty')}
                </TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {/* Scan input row */}
              <TableRow>
                <TableCell colSpan={7} sx={{ py: 0.75 }}>
                  <InputBase
                    inputRef={inputRef}
                    value={codeInput}
                    onChange={e => setCodeInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder={t('page.transferOut.scanPlaceholder')}
                    sx={{
                      width: '100%',
                      fontSize: '0.875rem',
                      '& input': {
                        p: 0,
                        py: 0.25,
                        fontFamily: 'monospace',
                        borderBottom: '1px solid',
                        borderColor: 'primary.main',
                      },
                    }}
                  />
                </TableCell>
              </TableRow>

              {/* Item rows */}
              {items.map(item => {
                const condLocked = item.type === 'gross'
                return (
                  <TableRow key={item.id} hover>
                    <TableCell sx={{ fontSize: '0.82rem', textAlign: 'center', color: 'text.secondary' }}>
                      {item.no}
                    </TableCell>
                    <TableCell sx={{ py: 0.5 }}>
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.2 }}>
                        <Typography sx={{ fontSize: '0.72rem', color: 'text.secondary' }}>{item.maker}</Typography>
                        <Typography sx={{ fontSize: '0.82rem', lineHeight: 1.3 }}>{item.productName}</Typography>
                        <Typography sx={{ fontSize: '0.72rem', color: 'text.secondary' }}>{item.size}</Typography>
                      </Box>
                    </TableCell>
                    <TableCell sx={{ textAlign: 'center', py: 0.5 }}>
                      <TypeChip type={item.type} />
                    </TableCell>
                    <TableCell sx={{ textAlign: 'center', py: 0.5 }}>
                      {condLocked ? (
                        <Typography sx={{ fontSize: '0.82rem', color: 'text.disabled' }}>−</Typography>
                      ) : (
                        <Select
                          size="small"
                          value={item.condition}
                          onChange={e => updateCondition(item.id, e.target.value)}
                          sx={{ fontSize: '0.78rem', height: 24, '& .MuiSelect-select': { py: 0, px: 0.75 } }}
                        >
                          {CONDITIONS.map(c => (
                            <MenuItem key={c} value={c} sx={{ fontSize: '0.82rem' }}>{c}</MenuItem>
                          ))}
                        </Select>
                      )}
                    </TableCell>
                    <TableCell sx={{ fontSize: '0.82rem', fontFamily: 'monospace', whiteSpace: 'nowrap' }}>
                      {item.code}
                    </TableCell>
                    <TableCell sx={{ textAlign: 'right', py: 0.5 }}>
                      <Typography sx={{ fontSize: '0.82rem', fontWeight: 600 }}>
                        ¥{item.unitPrice.toLocaleString()}
                      </Typography>
                      <Typography sx={{ fontSize: '0.68rem', color: 'text.disabled' }}>
                        {item.lastUpdated}
                      </Typography>
                    </TableCell>
                    <TableCell sx={{ fontSize: '0.82rem', textAlign: 'right' }}>
                      {item.qty}
                    </TableCell>
                  </TableRow>
                )
              })}

              {/* Empty state */}
              {!hasItems && (
                <AppTableEmpty columnCount={7} message={t('page.transferOut.emptyHint')} />
              )}
            </TableBody>
          </Table>
        </AppTableContainer>
      </Box>

      {/* ── Correction dialog ── */}
      <CorrectDialog
        open={correctOpen}
        items={items}
        onClose={() => setCorrectOpen(false)}
        onDelete={handleDeleteItem}
      />

      {/* ── Completion dialog ── */}
      <AppModal
        open={completeOpen}
        title={t('page.transferOut.complete.title')}
        cancelLabel={t('page.transferOut.complete.returnTop')}
        confirmLabel={t('page.transferOut.complete.continue')}
        onCancel={handleReturnTop}
        onConfirm={handleContinue}
        confirmAutoFocus
        disableBackdropClose
      >
        <Typography sx={{ fontSize: '0.875rem', color: 'text.secondary' }}>
          {t('page.transferOut.complete.message')}
        </Typography>
      </AppModal>

      <Snackbar
        open={toast.open}
        autoHideDuration={3000}
        onClose={() => setToast(p => ({ ...p, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity={toast.severity} onClose={() => setToast(p => ({ ...p, open: false }))} sx={{ width: '100%' }}>
          {toast.message}
        </Alert>
      </Snackbar>
    </Box>
  )
}
