import { createFileRoute, useRouter } from '@tanstack/react-router'
import { useMemo, useState, type ReactElement } from 'react'
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
import SwapHorizIcon from '@mui/icons-material/SwapHoriz'
import EditNoteIcon from '@mui/icons-material/EditNote'
import TableChartIcon from '@mui/icons-material/TableChart'
import LayersIcon from '@mui/icons-material/Layers'
import Button from '@mui/material/Button'
import Tooltip from '@mui/material/Tooltip'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
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
import { generateJanCode, getShochukaWeek, generateGyosekiCode } from '../utils/janCode'

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

// ─── Tag data ─────────────────────────────────────────────────────────────────

interface TagData {
  productCode: string
  shochukaWeek: string
  productName: string
  priceExTax: number
  priceIncTax: number
  janCode: string
  gyosekiCode: string
  printType: string
}

function makeTag(productCode: string, productName: string, priceExTax: number, printType = '縦長タグ'): TagData {
  const janCode = generateJanCode()
  return {
    productCode,
    shochukaWeek: getShochukaWeek(),
    productName,
    priceExTax,
    priceIncTax: Math.round(priceExTax * 1.1),
    janCode,
    gyosekiCode: generateGyosekiCode(),
    printType,
  }
}

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
      onConfirm={() => onConfirm({
        functionType, inputMethod, salesFloor, salesSubCategory, gender, sellingPrice,
        priceTypeFixed: inputMethod === 'batch' ? '縦長タグ' : priceTypeFixed,
      })}
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
            <Typography sx={{ fontSize: '0.875rem', color: 'text.primary' }}>縦長タグ</Typography>
          </Box>
        )}
    </AppModal>
  )
}

// ─── Filter chips + counter (shared) ─────────────────────────────────────────

function ConfigChips({ config, totalCount, isOverMax, onSwitchMode }: {
  config: ModalConfig
  totalCount: number
  isOverMax: boolean
  onSwitchMode?: () => void
}) {
  const { t } = useTranslation()
  const genderLabel = config.gender === 'ladies'
    ? t('page.inventory.gross.modal.genderOpt.ladies')
    : t('page.inventory.gross.modal.genderOpt.mens')

  const modeLabel = {
    each: t('page.inventory.gross.modal.method.each'),
    batch: t('page.inventory.gross.modal.method.batch'),
    set: t('page.inventory.gross.modal.method.set'),
  }[config.inputMethod]

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
      {onSwitchMode && (
        <Tooltip title="入力方法を変更">
          <Chip
            icon={<SwapHorizIcon sx={{ fontSize: '0.72rem !important' }} />}
            label={modeLabel}
            size="small"
            color="primary"
            onClick={onSwitchMode}
            sx={{ fontSize: '0.78rem', height: 26, fontWeight: 600 }}
          />
        </Tooltip>
      )}
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

function EachModeContent({ config, onBack, onSwitchMode }: { config: ModalConfig; onBack: () => void; onSwitchMode?: () => void }) {
  const { t } = useTranslation()
  const [quantities, setQuantities] = useState<Record<string, number>>({})
  const [previewTags, setPreviewTags] = useState<TagData[] | null>(null)
  const [toast, setToast] = useState<{ open: boolean; severity: 'info' | 'error'; message: string }>({ open: false, severity: 'info', message: '' })

  const totalCount = Object.values(quantities).reduce((s, q) => s + q, 0)
  const isOverMax = totalCount > MAX_COUNT

  const [printMemoOpen, setPrintMemoOpen] = useState(false)

  const handleReset = () => setQuantities({})

  const buildTags = (printType: string) => {
    const tags: TagData[] = []
    for (const p of PRODUCTS_EACH) {
      const qty = quantities[p.code] ?? 0
      for (let i = 0; i < qty; i++) {
        tags.push(makeTag(p.code, p.name, Number(config.sellingPrice), printType))
      }
    }
    return tags
  }

  const handleRun = () => {
    if (isOverMax) {
      setToast({ open: true, severity: 'error', message: t('page.inventory.gross.toast.overMax') })
      return
    }
    if (config.priceTypeFixed === 'なし') {
      setPrintMemoOpen(true)
    } else {
      setPreviewTags(buildTags(config.priceTypeFixed))
    }
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
      <ConfigChips config={config} totalCount={totalCount} isOverMax={isOverMax} onSwitchMode={onSwitchMode} />

      <AppTable
        data={eachData}
        columns={eachColumns}
        getRowId={(_, index) => String(index)}
        dense
        stickyHeader
      />

      {/* プライス種類 = なし → プライス選択 → TagPreview */}
      <PrintMemoModal open={printMemoOpen} onClose={(executed, selectedType) => {
        setPrintMemoOpen(false)
        if (executed && selectedType) setPreviewTags(buildTags(selectedType))
      }} />

      {previewTags && (
        <TagPreviewDialog
          open
          tags={previewTags}
          onClose={() => setPreviewTags(null)}
          onConfirm={() => {
            const count = previewTags.length
            setPreviewTags(null)
            setToast({ open: true, severity: 'info', message: `${count}件 印刷実行中` })
          }}
        />
      )}

      <Snackbar open={toast.open} autoHideDuration={4000} onClose={() => setToast(p => ({ ...p, open: false }))} anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}>
        <Alert severity={toast.severity} onClose={() => setToast(p => ({ ...p, open: false }))} sx={{ width: '100%' }}>
          {toast.message}
        </Alert>
      </Snackbar>
    </Box>
  )
}

