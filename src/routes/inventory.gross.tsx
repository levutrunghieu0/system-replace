import { createFileRoute, useRouter } from '@tanstack/react-router'
import { useMemo, useState } from 'react'
import type { ColumnDef } from '@tanstack/react-table'
import Box from '@mui/material/Box'
import FormLabel from '@mui/material/FormLabel'
import RadioGroup from '@mui/material/RadioGroup'
import FormControlLabel from '@mui/material/FormControlLabel'
import Radio from '@mui/material/Radio'
import Select from '@mui/material/Select'
import MenuItem from '@mui/material/MenuItem'
import Checkbox from '@mui/material/Checkbox'
import Chip from '@mui/material/Chip'
import Typography from '@mui/material/Typography'
import Snackbar from '@mui/material/Snackbar'
import Alert from '@mui/material/Alert'
import CheckIcon from '@mui/icons-material/Check'
import PrintIcon from '@mui/icons-material/Print'
import RestartAltIcon from '@mui/icons-material/RestartAlt'
import PlayArrowIcon from '@mui/icons-material/PlayArrow'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import { useTranslation } from 'react-i18next'
import { useLayoutConfig } from '../hooks/useLayoutConfig'
import { AppTable, AppTableContainer } from '../components/table'
import { QuantityStepper } from '../components/QuantityStepper'
import AppModal from '../components/AppModal'

export const Route = createFileRoute('/inventory/gross')({
  component: GrossInventoryPage,
})

// ─── Constants & types ────────────────────────────────────────────────────────

type InputMethod = 'each' | 'batch' | 'set'
type FunctionType = 'register' | 'history'
type GenderType = 'ladies' | 'mens'
type PageMode = 'modal' | 'each' | 'batch' | 'set' | 'history'

interface ModalConfig {
  functionType: FunctionType
  inputMethod: InputMethod
  salesFloor: string
  salesSubCategory: string
  gender: GenderType
  sellingPrice: string
  priceTypeFixed: string
}

const SALES_FLOORS = [
  '01衣料',
  '02服飾',
  '03キッズ＼衣料',
  '04キッズ＼その他',
  '05生活用品',
  '06家電',
  '07家具',
  '08スポーツ',
  '09ホビー',
  '10楽器',
]
const SALES_SUB_CATEGORIES = ['レ_カットソー_長袖', 'レ_カットソー_半袖', 'レ_シャツ・ブラウス_長袖', 'レ_シャツ・ブラウス_半袖', 'レ_スウェット', 'レ_パーカー', 'レ_ニット', 'レ_カーディガン']
const SELLING_PRICES = ['500', '700', '900', '1300', '1600', '1900', '2300', '2900', '3300']
const PRICE_TYPES = [
  'なし',
  '縦長タグ',
  '横長タグ',
  '縦長シール',
  '横長シール',
  '縦長ショーケースタグ',
  '横長ショーケースタグ',
  '縦長ショーケースシール',
  '横短シール',
]
const PRICE_COLUMNS = [500, 700, 900, 1300, 1600, 1900, 2300, 2900, 3300]
const SET_PRINT_TYPES = PRICE_TYPES.filter(p => p !== 'なし')
const MAX_COUNT = 50

const PRODUCTS_EACH = [
  { code: '01101', name: 'レ_カットソー_長袖' },
  { code: '01102', name: 'レ_カットソー_半袖' },
  { code: '01103', name: 'レ_シャツ・ブラウス_長袖' },
  { code: '01104', name: 'レ_シャツ・ブラウス_半袖' },
  { code: '01105', name: 'レ_スウェット' },
  { code: '01106', name: 'レ_パーカー' },
  { code: '01107', name: 'レ_ニット' },
  { code: '01108', name: 'レ_カーディガン' },
  { code: '01109', name: 'レ_ライトアウター' },
  { code: '01110', name: 'レ_ライトアウター_ロング' },
  { code: '01111', name: 'レ_中綿・ダウンジャケット' },
  { code: '01112', name: 'レ_ヘヴィーアウター' },
]

const PRODUCTS_BATCH = [
  { code: '01101', name: 'レ_カットソー_長袖' },
  { code: '01102', name: 'レ_カットソー_半袖' },
  { code: '01103', name: 'レ_シャツ・ブラウス_長袖' },
  { code: '01104', name: 'レ_シャツ・ブラウス_半袖' },
  { code: '01105', name: 'レ_スウェット' },
  { code: '01106', name: 'レ_パーカー' },
  { code: '01107', name: 'レ_ニット' },
  { code: '01121', name: 'レ_ニット_厚手' },
  { code: '01108', name: 'レ_カーディガン' },
  { code: '01109', name: 'レ_ライトアウター' },
]

// ─── Config Modal ─────────────────────────────────────────────────────────────

interface ConfigModalProps {
  open: boolean
  onConfirm: (config: ModalConfig) => void
  onCancel: () => void
}

function ConfigModal({ open, onConfirm, onCancel }: ConfigModalProps) {
  const { t } = useTranslation()
  const [functionType, setFunctionType] = useState<FunctionType>('register')
  const [inputMethod, setInputMethod] = useState<InputMethod>('each')
  const [salesFloor, setSalesFloor] = useState('01衣料')
  const [salesSubCategory, setSalesSubCategory] = useState(SALES_SUB_CATEGORIES[0])
  const [gender, setGender] = useState<GenderType>('ladies')
  const [sellingPrice, setSellingPrice] = useState('500')
  const [priceTypeFixed, setPriceTypeFixed] = useState('縦長タグ')

  const rowSx = {
    display: 'flex', alignItems: 'center',
    px: 3, py: 1.75,
    borderBottom: '1px solid', borderColor: 'divider',
  }
  const labelSx = { minWidth: 130, fontSize: '0.875rem', color: 'text.primary', flexShrink: 0 }

  return (
    <AppModal
      open={open}
      title={t('page.inventory.gross.modal.title')}
      maxWidth="sm"
      dividers
      disableBackdropClose
      onCancel={onCancel}
      onConfirm={() => onConfirm({ functionType, inputMethod, salesFloor, salesSubCategory, gender, sellingPrice, priceTypeFixed })}
      cancelLabel={t('page.inventory.gross.modal.cancel')}
      confirmLabel={t('page.inventory.gross.modal.run')}
    >
        {/* 機能選択 */}
        <Box sx={{ ...rowSx, ...(functionType === 'history' ? { borderBottom: 'none' } : {}) }}>
          <FormLabel sx={labelSx}>{t('page.inventory.gross.modal.functionType')}</FormLabel>
          <RadioGroup row value={functionType} onChange={e => setFunctionType(e.target.value as FunctionType)}>
            <FormControlLabel value="register" control={<Radio size="small" />} label={<Typography sx={{ fontSize: '0.875rem' }}>{t('page.inventory.gross.modal.fn.register')}</Typography>} />
            <FormControlLabel value="history" control={<Radio size="small" />} label={<Typography sx={{ fontSize: '0.875rem' }}>{t('page.inventory.gross.modal.fn.history')}</Typography>} sx={{ ml: 2 }} />
          </RadioGroup>
        </Box>

        {/* 入力方法 — 登録のみ */}
        {functionType !== 'history' && (
          <Box sx={rowSx}>
            <FormLabel sx={labelSx}>{t('page.inventory.gross.modal.inputMethod')}</FormLabel>
            <RadioGroup row value={inputMethod} onChange={e => setInputMethod(e.target.value as InputMethod)}>
              <FormControlLabel value="each" control={<Radio size="small" />} label={<Typography sx={{ fontSize: '0.875rem' }}>{t('page.inventory.gross.modal.method.each')}</Typography>} />
              <FormControlLabel value="batch" control={<Radio size="small" />} label={<Typography sx={{ fontSize: '0.875rem' }}>{t('page.inventory.gross.modal.method.batch')}</Typography>} sx={{ ml: 2 }} />
              <FormControlLabel value="set" control={<Radio size="small" />} label={<Typography sx={{ fontSize: '0.875rem' }}>{t('page.inventory.gross.modal.method.set')}</Typography>} sx={{ ml: 2 }} />
            </RadioGroup>
          </Box>
        )}

        {/* 売場大分類 — 登録のみ */}
        {functionType !== 'history' && (
          <Box sx={rowSx}>
            <FormLabel sx={labelSx}>{t('page.inventory.gross.modal.salesFloor')}</FormLabel>
            <Select size="small" value={salesFloor} onChange={e => setSalesFloor(e.target.value)} sx={{ flex: 1, fontSize: '0.875rem' }}>
              {SALES_FLOORS.map(f => <MenuItem key={f} value={f} sx={{ fontSize: '0.875rem' }}>{f}</MenuItem>)}
            </Select>
          </Box>
        )}

        {/* 売場中分類 — セット mode only / 登録のみ */}
        {functionType !== 'history' && inputMethod === 'set' && (
          <Box sx={rowSx}>
            <FormLabel sx={labelSx}>{t('page.inventory.gross.modal.salesSubFloor')}</FormLabel>
            <Select size="small" value={salesSubCategory} onChange={e => setSalesSubCategory(e.target.value)} sx={{ flex: 1, fontSize: '0.875rem' }}>
              {SALES_SUB_CATEGORIES.map(s => <MenuItem key={s} value={s} sx={{ fontSize: '0.875rem' }}>{s}</MenuItem>)}
            </Select>
          </Box>
        )}

        {/* 性別 — 都度/まとめ only / 登録のみ */}
        {functionType !== 'history' && inputMethod !== 'set' && (
          <Box sx={rowSx}>
            <FormLabel sx={labelSx}>{t('page.inventory.gross.modal.gender')}</FormLabel>
            <RadioGroup row value={gender} onChange={e => setGender(e.target.value as GenderType)}>
              <FormControlLabel value="ladies" control={<Radio size="small" />} label={<Typography sx={{ fontSize: '0.875rem' }}>{t('page.inventory.gross.modal.genderOpt.ladies')}</Typography>} />
              <FormControlLabel value="mens" control={<Radio size="small" />} label={<Typography sx={{ fontSize: '0.875rem' }}>{t('page.inventory.gross.modal.genderOpt.mens')}</Typography>} sx={{ ml: 2 }} />
            </RadioGroup>
          </Box>
        )}

        {/* 販売価格 — 都度 / セット / 登録のみ */}
        {functionType !== 'history' && (inputMethod === 'each' || inputMethod === 'set') && (
          <Box sx={rowSx}>
            <FormLabel sx={labelSx}>{t('page.inventory.gross.modal.sellingPrice')}</FormLabel>
            <Select size="small" value={sellingPrice} onChange={e => setSellingPrice(e.target.value)} sx={{ flex: 1, fontSize: '0.875rem' }}>
              {SELLING_PRICES.map(p => <MenuItem key={p} value={p} sx={{ fontSize: '0.875rem' }}>{p}</MenuItem>)}
            </Select>
          </Box>
        )}

        {/* プライス種類固定 — 都度: Select / まとめ: text only / 登録のみ */}
        {functionType !== 'history' && inputMethod === 'each' && (
          <Box sx={{ ...rowSx, borderBottom: 'none' }}>
            <FormLabel sx={labelSx}>{t('page.inventory.gross.modal.priceTypeFixed')}</FormLabel>
            <Select size="small" value={priceTypeFixed} onChange={e => setPriceTypeFixed(e.target.value)} sx={{ flex: 1, fontSize: '0.875rem' }}>
              {PRICE_TYPES.map(p => <MenuItem key={p} value={p} sx={{ fontSize: '0.875rem' }}>{p}</MenuItem>)}
            </Select>
          </Box>
        )}
        {functionType !== 'history' && inputMethod === 'batch' && (
          <Box sx={{ ...rowSx, borderBottom: 'none' }}>
            <FormLabel sx={labelSx}>{t('page.inventory.gross.modal.priceTypeFixed')}</FormLabel>
            <Typography sx={{ fontSize: '0.875rem', color: 'text.primary' }}>{priceTypeFixed}</Typography>
          </Box>
        )}
    </AppModal>
  )
}