// ─── Print Memo Modal ─────────────────────────────────────────────────────────

function PrintMemoModal({ open, onClose }: { open: boolean; onClose: (executed: boolean, printType?: string) => void }) {
  const [selected, setSelected] = useState(SET_PRINT_TYPES[0])

  return (
    <AppModal
      open={open}
      title="発行プライス選択"
      dividers
      onCancel={() => onClose(false)}
      onConfirm={() => onClose(true, selected)}
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

// ─── Mode Switch Modal ────────────────────────────────────────────────────────

const MODE_SWITCH_OPTIONS: Array<{
  value: InputMethod
  icon: ReactElement
  labelKey: string
  desc: string
}> = [
  {
    value: 'each',
    icon: <EditNoteIcon sx={{ fontSize: '1.5rem' }} />,
    labelKey: 'page.inventory.gross.modal.method.each',
    desc: '大分類・性別・価格を固定し、中分類を1件ずつ付与',
  },
  {
    value: 'batch',
    icon: <TableChartIcon sx={{ fontSize: '1.5rem' }} />,
    labelKey: 'page.inventory.gross.modal.method.batch',
    desc: '価格×中分類の表から数量を一括入力',
  },
  {
    value: 'set',
    icon: <LayersIcon sx={{ fontSize: '1.5rem' }} />,
    labelKey: 'page.inventory.gross.modal.method.set',
    desc: 'セットアイテムの印刷種類別に枚数を入力',
  },
]

function ModeSwitchModal({ open, current, onConfirm, onClose }: {
  open: boolean
  current: InputMethod
  onConfirm: (method: InputMethod) => void
  onClose: () => void
}) {
  const { t } = useTranslation()
  const [selected, setSelected] = useState<InputMethod>(current)

  return (
    <AppModal
      open={open}
      title={t('page.inventory.gross.modal.inputMethod')}
      maxWidth="sm"
      dividers
      onCancel={onClose}
      onConfirm={() => onConfirm(selected)}
    >
      <Box sx={{ px: 2.5, py: 2, display: 'flex', flexDirection: 'column', gap: 1.25 }}>
        {MODE_SWITCH_OPTIONS.map(opt => {
          const isSelected = selected === opt.value
          return (
            <Box
              key={opt.value}
              onClick={() => setSelected(opt.value)}
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 2,
                px: 2,
                py: 1.5,
                border: '2px solid',
                borderColor: isSelected ? 'primary.main' : 'divider',
                borderRadius: 2,
                bgcolor: isSelected ? 'rgba(25,118,210,0.06)' : 'background.paper',
                cursor: 'pointer',
                transition: 'border-color 0.12s, background-color 0.12s',
                '&:hover': {
                  borderColor: isSelected ? 'primary.main' : 'primary.light',
                  bgcolor: isSelected ? 'rgba(25,118,210,0.06)' : 'action.hover',
                },
              }}
            >
              <Box sx={{ color: isSelected ? 'primary.main' : 'text.disabled', display: 'flex', alignItems: 'center', flexShrink: 0 }}>
                {opt.icon}
              </Box>
              <Box sx={{ flex: 1 }}>
                <Typography sx={{ fontSize: '0.9rem', fontWeight: isSelected ? 700 : 500, color: isSelected ? 'primary.main' : 'text.primary', lineHeight: 1.3 }}>
                  {t(opt.labelKey as Parameters<typeof t>[0])}
                </Typography>
                <Typography sx={{ fontSize: '0.75rem', color: 'text.secondary', mt: 0.3, lineHeight: 1.4 }}>
                  {opt.desc}
                </Typography>
              </Box>
              {isSelected && <CheckIcon sx={{ color: 'primary.main', fontSize: '1.1rem', flexShrink: 0 }} />}
            </Box>
          )
        })}
      </Box>
    </AppModal>
  )
}