// ─── Filter chips + counter (shared) ─────────────────────────────────────────

function ConfigChips({ config, totalCount, isOverMax }: { config: ModalConfig; totalCount: number; isOverMax: boolean }) {
  const { t } = useTranslation()
  const genderLabel = config.gender === 'ladies'
    ? t('page.inventory.gross.modal.genderOpt.ladies')
    : t('page.inventory.gross.modal.genderOpt.mens')

  const chips = [
    config.salesFloor,
    ...(config.inputMethod === 'each' ? [config.sellingPrice] : []),
    genderLabel,
    `${config.priceTypeFixed}${t('page.inventory.gross.chip.fixed')}`,
  ]

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, flexWrap: 'wrap', py: 0.5 }}>
      {chips.map(label => (
        <Chip
          key={label}
          icon={<CheckIcon sx={{ fontSize: '0.75rem !important' }} />}
          label={label}
          size="small"
          variant="outlined"
          color="primary"
          sx={{ fontSize: '0.78rem', height: 26 }}
        />
      ))}
      <Box sx={{ flex: 1 }} />
      <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 0.25 }}>
        <Typography sx={{ fontWeight: 700, fontSize: '1.05rem', color: isOverMax ? 'error.main' : 'text.primary', lineHeight: 1 }}>
          {totalCount}
        </Typography>
        <Typography sx={{ fontSize: '0.825rem', color: 'text.secondary' }}>/50</Typography>
      </Box>
    </Box>
  )
}

// ─── Each Mode (都度) ─────────────────────────────────────────────────────────

const EACH_COLS = 4
type EachRow = { products: Array<(typeof PRODUCTS_EACH)[0] | undefined> }

function EachModeContent({ config, onBack }: { config: ModalConfig; onBack: () => void }) {
  const { t } = useTranslation()
  const [quantities, setQuantities] = useState<Record<string, number>>({})
  const [toast, setToast] = useState<{ open: boolean; severity: 'info' | 'error'; message: string }>({ open: false, severity: 'info', message: '' })

  const totalCount = Object.values(quantities).reduce((s, q) => s + q, 0)
  const isOverMax = totalCount > MAX_COUNT

  const handleReset = () => setQuantities({})
  const handleRun = () => {
    if (isOverMax) {
      setToast({ open: true, severity: 'error', message: t('page.inventory.gross.toast.overMax') })
      return
    }
    setToast({ open: true, severity: 'info', message: t('page.inventory.gross.toast.printing') })
  }

  useLayoutConfig({
    title: t('page.inventory.gross.title'),
    showBackButton: true,
    hideSecondaryNav: true,
    onBack,
    actions: [
      { key: 'reset', labelKey: 'page.inventory.gross.action.reset', position: 'left', variant: 'outlined', color: 'inherit', startIcon: <RestartAltIcon fontSize="small" />, onClick: handleReset },
      { key: 'run', labelKey: 'page.inventory.gross.action.run', position: 'left', variant: 'contained', color: 'success', startIcon: <PlayArrowIcon fontSize="small" />, disabled: totalCount < 1, onClick: handleRun },
    ],
  })

  const eachData = useMemo<EachRow[]>(() => {
    const groups: EachRow[] = []
    for (let i = 0; i < PRODUCTS_EACH.length; i += EACH_COLS) {
      groups.push({ products: Array.from({ length: EACH_COLS }, (_, j) => PRODUCTS_EACH[i + j]) })
    }
    return groups
  }, [])

  const eachColumns = useMemo<ColumnDef<EachRow>[]>(() =>
    Array.from({ length: EACH_COLS }).flatMap((_, ci): ColumnDef<EachRow>[] => [
      {
        id: `code-${ci}`,
        header: t('page.inventory.gross.col.code'),
        size: 90,
        meta: {
          headerSx: {
            fontSize: '0.75rem', fontWeight: 700, color: 'text.secondary',
            bgcolor: 'grey.50', py: 1, px: 1.5, whiteSpace: 'nowrap',
          },
          cellSx: {
            fontSize: '0.75rem', fontFamily: 'monospace', color: 'text.disabled',
            px: 1.5, pt: 1, pb: 0, verticalAlign: 'top', width: 90,
          },
        },
        cell: ({ row }) => row.original.products[ci]?.code,
      },
      {
        id: `name-${ci}`,
        header: t('page.inventory.gross.col.category'),
        meta: {
          headerSx: {
            fontSize: '0.75rem', fontWeight: 700, color: 'text.secondary',
            bgcolor: 'grey.50', py: 1, px: 1.5, whiteSpace: 'nowrap',
            ...(ci < EACH_COLS - 1 ? { borderRight: '2px solid', borderColor: 'divider' } : {}),
          },
          cellSx: {
            px: 1.5, pt: 1, pb: 0.75,
            ...(ci < EACH_COLS - 1 ? { borderRight: '2px solid', borderColor: 'divider' } : {}),
          },
        },
        cell: ({ row }) => {
          const p = row.original.products[ci]
          if (!p) return null
          return (
            <Box>
              <Typography sx={{ fontSize: '0.875rem', mb: 0.75 }}>{p.name}</Typography>
              <QuantityStepper
                value={quantities[p.code] ?? 0}
                onChange={(v) => setQuantities((prev) => ({ ...prev, [p.code]: v }))}
              />
            </Box>
          )
        },
      },
    ]),
  [quantities, t])

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, height: '100%' }}>
      <ConfigChips config={config} totalCount={totalCount} isOverMax={isOverMax} />

      <AppTable
        data={eachData}
        columns={eachColumns}
        getRowId={(_, index) => String(index)}
        dense
        stickyHeader
      />

      <Snackbar open={toast.open} autoHideDuration={4000} onClose={() => setToast(p => ({ ...p, open: false }))} anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}>
        <Alert severity={toast.severity} onClose={() => setToast(p => ({ ...p, open: false }))} sx={{ width: '100%' }}>
          {toast.message}
        </Alert>
      </Snackbar>
    </Box>
  )
}

// ─── Print Memo Modal ─────────────────────────────────────────────────────────

function PrintMemoModal({ open, onClose }: { open: boolean; onClose: (executed?: boolean) => void }) {
  const [selected, setSelected] = useState(SET_PRINT_TYPES[0])

  return (
    <AppModal
      open={open}
      title="発行プライス選択"
      dividers
      onCancel={() => onClose(false)}
      onConfirm={() => onClose(true)}
    >
      <RadioGroup value={selected} onChange={e => setSelected(e.target.value)}>
        {SET_PRINT_TYPES.map(type => (
          <Box
            key={type}
            sx={{
              px: 3, py: 0.5,
              borderBottom: '1px solid', borderColor: 'divider',
              '&:last-child': { borderBottom: 'none' },
            }}
          >
            <FormControlLabel
              value={type}
              control={<Radio size="small" />}
              label={<Typography sx={{ fontSize: '0.875rem' }}>{type}</Typography>}
            />
          </Box>
        ))}
      </RadioGroup>
    </AppModal>
  )
}

// ─── Batch Mode (まとめ) ──────────────────────────────────────────────────────

type BatchProduct = (typeof PRODUCTS_BATCH)[0]