// ─── Tag Preview ─────────────────────────────────────────────────────────────

const BARCODE_H_BG = 'repeating-linear-gradient(90deg,#000 0px,#000 2px,#fff 2px,#fff 3px,#000 3px,#000 5px,#fff 5px,#fff 7px,#000 7px,#000 9px,#fff 9px,#fff 11px,#000 11px,#000 12px,#fff 12px,#fff 15px)'
const BARCODE_V_BG = 'repeating-linear-gradient(180deg,#000 0px,#000 3px,#fff 3px,#fff 5px,#000 5px,#000 8px,#fff 8px,#fff 10px,#000 10px,#000 12px,#fff 12px,#fff 15px)'

// Shared sub-components
const TH = ({ tag }: { tag: TagData }) => (
  <Box sx={{ display: 'flex', bgcolor: '#111', minHeight: 34 }}>
    <Box sx={{ flex: 1, px: 1, py: 0.6, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
      <Typography sx={{ fontSize: '0.7rem', fontFamily: 'monospace', color: '#fff', letterSpacing: '0.06em' }}>{tag.productCode}</Typography>
      <Typography sx={{ fontSize: '0.7rem', fontFamily: 'monospace', color: '#fff' }}>{tag.shochukaWeek}</Typography>
    </Box>
    <Box sx={{ width: 22, background: BARCODE_V_BG, flexShrink: 0 }} />
  </Box>
)
const TH_WIDE = ({ tag }: { tag: TagData }) => (
  <Box sx={{ display: 'flex', bgcolor: '#111', minHeight: 34 }}>
    <Box sx={{ flex: 1, px: 1, py: 0.6, display: 'flex', alignItems: 'center', gap: 1.5 }}>
      <Typography sx={{ fontSize: '0.68rem', fontFamily: 'monospace', color: '#fff' }}>{tag.productCode}</Typography>
      <Typography sx={{ fontSize: '0.68rem', fontFamily: 'monospace', color: '#fff' }}>{tag.shochukaWeek}</Typography>
      <Typography sx={{ fontSize: '0.68rem', fontFamily: 'monospace', color: '#fff', flex: 1, overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>{tag.productName}</Typography>
    </Box>
    <Box sx={{ width: 22, background: BARCODE_V_BG, flexShrink: 0 }} />
  </Box>
)
const SH = ({ tag }: { tag: TagData }) => (
  <Box sx={{ bgcolor: '#111', px: 1, py: 0.5, display: 'flex', justifyContent: 'space-between' }}>
    <Typography sx={{ fontSize: '0.65rem', fontFamily: 'monospace', color: '#fff' }}>{tag.productCode}</Typography>
    <Typography sx={{ fontSize: '0.65rem', fontFamily: 'monospace', color: '#fff' }}>{tag.shochukaWeek}</Typography>
  </Box>
)
const BF = ({ tag, h = 24 }: { tag: TagData; h?: number }) => (
  <Box sx={{ borderTop: '1px solid #eee', px: 0.75, pt: 0.5, pb: 0.75 }}>
    <Box sx={{ width: '100%', height: h, background: BARCODE_H_BG, mb: 0.3 }} />
    <Typography sx={{ fontSize: '0.5rem', fontFamily: 'monospace', lineHeight: 1.5 }}>{tag.janCode}</Typography>
    <Typography sx={{ fontSize: '0.5rem', fontFamily: 'monospace', lineHeight: 1.5 }}>{tag.janCode.slice(0, 6)}/  {tag.productName}/</Typography>
    <Typography sx={{ fontSize: '0.5rem', fontFamily: 'monospace', lineHeight: 1.5 }}>{tag.gyosekiCode}</Typography>
  </Box>
)
const PriceBlock = ({ tag, big }: { tag: TagData; big?: boolean }) => (
  <>
    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', mb: 0.1 }}>
      <Typography sx={{ fontSize: '0.56rem', color: '#555' }}>税抜</Typography>
      <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 0.2 }}>
        <Typography sx={{ fontSize: big ? '1.45rem' : '1.05rem', fontWeight: 800, lineHeight: 1 }}>{tag.priceExTax.toLocaleString()}</Typography>
        <Typography sx={{ fontSize: big ? '0.75rem' : '0.62rem', fontWeight: 700 }}>円</Typography>
      </Box>
    </Box>
    <Box sx={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'baseline', gap: 0.4 }}>
      <Typography sx={{ fontSize: '0.56rem', color: '#555' }}>税込</Typography>
      <Typography sx={{ fontSize: big ? '0.72rem' : '0.65rem', fontWeight: big ? 600 : 400 }}>{tag.priceIncTax.toLocaleString()}円</Typography>
    </Box>
  </>
)

// ── 縦長タグ ──────────────────────────────────────────────────────────────────
function TagVerticalLong({ tag }: { tag: TagData }) {
  return (
    <Box sx={{ width: 172, border: '1px solid #ccc', bgcolor: '#fff', overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.12)', borderRadius: 0.5, flexShrink: 0 }}>
      <TH tag={tag} />
      <Box sx={{ display: 'flex' }}>
        <Box sx={{ flex: 1, px: 1, pt: 0.75, pb: 0.5 }}>
          <Typography sx={{ fontSize: '0.56rem', color: '#888', mb: 0.2 }}>SIZE</Typography>
          <Typography sx={{ fontSize: '0.68rem', fontWeight: 700, mb: 0.75, lineHeight: 1.3 }}>{tag.productName}</Typography>
          <PriceBlock tag={tag} />
        </Box>
        <Box sx={{ width: 22, background: BARCODE_V_BG, flexShrink: 0 }} />
      </Box>
      <BF tag={tag} />
    </Box>
  )
}

// ── 横長タグ ──────────────────────────────────────────────────────────────────
function TagHorizontalLong({ tag }: { tag: TagData }) {
  return (
    <Box sx={{ width: 270, border: '1px solid #ccc', bgcolor: '#fff', overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.12)', borderRadius: 0.5, flexShrink: 0 }}>
      <TH_WIDE tag={tag} />
      <Box sx={{ display: 'flex' }}>
        <Box sx={{ flex: 1, px: 1.5, py: 0.75, display: 'flex', alignItems: 'center', gap: 2 }}>
          <Box sx={{ flexShrink: 0 }}>
            <Typography sx={{ fontSize: '0.56rem', color: '#888', mb: 0.2 }}>SIZE</Typography>
            <Typography sx={{ fontSize: '0.68rem', fontWeight: 700 }}>{tag.productName}</Typography>
          </Box>
          <Box sx={{ flex: 1 }} />
          <Box sx={{ textAlign: 'right' }}><PriceBlock tag={tag} /></Box>
        </Box>
        <Box sx={{ width: 22, background: BARCODE_V_BG, flexShrink: 0 }} />
      </Box>
      <BF tag={tag} h={20} />
    </Box>
  )
}

// ── 縦長シール ────────────────────────────────────────────────────────────────
function StickerVerticalLong({ tag }: { tag: TagData }) {
  return (
    <Box sx={{ width: 148, border: '1px dashed #aaa', bgcolor: '#fff', overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,0.08)', borderRadius: 2, flexShrink: 0 }}>
      <SH tag={tag} />
      <Box sx={{ px: 1, py: 0.75 }}>
        <Typography sx={{ fontSize: '0.56rem', color: '#888', mb: 0.2 }}>SIZE</Typography>
        <Typography sx={{ fontSize: '0.66rem', fontWeight: 700, mb: 0.75, lineHeight: 1.3 }}>{tag.productName}</Typography>
        <PriceBlock tag={tag} />
      </Box>
      <Box sx={{ px: 0.75, pb: 0.75 }}>
        <Box sx={{ width: '100%', height: 20, background: BARCODE_H_BG, mb: 0.3 }} />
        <Typography sx={{ fontSize: '0.48rem', fontFamily: 'monospace' }}>{tag.janCode}  {tag.gyosekiCode}</Typography>
      </Box>
    </Box>
  )
}

// ── 横長シール ────────────────────────────────────────────────────────────────
function StickerHorizontalLong({ tag }: { tag: TagData }) {
  return (
    <Box sx={{ width: 258, border: '1px dashed #aaa', bgcolor: '#fff', overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,0.08)', borderRadius: 2, flexShrink: 0 }}>
      <Box sx={{ bgcolor: '#111', px: 1, py: 0.45, display: 'flex', alignItems: 'center', gap: 1 }}>
        <Typography sx={{ fontSize: '0.62rem', fontFamily: 'monospace', color: '#fff' }}>{tag.productCode}</Typography>
        <Typography sx={{ fontSize: '0.62rem', fontFamily: 'monospace', color: '#fff' }}>{tag.shochukaWeek}</Typography>
        <Typography sx={{ fontSize: '0.62rem', fontFamily: 'monospace', color: '#fff', flex: 1, overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>{tag.productName}</Typography>
      </Box>
      <Box sx={{ px: 1, py: 0.75, display: 'flex', alignItems: 'center', gap: 2 }}>
        <Box sx={{ flex: 1 }}><PriceBlock tag={tag} /></Box>
        <Box sx={{ width: 80, flexShrink: 0 }}>
          <Box sx={{ width: '100%', height: 28, background: BARCODE_H_BG, mb: 0.3 }} />
          <Typography sx={{ fontSize: '0.45rem', fontFamily: 'monospace' }}>{tag.janCode}</Typography>
        </Box>
      </Box>
    </Box>
  )
}

// ── 縦長ショーケースタグ ──────────────────────────────────────────────────────
function TagVerticalShowcase({ tag }: { tag: TagData }) {
  return (
    <Box sx={{ width: 172, border: '2px solid #333', bgcolor: '#fff', overflow: 'hidden', boxShadow: '0 3px 12px rgba(0,0,0,0.18)', borderRadius: 0.5, flexShrink: 0 }}>
      <TH tag={tag} />
      <Box sx={{ display: 'flex' }}>
        <Box sx={{ flex: 1, px: 1, pt: 0.75, pb: 0.5 }}>
          <Typography sx={{ fontSize: '0.56rem', color: '#888', mb: 0.2 }}>SIZE</Typography>
          <Typography sx={{ fontSize: '0.68rem', fontWeight: 700, mb: 1, lineHeight: 1.3 }}>{tag.productName}</Typography>
          <PriceBlock tag={tag} big />
        </Box>
        <Box sx={{ width: 22, background: BARCODE_V_BG, flexShrink: 0 }} />
      </Box>
      <BF tag={tag} />
    </Box>
  )
}

// ── 横長ショーケースタグ ──────────────────────────────────────────────────────
function TagHorizontalShowcase({ tag }: { tag: TagData }) {
  return (
    <Box sx={{ width: 270, border: '2px solid #333', bgcolor: '#fff', overflow: 'hidden', boxShadow: '0 3px 12px rgba(0,0,0,0.18)', borderRadius: 0.5, flexShrink: 0 }}>
      <TH_WIDE tag={tag} />
      <Box sx={{ display: 'flex' }}>
        <Box sx={{ flex: 1, px: 1.5, py: 0.75, display: 'flex', alignItems: 'center', gap: 2 }}>
          <Box sx={{ flexShrink: 0 }}>
            <Typography sx={{ fontSize: '0.56rem', color: '#888', mb: 0.2 }}>SIZE</Typography>
            <Typography sx={{ fontSize: '0.68rem', fontWeight: 700 }}>{tag.productName}</Typography>
          </Box>
          <Box sx={{ flex: 1 }} />
          <Box sx={{ textAlign: 'right' }}><PriceBlock tag={tag} big /></Box>
        </Box>
        <Box sx={{ width: 22, background: BARCODE_V_BG, flexShrink: 0 }} />
      </Box>
      <BF tag={tag} h={20} />
    </Box>
  )
}

// ── 縦長ショーケースシール ────────────────────────────────────────────────────
function StickerVerticalShowcase({ tag }: { tag: TagData }) {
  return (
    <Box sx={{ width: 148, border: '2px solid #333', bgcolor: '#fff', overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,0.1)', borderRadius: 2, flexShrink: 0 }}>
      <SH tag={tag} />
      <Box sx={{ px: 1, py: 1, textAlign: 'center' }}>
        <Typography sx={{ fontSize: '0.65rem', fontWeight: 700, mb: 1.5, lineHeight: 1.3 }}>{tag.productName}</Typography>
        <Typography sx={{ fontSize: '0.56rem', color: '#555', mb: 0.5 }}>税抜</Typography>
        <Box sx={{ display: 'flex', alignItems: 'baseline', justifyContent: 'center', gap: 0.25, mb: 1 }}>
          <Typography sx={{ fontSize: '1.7rem', fontWeight: 900, lineHeight: 1 }}>{tag.priceExTax.toLocaleString()}</Typography>
          <Typography sx={{ fontSize: '0.9rem', fontWeight: 700 }}>円</Typography>
        </Box>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'baseline', gap: 0.5 }}>
          <Typography sx={{ fontSize: '0.58rem', color: '#555' }}>税込</Typography>
          <Typography sx={{ fontSize: '0.78rem', fontWeight: 600 }}>{tag.priceIncTax.toLocaleString()}円</Typography>
        </Box>
      </Box>
    </Box>
  )
}

// ── 横短シール ────────────────────────────────────────────────────────────────
function StickerHorizontalShort({ tag }: { tag: TagData }) {
  return (
    <Box sx={{ width: 230, border: '1px dashed #aaa', bgcolor: '#fff', overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,0.08)', borderRadius: 2, flexShrink: 0 }}>
      <Box sx={{ px: 1.25, py: 0.6, display: 'flex', alignItems: 'center', gap: 1 }}>
        <Typography sx={{ fontSize: '0.6rem', fontFamily: 'monospace', color: '#888' }}>{tag.productCode}</Typography>
        <Box sx={{ flex: 1 }} />
        <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 0.4 }}>
          <Typography sx={{ fontSize: '0.56rem', color: '#555' }}>税抜</Typography>
          <Typography sx={{ fontSize: '1rem', fontWeight: 800 }}>{tag.priceExTax.toLocaleString()}</Typography>
          <Typography sx={{ fontSize: '0.6rem' }}>円</Typography>
        </Box>
        <Typography sx={{ fontSize: '0.6rem', color: '#bbb' }}>｜</Typography>
        <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 0.4 }}>
          <Typography sx={{ fontSize: '0.56rem', color: '#555' }}>税込</Typography>
          <Typography sx={{ fontSize: '0.78rem', fontWeight: 600 }}>{tag.priceIncTax.toLocaleString()}</Typography>
          <Typography sx={{ fontSize: '0.6rem' }}>円</Typography>
        </Box>
      </Box>
      <Box sx={{ px: 1.25, pb: 0.6, display: 'flex', gap: 1, alignItems: 'center' }}>
        <Box sx={{ width: 70, height: 16, background: BARCODE_H_BG, flexShrink: 0 }} />
        <Typography sx={{ fontSize: '0.45rem', fontFamily: 'monospace', color: '#999', overflow: 'hidden', whiteSpace: 'nowrap' }}>{tag.janCode}</Typography>
      </Box>
    </Box>
  )
}

// ── Router ────────────────────────────────────────────────────────────────────
function TagPreviewCard({ tag }: { tag: TagData }) {
  switch (tag.printType) {
    case '横長タグ':             return <TagHorizontalLong tag={tag} />
    case '縦長シール':           return <StickerVerticalLong tag={tag} />
    case '横長シール':           return <StickerHorizontalLong tag={tag} />
    case '縦長ショーケースタグ': return <TagVerticalShowcase tag={tag} />
    case '横長ショーケースタグ': return <TagHorizontalShowcase tag={tag} />
    case '縦長ショーケースシール': return <StickerVerticalShowcase tag={tag} />
    case '横短シール':           return <StickerHorizontalShort tag={tag} />
    default:                     return <TagVerticalLong tag={tag} />
  }
}

function TagPreviewDialog({ open, tags, onClose, onConfirm }: {
  open: boolean
  tags: TagData[]
  onClose: () => void
  onConfirm: () => void
}) {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle sx={{ fontSize: '0.95rem', fontWeight: 700, pb: 1 }}>
        印刷プレビュー — {tags.length}件
      </DialogTitle>
      <DialogContent dividers sx={{ p: 2 }}>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5 }}>
          {tags.map((tag, i) => <TagPreviewCard key={i} tag={tag} />)}
        </Box>
      </DialogContent>
      <DialogActions sx={{ px: 3, py: 1.5, gap: 1 }}>
        <Button variant="outlined" color="inherit" onClick={onClose} sx={{ textTransform: 'none' }}>
          キャンセル
        </Button>
        <Button variant="contained" color="success" startIcon={<PlayArrowIcon fontSize="small" />} onClick={onConfirm} sx={{ textTransform: 'none', fontWeight: 700 }}>
          {tags.length}件 実行
        </Button>
      </DialogActions>
    </Dialog>
  )
}