function BatchModeContent({ config, onBack }: { config: ModalConfig; onBack: () => void }) {
  const { t } = useTranslation()
  const [quantities, setQuantities] = useState<Record<string, Record<number, number>>>({})
  const [printMemoOpen, setPrintMemoOpen] = useState(false)
  const [toast, setToast] = useState<{ open: boolean; severity: 'info' | 'error'; message: string }>({ open: false, severity: 'info', message: '' })

  const totalCount = Object.values(quantities).reduce(
    (s, pm) => s + Object.values(pm).reduce((ss, q) => ss + q, 0), 0
  )
  const isOverMax = totalCount > MAX_COUNT
  const isRunEnabled = totalCount >= 1

  const getQty = (code: string, price: number) => quantities[code]?.[price] ?? 0

  const setQty = (code: string, price: number, val: number) => {
    const v = Math.max(0, isNaN(val) ? 0 : val)
    setQuantities(prev => ({ ...prev, [code]: { ...(prev[code] ?? {}), [price]: v } }))
  }

  const handleReset = () => setQuantities({})
  const handleRun = () => {
    if (isOverMax) { setToast({ open: true, severity: 'error', message: t('page.inventory.gross.toast.overMax') }); return }
    setPrintMemoOpen(true)
  }
  const handlePrintMemo = () => {
    setToast({ open: true, severity: 'info', message: t('page.inventory.gross.toast.printing') })
  }

  useLayoutConfig({
    title: t('page.inventory.gross.title'),
    showBackButton: true,
    hideSecondaryNav: true,
    onBack,
    actions: [
      { key: 'reset', labelKey: 'page.inventory.gross.action.reset', position: 'left', variant: 'outlined', color: 'inherit', startIcon: <RestartAltIcon fontSize="small" />, onClick: handleReset },
      { key: 'run', labelKey: 'page.inventory.gross.action.run', position: 'left', variant: 'contained', color: 'success', startIcon: <PlayArrowIcon fontSize="small" />, disabled: !isRunEnabled, onClick: handleRun },
      { key: 'printMemo', labelKey: 'page.inventory.gross.action.printMemo', position: 'left', variant: 'outlined', color: 'primary', startIcon: <PrintIcon fontSize="small" />, onClick: handlePrintMemo },
    ],
  })

  const batchColumns = useMemo<ColumnDef<BatchProduct>[]>(() => [
    {
      accessorKey: 'code',
      header: t('page.inventory.gross.col.code'),
      size: 68,
      meta: {
        headerSx: {
          fontSize: '0.78rem', fontWeight: 700, color: 'text.secondary', textAlign: 'center',
          whiteSpace: 'nowrap', position: 'sticky', left: 0, zIndex: 3, bgcolor: 'background.paper',
        },
        cellSx: {
          position: 'sticky', left: 0, zIndex: 2, bgcolor: 'background.paper',
          fontSize: '0.78rem', fontFamily: 'monospace', color: 'text.secondary',
        },
      },
    },
    {
      accessorKey: 'name',
      header: t('page.inventory.gross.col.category'),
      size: 180,
      meta: {
        headerSx: {
          fontSize: '0.78rem', fontWeight: 700, color: 'text.secondary', textAlign: 'center',
          whiteSpace: 'nowrap', position: 'sticky', left: 68, zIndex: 3, bgcolor: 'background.paper',
          borderRight: '2px solid', borderColor: 'divider',
        },
        cellSx: {
          position: 'sticky', left: 68, zIndex: 2, bgcolor: 'background.paper',
          fontSize: '0.8rem', borderRight: '2px solid', borderColor: 'divider',
        },
      },
    },
    ...PRICE_COLUMNS.map((price): ColumnDef<BatchProduct> => ({
      id: `price-${price}`,
      header: price.toLocaleString(),
      size: 80,
      meta: {
        headerSx: { fontSize: '0.78rem', fontWeight: 700, color: 'text.secondary', textAlign: 'center', whiteSpace: 'nowrap' },
        cellSx: { textAlign: 'center', minWidth: 80 },
      },
      cell: ({ row }) => (
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0.5 }}>
          <Typography sx={{ fontSize: '0.7rem', color: 'text.disabled', lineHeight: 1 }}>
            {price.toLocaleString()}
          </Typography>
          <QuantityStepper
            compact
            value={getQty(row.original.code, price)}
            onChange={(v) => setQty(row.original.code, price, v)}
          />
        </Box>
      ),
    })),
  ], [quantities, t])

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, height: '100%' }}>
      <ConfigChips config={config} totalCount={totalCount} isOverMax={isOverMax} />

      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, px: 2, py: 0.75, bgcolor: 'grey.900', borderRadius: 1 }}>
        <Typography sx={{ fontSize: '0.82rem', fontWeight: 700, color: 'white' }}>
          {t('page.inventory.gross.counter.label')}
        </Typography>
        <Typography sx={{ fontSize: '0.875rem', fontWeight: 600, color: isOverMax ? 'error.light' : 'white' }}>
          {totalCount}/{MAX_COUNT}
        </Typography>
      </Box>

      <AppTable data={PRODUCTS_BATCH} columns={batchColumns} dense stickyHeader />

      <PrintMemoModal open={printMemoOpen} onClose={(executed) => {
        setPrintMemoOpen(false)
        if (executed) setToast({ open: true, severity: 'info', message: t('page.inventory.gross.toast.printing') })
      }} />

      <Snackbar open={toast.open} autoHideDuration={4000} onClose={() => setToast(p => ({ ...p, open: false }))} anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}>
        <Alert severity={toast.severity} onClose={() => setToast(p => ({ ...p, open: false }))} sx={{ width: '100%' }}>
          {toast.message}
        </Alert>
      </Snackbar>
    </Box>
  )
}

// ─── Set Mode (セット) ────────────────────────────────────────────────────────

type PrintRow = { type: string }

function SetModeContent({ config, onBack }: { config: ModalConfig; onBack: () => void }) {
  const { t } = useTranslation()
  const [quantities, setQuantities] = useState<Record<string, number>>({})
  const [printMemoOpen, setPrintMemoOpen] = useState(false)
  const [toast, setToast] = useState<{ open: boolean; severity: 'info' | 'error'; message: string }>({ open: false, severity: 'info', message: '' })

  const totalCount = Object.values(quantities).reduce((s, q) => s + q, 0)
  const isOverMax = totalCount > MAX_COUNT

  const handleReset = () => setQuantities({})
  const handleRun = () => {
    if (isOverMax) {
      setToast({ open: true, severity: 'error', message: t('page.inventory.gross.toast.overMax') })
      return
    }
    setPrintMemoOpen(true)
  }

  useLayoutConfig({
    title: t('page.inventory.gross.title'),
    showBackButton: true,
    hideSecondaryNav: true,
    onBack,
    actions: [
      { key: 'reset', labelKey: 'page.inventory.gross.action.reset', position: 'left', variant: 'outlined', color: 'inherit', startIcon: <RestartAltIcon fontSize="small" />, onClick: handleReset },
      { key: 'run', labelKey: 'page.inventory.gross.action.run', position: 'left', variant: 'contained', color: 'success', startIcon: <PlayArrowIcon fontSize="small" />, disabled: totalCount < 1, onClick: handleRun },
    ],
  })

  const chips = [config.salesFloor, config.salesSubCategory, config.sellingPrice]

  const setPrintData = useMemo<PrintRow[]>(() => SET_PRINT_TYPES.map(type => ({ type })), [])

  const setColumns = useMemo<ColumnDef<PrintRow>[]>(() => [
    {
      accessorKey: 'type',
      header: '印刷種類',
      meta: {
        headerSx: { fontWeight: 700, fontSize: '0.82rem', bgcolor: 'grey.50' },
        cellSx: { fontSize: '0.875rem' },
      },
    },
    {
      id: 'qty',
      header: '印刷枚数',
      size: 160,
      meta: {
        headerSx: { fontWeight: 700, fontSize: '0.82rem', bgcolor: 'grey.50', textAlign: 'center', width: 160 },
        cellSx: { textAlign: 'center' },
      },
      cell: ({ row }) => (
        <Box sx={{ display: 'flex', justifyContent: 'center' }}>
          <QuantityStepper
            value={quantities[row.original.type] ?? 0}
            onChange={(v) => setQuantities(prev => ({ ...prev, [row.original.type]: v }))}
          />
        </Box>
      ),
    },
  ], [quantities])

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, height: '100%' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, flexWrap: 'wrap', py: 0.5 }}>
        {chips.map(label => (
          <Chip
            key={label}
            icon={<CheckIcon sx={{ fontSize: '0.75rem !important' }} />}
            label={label}
            size="small"
            variant="outlined"
            color="primary"
            sx={{ fontSize: '0.78rem', height: 26 }}
          />
        ))}
      </Box>

      <Box sx={{ display: 'inline-flex', alignSelf: 'flex-start', border: '1px solid', borderColor: 'divider', borderRadius: 1, px: 1.5, py: 0.4, bgcolor: 'background.paper' }}>
        <Typography sx={{ fontSize: '0.82rem', fontWeight: 600, color: isOverMax ? 'error.main' : 'text.primary' }}>
          商品数：{totalCount}点
        </Typography>
      </Box>

      <AppTable data={setPrintData} columns={setColumns} dense stickyHeader />

      <PrintMemoModal open={printMemoOpen} onClose={(executed) => {
        setPrintMemoOpen(false)
        if (executed) setToast({ open: true, severity: 'info', message: t('page.inventory.gross.toast.printing') })
      }} />

      <Snackbar open={toast.open} autoHideDuration={4000} onClose={() => setToast(p => ({ ...p, open: false }))} anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}>
        <Alert severity={toast.severity} onClose={() => setToast(p => ({ ...p, open: false }))} sx={{ width: '100%' }}>
          {toast.message}
        </Alert>
      </Snackbar>
    </Box>
  )
}

// ─── History Mode (履歴照会) ──────────────────────────────────────────────────

interface HistoryDetail {
  id: string
  janCode: string
  salesFloor: string
  salesSubCategory: string
  sellingPrice: number
}

interface InvoiceGroup {
  invoiceId: string
  datetime: string
  registerNo: string
  productMigration: string
  staffName: string
  details: HistoryDetail[]
}