// ─── Batch Mode (まとめ) ──────────────────────────────────────────────────────

type BatchProduct = (typeof PRODUCTS_BATCH)[0]

function BatchModeContent({ config, onBack, onSwitchMode }: { config: ModalConfig; onBack: () => void; onSwitchMode?: () => void }) {
  const { t } = useTranslation()
  const [quantities, setQuantities] = useState<Record<string, Record<number, number>>>({})
  const [toast, setToast] = useState<{ open: boolean; severity: 'info' | 'error' | 'success'; message: string }>({ open: false, severity: 'info', message: '' })

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

  const [previewTags, setPreviewTags] = useState<TagData[] | null>(null)

  const handleReset = () => setQuantities({})
  const handleRun = () => {
    if (isOverMax) { setToast({ open: true, severity: 'error', message: t('page.inventory.gross.toast.overMax') }); return }
    const tags: TagData[] = []
    for (const product of PRODUCTS_BATCH) {
      for (const price of PRICE_COLUMNS) {
        const qty = quantities[product.code]?.[price] ?? 0
        for (let i = 0; i < qty; i++) {
          tags.push(makeTag(product.code, product.name, price, '縦長タグ'))
        }
      }
    }
    setPreviewTags(tags)
  }
  const handlePrintMemo = () => {
    setToast({
      open: true,
      severity: 'success',
      message: 'メモ用紙の印刷を実行しました。デスクトップ不要で在庫登録にご活用ください。',
    })
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
      <ConfigChips config={config} totalCount={totalCount} isOverMax={isOverMax} onSwitchMode={onSwitchMode} />

      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, px: 2, py: 0.75, bgcolor: 'grey.900', borderRadius: 1 }}>
        <Typography sx={{ fontSize: '0.82rem', fontWeight: 700, color: 'white' }}>
          {t('page.inventory.gross.counter.label')}
        </Typography>
        <Typography sx={{ fontSize: '0.875rem', fontWeight: 600, color: isOverMax ? 'error.light' : 'white' }}>
          {totalCount}/{MAX_COUNT}
        </Typography>
      </Box>

      <AppTable data={PRODUCTS_BATCH} columns={batchColumns} dense stickyHeader />

      {previewTags && (
        <TagPreviewDialog
          open
          tags={previewTags}
          onClose={() => setPreviewTags(null)}
          onConfirm={() => {
            const count = previewTags.length
            setPreviewTags(null)
            setToast({ open: true, severity: 'info', message: `${count}件 印刷実行中` })
          }}
        />
      )}

      <Snackbar open={toast.open} autoHideDuration={6000} onClose={() => setToast(p => ({ ...p, open: false }))} anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}>
        <Alert severity={toast.severity} onClose={() => setToast(p => ({ ...p, open: false }))} sx={{ width: '100%' }}>
          {toast.message}
        </Alert>
      </Snackbar>
    </Box>
  )
}

// ─── Set Mode (セット) ────────────────────────────────────────────────────────

type PrintRow = { type: string }

function SetModeContent({ config, onBack, onSwitchMode }: { config: ModalConfig; onBack: () => void; onSwitchMode?: () => void }) {
  const { t } = useTranslation()
  const [quantities, setQuantities] = useState<Record<string, number>>({})
  const [printMemoOpen, setPrintMemoOpen] = useState(false)
  const [toast, setToast] = useState<{ open: boolean; severity: 'info' | 'error'; message: string }>({ open: false, severity: 'info', message: '' })

  const totalCount = Object.values(quantities).reduce((s, q) => s + q, 0)
  const isOverMax = totalCount > MAX_COUNT

  const [previewTags, setPreviewTags] = useState<TagData[] | null>(null)

  const handleReset = () => setQuantities({})
  const handleRun = () => {
    if (isOverMax) {
      setToast({ open: true, severity: 'error', message: t('page.inventory.gross.toast.overMax') })
      return
    }
    const tags: TagData[] = []
    const productCode = config.salesSubCategory.slice(0, 5)
    const productName = config.salesSubCategory
    const price = Number(config.sellingPrice)
    for (const printType of SET_PRINT_TYPES) {
      const qty = quantities[printType] ?? 0
      for (let i = 0; i < qty; i++) {
        tags.push(makeTag(productCode, productName, price, printType))
      }
    }
    setPreviewTags(tags)
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
        <Box sx={{ flex: 1 }} />
        {onSwitchMode && (
          <Tooltip title="入力方法を変更">
            <Chip
              icon={<SwapHorizIcon sx={{ fontSize: '0.72rem !important' }} />}
              label={t('page.inventory.gross.modal.method.set')}
              size="small"
              color="primary"
              onClick={onSwitchMode}
              sx={{ fontSize: '0.78rem', height: 26, fontWeight: 600 }}
            />
          </Tooltip>
        )}
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

      {previewTags && (
        <TagPreviewDialog
          open
          tags={previewTags}
          onClose={() => setPreviewTags(null)}
          onConfirm={() => {
            const count = previewTags.length
            setPreviewTags(null)
            setToast({ open: true, severity: 'info', message: `${count}件 印刷実行中` })
          }}
        />
      )}

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

function GrossInventoryContent({ onExit }: { onExit: () => void }) {
  const [mode, setMode] = useState<PageMode>('modal')
  const [config, setConfig] = useState<ModalConfig | null>(null)
  const [modeSwitchOpen, setModeSwitchOpen] = useState(false)

  const handleConfirm = (cfg: ModalConfig) => {
    setConfig(cfg)
    if (cfg.functionType === 'history') setMode('history')
    else if (cfg.inputMethod === 'batch') setMode('batch')
    else if (cfg.inputMethod === 'set') setMode('set')
    else setMode('each')
  }

  const handleSwitchMode = (method: InputMethod) => {
    setConfig(prev => prev ? { ...prev, inputMethod: method } : null)
    setMode(method)
    setModeSwitchOpen(false)
  }

  const handleBackToModal = () => setMode('modal')

  return (
    <Box sx={{ height: '100%' }}>
      <ConfigModal open={mode === 'modal'} onConfirm={handleConfirm} onCancel={onExit} />
      {mode === 'each' && config && (
        <EachModeContent config={config} onBack={handleBackToModal} onSwitchMode={() => setModeSwitchOpen(true)} />
      )}
      {mode === 'batch' && config && (
        <BatchModeContent config={config} onBack={handleBackToModal} onSwitchMode={() => setModeSwitchOpen(true)} />
      )}
      {mode === 'set' && config && (
        <SetModeContent config={config} onBack={handleBackToModal} onSwitchMode={() => setModeSwitchOpen(true)} />
      )}
      {mode === 'history' && <HistoryModeContent onBack={handleBackToModal} />}
      {modeSwitchOpen && config && config.functionType !== 'history' && (
        <ModeSwitchModal
          open={modeSwitchOpen}
          current={config.inputMethod}
          onConfirm={handleSwitchMode}
          onClose={() => setModeSwitchOpen(false)}
        />
      )}
    </Box>
  )
}

function GrossInventoryPage() {
  const router = useRouter()
  return <GrossInventoryContent onExit={() => router.history.back()} />
}