const HISTORY_GROUPS: InvoiceGroup[] = [
  {
    invoiceId: 'INV-001', datetime: '2025/02/10 21:53:03', registerNo: '90', productMigration: '338', staffName: 'しおたに',
    details: [
      { id: 'h1', janCode: '2320503399714', salesFloor: '01 衣料', salesSubCategory: '01101 レ_カットソー_長袖', sellingPrice: 500 },
      { id: 'h2', janCode: '2320503399578', salesFloor: '01 衣料', salesSubCategory: '01101 レ_カットソー_長袖', sellingPrice: 500 },
      { id: 'h1b', janCode: '2320503399501', salesFloor: '01 衣料', salesSubCategory: '01102 レ_カットソー_半袖', sellingPrice: 700 },
    ],
  },
  {
    invoiceId: 'INV-002', datetime: '2025/02/10 21:39:55', registerNo: '90', productMigration: '338', staffName: 'しおたに',
    details: [
      { id: 'h3', janCode: '2320503399691', salesFloor: '01 衣料', salesSubCategory: '01104 レ_シャツ・ブラウス_半袖', sellingPrice: 500 },
    ],
  },
  {
    invoiceId: 'INV-003', datetime: '2025/02/10 21:39:23', registerNo: '90', productMigration: '338', staffName: 'しおたに',
    details: [
      { id: 'h4', janCode: '2320503399684', salesFloor: '01 衣料', salesSubCategory: '01104 レ_シャツ・ブラウス_半袖', sellingPrice: 500 },
      { id: 'h4b', janCode: '2320503399612', salesFloor: '01 衣料', salesSubCategory: '01105 レ_スウェット', sellingPrice: 900 },
    ],
  },
  {
    invoiceId: 'INV-004', datetime: '2025/02/05 17:53:03', registerNo: '90', productMigration: '338', staffName: 'しおたに',
    details: [
      { id: 'h5', janCode: '2320503399660', salesFloor: '01 衣料', salesSubCategory: '01101 レ_カットソー_長袖', sellingPrice: 500 },
    ],
  },
  {
    invoiceId: 'INV-005', datetime: '2025/01/22 16:19:46', registerNo: '90', productMigration: '338', staffName: 'しおたに',
    details: [
      { id: 'h6', janCode: '2320503399646', salesFloor: '01 衣料', salesSubCategory: '01101 レ_カットソー_長袖', sellingPrice: 500 },
    ],
  },
  {
    invoiceId: 'INV-006', datetime: '2024/12/26 14:29:05', registerNo: '90', productMigration: '338', staffName: 'しおたに',
    details: [
      { id: 'h7', janCode: '2320503399622', salesFloor: '01 衣料', salesSubCategory: '01104 レ_シャツ・ブラウス_半袖', sellingPrice: 500 },
    ],
  },
  {
    invoiceId: 'INV-007', datetime: '2024/12/20 13:17:58', registerNo: '90', productMigration: '338', staffName: 'けんしゅうせい',
    details: [
      { id: 'h8', janCode: '2320503399592', salesFloor: '01 衣料', salesSubCategory: '01104 レ_シャツ・ブラウス_半袖', sellingPrice: 500 },
    ],
  },
  {
    invoiceId: 'INV-008', datetime: '2024/11/06 11:02:27', registerNo: '28', productMigration: '338', staffName: 'けんしゅうせい',
    details: [
      { id: 'h9', janCode: '2320503399585', salesFloor: '01 衣料', salesSubCategory: '01101 レ_カットソー_長袖', sellingPrice: 500 },
    ],
  },
]

function HistoryModeContent({ onBack }: { onBack: () => void }) {
  const { t } = useTranslation()
  const [detailSelected, setDetailSelected] = useState<Record<string, boolean>>({})
  const [printMemoOpen, setPrintMemoOpen] = useState(false)
  const [toast, setToast] = useState<{ open: boolean; message: string }>({ open: false, message: '' })

  const selectedCount = Object.values(detailSelected).filter(Boolean).length
  const totalDetailCount = HISTORY_GROUPS.reduce((s, g) => s + g.details.length, 0)

  const isInvoiceChecked = (invoiceId: string) =>
    HISTORY_GROUPS.find(g => g.invoiceId === invoiceId)?.details.every(d => detailSelected[d.id] === true) ?? false

  const isInvoiceIndeterminate = (invoiceId: string) => {
    const group = HISTORY_GROUPS.find(g => g.invoiceId === invoiceId)
    if (!group) return false
    const checkedCount = group.details.filter(d => detailSelected[d.id]).length
    return checkedCount > 0 && checkedCount < group.details.length
  }

  const toggleInvoice = (invoiceId: string, checked: boolean) => {
    const group = HISTORY_GROUPS.find(g => g.invoiceId === invoiceId)
    if (!group) return
    const updates: Record<string, boolean> = {}
    group.details.forEach(d => { updates[d.id] = checked })
    setDetailSelected(prev => ({ ...prev, ...updates }))
  }

  useLayoutConfig({
    title: t('page.inventory.gross.title'),
    showBackButton: true,
    hideSecondaryNav: true,
    onBack,
    actions: [
      {
        key: 'run',
        labelKey: 'page.inventory.gross.action.run',
        position: 'left',
        variant: 'contained',
        color: 'success',
        startIcon: <PlayArrowIcon fontSize="small" />,
        disabled: selectedCount < 1,
        onClick: () => setPrintMemoOpen(true),
      },
    ],
  })

  const hSx = { fontWeight: 700, fontSize: '0.78rem', color: 'text.secondary', bgcolor: 'grey.50', whiteSpace: 'nowrap' as const }
  const parentCellSx = { verticalAlign: 'top' as const, bgcolor: 'action.hover' }
  const childCellSx = { verticalAlign: 'top' as const }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, height: '100%' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
        <Typography sx={{ fontSize: '0.875rem', fontWeight: 700, color: 'error.main' }}>
          検数：{totalDetailCount}件
        </Typography>
      </Box>

      <PrintMemoModal
        open={printMemoOpen}
        onClose={(executed) => {
          setPrintMemoOpen(false)
          if (executed) setToast({ open: true, message: t('page.inventory.gross.toast.printing') })
        }}
      />

      <Snackbar open={toast.open} autoHideDuration={4000} onClose={() => setToast(p => ({ ...p, open: false }))} anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}>
        <Alert severity="info" onClose={() => setToast(p => ({ ...p, open: false }))} sx={{ width: '100%' }}>
          {toast.message}
        </Alert>
      </Snackbar>

      <AppTableContainer stickyHeader maxHeight={600}>
        <Table size="small" stickyHeader sx={{ tableLayout: 'fixed' }}>
          <TableHead>
            <TableRow>
              <TableCell sx={{ ...hSx, width: 52, textAlign: 'center' }}>選択</TableCell>
              <TableCell sx={{ ...hSx, width: 168 }}>計上日時</TableCell>
              <TableCell sx={{ ...hSx, width: 76, textAlign: 'center' }}>レジ番号</TableCell>
              <TableCell sx={{ ...hSx, width: 76, textAlign: 'center' }}>商品化遷</TableCell>
              <TableCell sx={{ ...hSx, width: 120, borderRight: '2px solid', borderColor: 'divider' }}>担当者名</TableCell>
              <TableCell sx={{ ...hSx, width: 68, textAlign: 'center' }}>明細選択</TableCell>
              <TableCell sx={{ ...hSx, width: 136 }}>JANコード</TableCell>
              <TableCell sx={{ ...hSx, width: 88 }}>売場大分類</TableCell>
              <TableCell sx={hSx}>売場メイン中分類</TableCell>
              <TableCell sx={{ ...hSx, width: 80, textAlign: 'right' }}>販売価格</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {HISTORY_GROUPS.map(group =>
              group.details.map((detail, di) => (
                <TableRow key={detail.id}>
                  {di === 0 && (
                    <TableCell rowSpan={group.details.length} sx={{ ...parentCellSx, textAlign: 'center', px: 0.5 }}>
                      <Checkbox
                        size="small"
                        checked={isInvoiceChecked(group.invoiceId)}
                        indeterminate={isInvoiceIndeterminate(group.invoiceId)}
                        onChange={(e) => toggleInvoice(group.invoiceId, e.target.checked)}
                        onClick={(e) => e.stopPropagation()}
                        sx={{ p: 0 }}
                      />
                    </TableCell>
                  )}
                  {di === 0 && (
                    <TableCell rowSpan={group.details.length} sx={{ ...parentCellSx, fontSize: '0.82rem', fontFamily: 'monospace', whiteSpace: 'nowrap' }}>
                      {group.datetime}
                    </TableCell>
                  )}
                  {di === 0 && (
                    <TableCell rowSpan={group.details.length} sx={{ ...parentCellSx, fontSize: '0.82rem', textAlign: 'center', whiteSpace: 'nowrap' }}>
                      {group.registerNo}
                    </TableCell>
                  )}
                  {di === 0 && (
                    <TableCell rowSpan={group.details.length} sx={{ ...parentCellSx, fontSize: '0.82rem', textAlign: 'center', whiteSpace: 'nowrap' }}>
                      {group.productMigration}
                    </TableCell>
                  )}
                  {di === 0 && (
                    <TableCell rowSpan={group.details.length} sx={{ ...parentCellSx, fontSize: '0.82rem', whiteSpace: 'nowrap', borderRight: '2px solid', borderColor: 'divider' }}>
                      {group.staffName}
                    </TableCell>
                  )}
                  <TableCell sx={{ ...childCellSx, textAlign: 'center', px: 0.5 }}>
                    <Checkbox
                      size="small"
                      checked={detailSelected[detail.id] ?? false}
                      onChange={(e) => setDetailSelected(prev => ({ ...prev, [detail.id]: e.target.checked }))}
                      onClick={(e) => e.stopPropagation()}
                      sx={{ p: 0 }}
                    />
                  </TableCell>
                  <TableCell sx={{ ...childCellSx, fontSize: '0.82rem', fontFamily: 'monospace', whiteSpace: 'nowrap' }}>{detail.janCode}</TableCell>
                  <TableCell sx={{ ...childCellSx, fontSize: '0.82rem', whiteSpace: 'nowrap' }}>{detail.salesFloor}</TableCell>
                  <TableCell sx={{ ...childCellSx, fontSize: '0.82rem' }}>{detail.salesSubCategory}</TableCell>
                  <TableCell sx={{ ...childCellSx, fontSize: '0.82rem', textAlign: 'right', whiteSpace: 'nowrap' }}>{detail.sellingPrice.toLocaleString()}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </AppTableContainer>
    </Box>
  )
}

// ─── Page root ────────────────────────────────────────────────────────────────

function GrossInventoryPage() {
  const router = useRouter()
  const [mode, setMode] = useState<PageMode>('modal')
  const [config, setConfig] = useState<ModalConfig | null>(null)

  const handleConfirm = (cfg: ModalConfig) => {
    setConfig(cfg)
    if (cfg.functionType === 'history') setMode('history')
    else if (cfg.inputMethod === 'batch') setMode('batch')
    else if (cfg.inputMethod === 'set') setMode('set')
    else setMode('each')
  }

  const handleCancel = () => router.history.back()
  const handleBackToModal = () => setMode('modal')

  return (
    <Box sx={{ height: '100%' }}>
      <ConfigModal open={mode === 'modal'} onConfirm={handleConfirm} onCancel={handleCancel} />
      {mode === 'each' && config && <EachModeContent config={config} onBack={handleBackToModal} />}
      {mode === 'batch' && config && <BatchModeContent config={config} onBack={handleBackToModal} />}
      {mode === 'set' && config && <SetModeContent config={config} onBack={handleBackToModal} />}
      {mode === 'history' && <HistoryModeContent onBack={handleBackToModal} />}
    </Box>
  )
}
