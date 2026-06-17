import { createFileRoute } from '@tanstack/react-router'
import { useMemo, useRef, useState } from 'react'
import type { ColumnDef } from '@tanstack/react-table'
import Alert from '@mui/material/Alert'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Chip from '@mui/material/Chip'
import Divider from '@mui/material/Divider'
import IconButton from '@mui/material/IconButton'
import InputAdornment from '@mui/material/InputAdornment'
import MenuItem from '@mui/material/MenuItem'
import OutlinedInput from '@mui/material/OutlinedInput'
import Paper from '@mui/material/Paper'
import Snackbar from '@mui/material/Snackbar'
import TextField from '@mui/material/TextField'
import Tooltip from '@mui/material/Tooltip'
import Typography from '@mui/material/Typography'
import BadgeOutlinedIcon from '@mui/icons-material/BadgeOutlined'
import CalendarMonthOutlinedIcon from '@mui/icons-material/CalendarMonthOutlined'
import ClearIcon from '@mui/icons-material/Clear'
import DeleteOutlinedIcon from '@mui/icons-material/DeleteOutlined'
import EditNoteIcon from '@mui/icons-material/EditNote'
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined'
import PrintOutlinedIcon from '@mui/icons-material/PrintOutlined'
import QrCodeScannerIcon from '@mui/icons-material/QrCodeScanner'
import ReceiptLongOutlinedIcon from '@mui/icons-material/ReceiptLongOutlined'
import ReplayIcon from '@mui/icons-material/Replay'
import SearchIcon from '@mui/icons-material/Search'
import TaskAltIcon from '@mui/icons-material/TaskAlt'
import { useTranslation } from 'react-i18next'
import { AppTable } from '../components/table'
import { AppModal } from '../components/common/AppModal'
import { QuantityStepper } from '../components/QuantityStepper'
import { useLayoutConfig } from '../hooks/useLayoutConfig'

export const Route = createFileRoute('/purchase/register-correction')({
  component: RegisterCorrectionPage,
})

// ── Types ─────────────────────────────────────────────────────────────────────

type Rank = 'S' | 'A' | 'B' | 'C'
type Payment = 'cash' | 'transfer'
type LineOrigin = 'original' | 'reversal' | 'added'

interface SlipLine {
  category: string // 小分類
  code: string // 商品コード
  productName: string
  isIndividual: boolean // 個品（TOBE：追加可）
  rank: Rank // 状態ランク
  payment: Payment
  qty: number
  unitPrice: number
}

interface SlipData {
  slipNumber: string
  postingDate: string // YYYYMMDD（計上日）
  lines: SlipLine[]
}

interface CorrectionLine extends SlipLine {
  id: string
  origin: LineOrigin
  /** 元明細行ID（取消行の場合のみ） */
  reversalOf?: string
}

// ── Date helpers ──────────────────────────────────────────────────────────────

const toYmd = (d: Date) =>
  `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}${String(d.getDate()).padStart(2, '0')}`

const formatYmd = (ymd: string) => `${ymd.slice(0, 4)}/${ymd.slice(4, 6)}/${ymd.slice(6, 8)}`

const daysAgo = (n: number) => {
  const d = new Date()
  d.setDate(d.getDate() - n)
  return d
}

/** 計上日：西暦8桁の実在日付、かつ前日以前（E-18は前日以前のミス修正が対象） */
const validatePostingDate = (input: string): 'ok' | 'invalid' | 'future' => {
  if (!/^\d{8}$/.test(input)) return 'invalid'
  const y = Number(input.slice(0, 4))
  const m = Number(input.slice(4, 6))
  const d = Number(input.slice(6, 8))
  const date = new Date(y, m - 1, d)
  if (date.getFullYear() !== y || date.getMonth() !== m - 1 || date.getDate() !== d) return 'invalid'
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return date < today ? 'ok' : 'future'
}

// ── Mock data ─────────────────────────────────────────────────────────────────

const STAFF_MASTER: Record<string, string> = {
  '9999999': 'けんしゅうせい',
  '1234567': 'たなか',
  '2345678': 'やまざき',
  '3456789': 'わたなべ',
}

/** 商品マスタ：＜コード＞入力で明細追加（TOBE：個品も追加可能） */
const PRODUCT_MASTER: Record<string, Omit<SlipLine, 'qty'>> = {
  '1717171': { category: '22033', code: '1717171', productName: '千と千尋の神隠し DVD', isIndividual: false, rank: 'A', payment: 'cash', unitPrice: 800 },
  '1717172': { category: '22033', code: '1717172', productName: 'もののけ姫 DVD', isIndividual: false, rank: 'A', payment: 'cash', unitPrice: 700 },
  '5060453': { category: '31010', code: '5060453', productName: 'みんなのGOLF ポータブル2', isIndividual: false, rank: 'A', payment: 'cash', unitPrice: 380 },
  '5060388': { category: '31010', code: '5060388', productName: 'スロット天国DX', isIndividual: false, rank: 'B', payment: 'cash', unitPrice: 250 },
  '7001001': { category: '11005', code: '7001001', productName: 'ルイヴィトン モノグラム 長財布', isIndividual: true, rank: 'A', payment: 'cash', unitPrice: 12000 },
  '7001002': { category: '11005', code: '7001002', productName: 'グッチ GGキャンバス トートバッグ', isIndividual: true, rank: 'B', payment: 'transfer', unitPrice: 25000 },
}

/** 買取伝票マスタ（計上日は前日・前々日で動的生成） */
const SLIP_MASTER: Record<string, SlipData> = {
  '0000030781': {
    slipNumber: '0000030781',
    postingDate: toYmd(daysAgo(1)),
    lines: [
      { category: '22033', code: '1717171', productName: '千と千尋の神隠し DVD', isIndividual: false, rank: 'B', payment: 'cash', qty: 1, unitPrice: 560 },
      { category: '31010', code: '5060453', productName: 'みんなのGOLF ポータブル2', isIndividual: false, rank: 'A', payment: 'cash', qty: 2, unitPrice: 380 },
    ],
  },
  '0000030785': {
    slipNumber: '0000030785',
    postingDate: toYmd(daysAgo(2)),
    lines: [
      { category: '11005', code: '7001001', productName: 'ルイヴィトン モノグラム 長財布', isIndividual: true, rank: 'A', payment: 'transfer', qty: 1, unitPrice: 12000 },
      { category: '31010', code: '5060388', productName: 'スロット天国DX', isIndividual: false, rank: 'B', payment: 'cash', qty: 1, unitPrice: 250 },
    ],
  },
}

const RANKS: Rank[] = ['S', 'A', 'B', 'C']
const PAYMENTS: Payment[] = ['cash', 'transfer']

/** 内税10%（端数切捨て、負数は0方向へ） */
const taxOf = (amount: number) => Math.trunc((amount * 10) / 110)

const fmtYen = (n: number) => (n < 0 ? `-¥${Math.abs(n).toLocaleString()}` : `¥${n.toLocaleString()}`)

const ORIGIN_CHIP_COLOR: Record<LineOrigin, 'default' | 'error' | 'success'> = {
  original: 'default',
  reversal: 'error',
  added: 'success',
}

// ── Page ──────────────────────────────────────────────────────────────────────

function RegisterCorrectionPage() {
  const { t } = useTranslation()

  // E-18-02-02: 担当者コードスキャン
  const [staffCode, setStaffCode] = useState('')
  const [staffInput, setStaffInput] = useState('')
  const staffName = STAFF_MASTER[staffCode] ?? ''

  // E-18-02-03/04: 業務選択（計上日＋買取訂正）
  const [postingDate, setPostingDate] = useState('')
  const [dateInput, setDateInput] = useState('')
  const [dateError, setDateError] = useState('')
  const [bizSelected, setBizSelected] = useState(false)

  // X-01: 伝票検索
  const [slip, setSlip] = useState<SlipData | null>(null)
  const [slipInput, setSlipInput] = useState('')

  // E-18-02-05: 明細修正
  const [lines, setLines] = useState<CorrectionLine[]>([])
  const [codeInput, setCodeInput] = useState('')

  // E-18-02-06〜09: 登録 → ｺﾒﾝﾄ入力 → 理由 → 確定
  const [registered, setRegistered] = useState(false)
  const [reason, setReason] = useState('')
  const [commentOpen, setCommentOpen] = useState(false)
  const [abortOpen, setAbortOpen] = useState(false)
  const [completeOpen, setCompleteOpen] = useState(false)

  const [toast, setToast] = useState<{ open: boolean; message: string; severity: 'success' | 'warning' }>({
    open: false, message: '', severity: 'success',
  })

  const dateRef = useRef<HTMLInputElement>(null)
  const slipRef = useRef<HTMLInputElement>(null)
  const codeRef = useRef<HTMLInputElement>(null)

  useLayoutConfig({ title: t('page.registerCorrection.title') })

  const showToast = (message: string, severity: 'success' | 'warning' = 'success') =>
    setToast({ open: true, message, severity })

  const dateExample = useMemo(() => toYmd(daysAgo(1)), [])

  // ── Derived totals ──────────────────────────────────────────────────────────

  const originalTotal = useMemo(
    () => (slip ? slip.lines.reduce((sum, l) => sum + l.qty * l.unitPrice, 0) : 0),
    [slip],
  )
  const currentTotal = useMemo(() => lines.reduce((sum, l) => sum + l.qty * l.unitPrice, 0), [lines])
  const totalQty = useMemo(() => lines.reduce((sum, l) => sum + l.qty, 0), [lines])
  const diff = currentTotal - originalTotal
  const hasChanges = lines.some((l) => l.origin !== 'original')

  // ── Handlers ────────────────────────────────────────────────────────────────

  const handleStaffScan = () => {
    const code = staffInput.trim()
    if (!code) return
    if (!STAFF_MASTER[code]) {
      showToast(t('page.registerCorrection.staff.notFound'), 'warning')
      return
    }
    setStaffCode(code)
    setStaffInput('')
    setTimeout(() => dateRef.current?.focus(), 50)
  }

  // E-18-02-03: 計上日を西暦8桁で入力し「Enter」キー押下
  const handleDateSubmit = () => {
    const input = dateInput.trim()
    const result = validatePostingDate(input)
    if (result === 'invalid') {
      setDateError(t('page.registerCorrection.bizSelect.dateInvalid'))
      return
    }
    if (result === 'future') {
      setDateError(t('page.registerCorrection.bizSelect.dateFuture'))
      return
    }
    setDateError('')
    setPostingDate(input)
  }

  // E-18-02-04:「買取訂正」押下
  const handlePurchaseFix = () => {
    setBizSelected(true)
    setTimeout(() => slipRef.current?.focus(), 50)
  }

  // X-01: 伝票番号で検索
  const handleSlipSearch = () => {
    const no = slipInput.trim()
    if (!no) return
    const found = SLIP_MASTER[no]
    if (!found) {
      showToast(t('page.registerCorrection.slipSearch.notFound'), 'warning')
      return
    }
    if (found.postingDate !== postingDate) {
      showToast(
        t('page.registerCorrection.slipSearch.dateMismatch', { date: formatYmd(found.postingDate) }),
        'warning',
      )
      return
    }
    setSlip(found)
    setLines(found.lines.map((line, index) => ({ ...line, id: `org-${index}`, origin: 'original' })))
    setSlipInput('')
    showToast(t('page.registerCorrection.slipSearch.loaded', { slip: found.slipNumber, n: found.lines.length }))
    setTimeout(() => codeRef.current?.focus(), 50)
  }

  // 元明細の取消：実際に渡した明細を数量−1（TOBE補足）
  const handleReverse = (line: CorrectionLine) => {
    if (lines.some((l) => l.reversalOf === line.id)) {
      showToast(t('page.registerCorrection.line.alreadyReversed'), 'warning')
      return
    }
    setLines((prev) => {
      const index = prev.findIndex((l) => l.id === line.id)
      const reversal: CorrectionLine = {
        ...line,
        id: `rev-${line.id}`,
        origin: 'reversal',
        reversalOf: line.id,
        qty: -line.qty,
      }
      return [...prev.slice(0, index + 1), reversal, ...prev.slice(index + 1)]
    })
    showToast(t('page.registerCorrection.line.reversed'))
    setTimeout(() => codeRef.current?.focus(), 50)
  }

  // E-18-02-05: ＜コード＞を入力 → 正しい明細を＋1（TOBE：個品も追加可）
  const handleCodeAdd = () => {
    const code = codeInput.trim()
    if (!code) return
    const product = PRODUCT_MASTER[code]
    if (!product) {
      showToast(t('page.registerCorrection.code.notFound'), 'warning')
      return
    }
    setLines((prev) => [...prev, { ...product, id: `add-${Date.now()}`, origin: 'added', qty: 1 }])
    setCodeInput('')
    showToast(t('page.registerCorrection.code.added', { name: product.productName }))
    setTimeout(() => codeRef.current?.focus(), 50)
  }

  const updateLine = (id: string, patch: Partial<CorrectionLine>) =>
    setLines((prev) => prev.map((l) => (l.id === id ? { ...l, ...patch } : l)))

  const handleDeleteLine = (line: CorrectionLine) =>
    setLines((prev) => prev.filter((l) => l.id !== line.id))

  // E-18-02-06:「登録」押下
  const handleRegister = () => {
    if (!hasChanges) {
      showToast(t('page.registerCorrection.register.noChange'), 'warning')
      return
    }
    setRegistered(true)
    showToast(t('page.registerCorrection.register.done'))
  }

  // E-18-02-08/09: 理由入力 →「確定」押下 → 帳票出力
  const handleConfirm = () => {
    setCommentOpen(false)
    setCompleteOpen(true)
  }

  const resetAll = () => {
    setPostingDate('')
    setDateInput('')
    setDateError('')
    setBizSelected(false)
    setSlip(null)
    setSlipInput('')
    setLines([])
    setCodeInput('')
    setRegistered(false)
    setReason('')
  }

  const handleAbort = () => {
    setAbortOpen(false)
    resetAll()
    showToast(t('page.registerCorrection.abort.aborted'))
  }

  const handleCompleteClose = () => {
    setCompleteOpen(false)
    resetAll()
  }

  // ── Columns ──────────────────────────────────────────────────────────────────

  const columns = useMemo<ColumnDef<CorrectionLine>[]>(() => [
    {
      id: 'no', header: t('page.registerCorrection.col.no'), size: 48, enableSorting: false,
      cell: ({ row }) => (
        <Typography sx={{ fontSize: '0.8rem', textAlign: 'center' }}>{row.index + 1}</Typography>
      ),
      meta: { headerSx: { textAlign: 'center' }, cellSx: { textAlign: 'center' } },
    },
    {
      id: 'type', header: t('page.registerCorrection.col.type'), size: 92, enableSorting: false,
      cell: ({ row }) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, justifyContent: 'center' }}>
          <Typography sx={{ fontSize: '0.78rem' }}>{t('page.registerCorrection.type.purchase')}</Typography>
          <Chip
            label={t(`page.registerCorrection.line.${row.original.origin}`)}
            size="small"
            color={ORIGIN_CHIP_COLOR[row.original.origin]}
            variant={row.original.origin === 'original' ? 'outlined' : 'filled'}
            sx={{ fontSize: '0.68rem', height: 20 }}
          />
        </Box>
      ),
      meta: { headerSx: { textAlign: 'center' }, cellSx: { textAlign: 'center', whiteSpace: 'nowrap' as const } },
    },
    {
      id: 'category', header: t('page.registerCorrection.col.category'), size: 76, enableSorting: false,
      cell: ({ row }) => (
        <Typography sx={{ fontFamily: 'monospace', fontSize: '0.8rem', textAlign: 'center' }}>
          {row.original.category}
        </Typography>
      ),
      meta: { headerSx: { textAlign: 'center' }, cellSx: { textAlign: 'center' } },
    },
    {
      id: 'code', header: t('page.registerCorrection.col.code'), size: 96, enableSorting: false,
      cell: ({ row }) => (
        <Typography sx={{ fontFamily: 'monospace', fontSize: '0.8rem' }}>{row.original.code}</Typography>
      ),
      meta: { cellSx: { whiteSpace: 'nowrap' as const } },
    },
    {
      id: 'productName', header: t('page.registerCorrection.col.productName'), enableSorting: false,
      cell: ({ row }) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <Typography sx={{ fontSize: '0.85rem' }}>{row.original.productName}</Typography>
          {row.original.isIndividual && (
            <Chip
              label={t('page.registerCorrection.line.individual')}
              size="small" color="primary" variant="outlined"
              sx={{ fontSize: '0.68rem', height: 20 }}
            />
          )}
        </Box>
      ),
      meta: { cellSx: { minWidth: 200 } },
    },
    {
      // 状態ランク間違いの修正（TOBE補足）
      id: 'rank', header: t('page.registerCorrection.col.rank'), size: 72, enableSorting: false,
      cell: ({ row }) => row.original.origin === 'original' ? (
        <Typography sx={{ fontSize: '0.82rem', textAlign: 'center' }}>{row.original.rank}</Typography>
      ) : (
        <TextField
          select size="small" value={row.original.rank} disabled={registered}
          onChange={(e) => updateLine(row.original.id, { rank: e.target.value as Rank })}
          sx={{ width: 60, '& .MuiSelect-select': { py: 0.4, fontSize: '0.8rem' } }}
        >
          {RANKS.map((r) => <MenuItem key={r} value={r} sx={{ fontSize: '0.82rem' }}>{r}</MenuItem>)}
        </TextField>
      ),
      meta: { headerSx: { textAlign: 'center' }, cellSx: { textAlign: 'center' } },
    },
    {
      // 決済手段間違いの修正（TOBE補足：実現性や意義は要検討）
      id: 'payment', header: t('page.registerCorrection.col.payment'), size: 120, enableSorting: false,
      cell: ({ row }) => row.original.origin === 'original' ? (
        <Typography sx={{ fontSize: '0.8rem', textAlign: 'center' }}>
          {t(`page.registerCorrection.payment.${row.original.payment}`)}
        </Typography>
      ) : (
        <TextField
          select size="small" value={row.original.payment} disabled={registered}
          onChange={(e) => updateLine(row.original.id, { payment: e.target.value as Payment })}
          sx={{ width: 110, '& .MuiSelect-select': { py: 0.4, fontSize: '0.78rem' } }}
        >
          {PAYMENTS.map((p) => (
            <MenuItem key={p} value={p} sx={{ fontSize: '0.8rem' }}>
              {t(`page.registerCorrection.payment.${p}`)}
            </MenuItem>
          ))}
        </TextField>
      ),
      meta: { headerSx: { textAlign: 'center' }, cellSx: { textAlign: 'center' } },
    },
    {
      // 数量間違いの修正：取消行は負数のまま、追加行は1以上
      id: 'qty', header: t('page.registerCorrection.col.qty'), size: 110, enableSorting: false,
      cell: ({ row }) => {
        const line = row.original
        if (line.origin === 'original' || line.origin === 'reversal' || registered) {
          return (
            <Typography sx={{
              fontSize: '0.85rem', textAlign: 'center', fontWeight: line.qty < 0 ? 700 : 400,
              color: line.qty < 0 ? 'error.main' : 'text.primary',
            }}>
              {line.qty}
            </Typography>
          )
        }
        return (
          <QuantityStepper compact value={line.qty} min={1}
            onChange={(qty) => updateLine(line.id, { qty })} />
        )
      },
      meta: { headerSx: { textAlign: 'center' }, cellSx: { textAlign: 'center', whiteSpace: 'nowrap' as const } },
    },
    {
      // 単価：渡した金額に修正（TOBE補足）
      id: 'unitPrice', header: t('page.registerCorrection.col.unitPrice'), size: 100, enableSorting: false,
      cell: ({ row }) => row.original.origin === 'original' || registered ? (
        <Typography sx={{ fontSize: '0.82rem', textAlign: 'right' }}>
          {fmtYen(row.original.unitPrice)}
        </Typography>
      ) : (
        <TextField
          size="small" type="number" value={row.original.unitPrice}
          onChange={(e) => updateLine(row.original.id, { unitPrice: Math.max(0, Number(e.target.value) || 0) })}
          slotProps={{ htmlInput: { min: 0, style: { textAlign: 'right', padding: '4px 8px', fontSize: '0.82rem' } } }}
          sx={{ width: 90 }}
        />
      ),
      meta: { headerSx: { textAlign: 'right' }, cellSx: { textAlign: 'right', whiteSpace: 'nowrap' as const } },
    },
    {
      id: 'amount', header: t('page.registerCorrection.col.amount'), size: 100, enableSorting: false,
      cell: ({ row }) => {
        const amount = row.original.qty * row.original.unitPrice
        return (
          <Typography sx={{
            fontSize: '0.82rem', textAlign: 'right', fontWeight: amount < 0 ? 700 : 400,
            color: amount < 0 ? 'error.main' : 'text.primary',
          }}>
            {fmtYen(amount)}
          </Typography>
        )
      },
      meta: { headerSx: { textAlign: 'right' }, cellSx: { textAlign: 'right', whiteSpace: 'nowrap' as const } },
    },
    {
      id: 'tax', header: t('page.registerCorrection.col.tax'), size: 80, enableSorting: false,
      cell: ({ row }) => (
        <Typography sx={{ fontSize: '0.8rem', textAlign: 'right', color: 'text.secondary' }}>
          {fmtYen(taxOf(row.original.qty * row.original.unitPrice))}
        </Typography>
      ),
      meta: { headerSx: { textAlign: 'right' }, cellSx: { textAlign: 'right', whiteSpace: 'nowrap' as const } },
    },
    {
      id: 'actions', header: t('page.registerCorrection.col.actions'), size: 64, enableSorting: false,
      cell: ({ row }) => {
        if (registered) return null
        const line = row.original
        if (line.origin === 'original') {
          return (
            <Tooltip title={t('page.registerCorrection.line.reverseTooltip')} placement="left">
              <IconButton size="small" color="warning" onClick={() => handleReverse(line)}>
                <ReplayIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          )
        }
        return (
          <Tooltip title={t('page.registerCorrection.line.deleteTooltip')} placement="left">
            <IconButton size="small" color="error" onClick={() => handleDeleteLine(line)}>
              <DeleteOutlinedIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        )
      },
      meta: { headerSx: { textAlign: 'center' }, cellSx: { textAlign: 'center' } },
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
  ], [t, registered, lines])

  // ── Render ───────────────────────────────────────────────────────────────────

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, height: '100%' }}>

      {/* 作業の流れガイド（E-18-01〜E-18-02-09）＋TOBE補足 */}
      <Paper variant="outlined" sx={{ p: 1.25, bgcolor: '#f5f8ff', borderColor: '#c5d3f5' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mb: 0.75 }}>
          <InfoOutlinedIcon sx={{ fontSize: '0.85rem', color: 'info.main', flexShrink: 0 }} />
          <Typography sx={{ fontSize: '0.78rem', fontWeight: 600, color: 'text.secondary' }}>
            {t('page.registerCorrection.guide.title')}
          </Typography>
        </Box>
        <Box sx={{ pl: 2 }}>
          {(['s1', 's2', 's3', 's4'] as const).map((key, index) => (
            <Typography key={key} sx={{ fontSize: '0.72rem', color: 'text.secondary' }}>
              {index + 1}. {t(`page.registerCorrection.guide.${key}`)}
            </Typography>
          ))}
        </Box>
        <Divider sx={{ my: 0.75 }} />
        <Typography sx={{ fontSize: '0.72rem', fontWeight: 600, color: 'text.secondary' }}>
          {t('page.registerCorrection.notes.title')}
        </Typography>
        <Box sx={{ pl: 2 }}>
          <Typography sx={{ fontSize: '0.7rem', color: 'text.secondary' }}>
            ・{t('page.registerCorrection.notes.target')}
          </Typography>
          <Typography sx={{ fontSize: '0.7rem', color: 'error.main' }}>
            ・{t('page.registerCorrection.notes.notTarget')}
          </Typography>
          <Typography sx={{ fontSize: '0.7rem', color: 'text.secondary' }}>
            ・{t('page.registerCorrection.notes.kobin')}
          </Typography>
        </Box>
      </Paper>

      {/* E-18-02-02: 担当者コードスキャン */}
      {staffCode ? (
        <Paper variant="outlined" sx={{ p: 1.25, display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
          <BadgeOutlinedIcon sx={{ color: 'primary.main' }} />
          <Typography sx={{ fontSize: '0.85rem' }}>
            {t('page.registerCorrection.staff.label')}: <strong>{staffName}</strong>（{staffCode}）
          </Typography>

          {/* 業務選択済みの条件チップ */}
          {postingDate && (
            <Chip
              size="small" variant="outlined" color="info"
              icon={<CalendarMonthOutlinedIcon />}
              label={t('page.registerCorrection.bizSelect.dateChip', { date: formatYmd(postingDate) })}
            />
          )}
          {bizSelected && (
            <Chip size="small" color="primary" label={t('page.registerCorrection.bizSelect.purchaseFix')} />
          )}
          {slip && (
            <Chip
              size="small" variant="outlined" color="primary"
              icon={<ReceiptLongOutlinedIcon />}
              label={t('page.registerCorrection.slipSearch.slipChip', { slip: slip.slipNumber })}
              sx={{ fontFamily: 'monospace' }}
            />
          )}
          {registered && (
            <Chip size="small" color="warning" label={t('page.registerCorrection.register.registeredChip')} />
          )}

          <Button size="small" sx={{ ml: 'auto' }} disabled={registered} onClick={() => { resetAll(); setStaffCode('') }}>
            {t('page.registerCorrection.staff.change')}
          </Button>
        </Paper>
      ) : (
        <Alert
          severity="warning"
          icon={<QrCodeScannerIcon />}
          sx={{ alignItems: 'center', '& .MuiAlert-message': { flex: 1 } }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
            <Typography sx={{ fontSize: '0.85rem', flex: '0 0 auto' }}>
              {t('page.registerCorrection.staff.scanPrompt')}
            </Typography>
            <OutlinedInput
              size="small"
              autoFocus
              value={staffInput}
              onChange={(e) => setStaffInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleStaffScan()}
              placeholder={t('page.registerCorrection.staff.placeholder')}
              sx={{ width: 260, height: 34, fontSize: '0.85rem', bgcolor: 'background.paper' }}
            />
            <Button size="small" variant="contained" onClick={handleStaffScan} disabled={!staffInput.trim()}>
              {t('page.registerCorrection.staff.authenticate')}
            </Button>
          </Box>
        </Alert>
      )}

      {/* E-18-02-03/04: 業務選択（計上日入力 → 買取訂正） */}
      {staffCode && !bizSelected && (
        <Paper variant="outlined" sx={{ p: 2 }}>
          <Typography sx={{ fontSize: '0.9rem', fontWeight: 700, mb: 1.5 }}>
            {t('page.registerCorrection.bizSelect.title')}
          </Typography>

          <Typography sx={{ fontSize: '0.85rem', mb: 0.75 }}>
            {t('page.registerCorrection.bizSelect.datePrompt')}
          </Typography>
          <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-start', flexWrap: 'wrap', mb: 2 }}>
            <TextField
              size="small"
              inputRef={dateRef}
              label={t('page.registerCorrection.bizSelect.dateLabel')}
              placeholder={t('page.registerCorrection.bizSelect.datePlaceholder', { example: dateExample })}
              value={dateInput}
              onChange={(e) => setDateInput(e.target.value.replace(/[^\d]/g, '').slice(0, 8))}
              onKeyDown={(e) => e.key === 'Enter' && handleDateSubmit()}
              error={!!dateError}
              helperText={dateError || t('page.registerCorrection.bizSelect.dateHelp')}
              sx={{ width: 300 }}
            />
            <Button variant="outlined" onClick={handleDateSubmit} disabled={!dateInput.trim()} sx={{ mt: 0.25 }}>
              Enter
            </Button>
            {postingDate && (
              <Chip
                color="success" variant="outlined"
                icon={<CalendarMonthOutlinedIcon />}
                label={t('page.registerCorrection.bizSelect.dateChip', { date: formatYmd(postingDate) })}
                sx={{ mt: 0.5 }}
              />
            )}
          </Box>

          <Typography sx={{ fontSize: '0.85rem', mb: 0.75 }}>
            {t('page.registerCorrection.bizSelect.bizPrompt')}
          </Typography>
          <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center', flexWrap: 'wrap' }}>
            <Button
              variant="contained" size="large" sx={{ minWidth: 140 }}
              disabled={!postingDate}
              onClick={handlePurchaseFix}
            >
              {t('page.registerCorrection.bizSelect.purchaseFix')}
            </Button>
          </Box>
        </Paper>
      )}

      {/* X-01: 伝票検索 */}
      {bizSelected && !slip && (
        <Paper variant="outlined" sx={{ p: 2 }}>
          <Typography sx={{ fontSize: '0.9rem', fontWeight: 700, mb: 1 }}>
            {t('page.registerCorrection.slipSearch.title')}
          </Typography>
          <Typography sx={{ fontSize: '0.85rem', mb: 1 }}>
            {t('page.registerCorrection.slipSearch.prompt')}
          </Typography>
          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', flexWrap: 'wrap' }}>
            <OutlinedInput
              size="small"
              inputRef={slipRef}
              autoFocus
              value={slipInput}
              onChange={(e) => setSlipInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSlipSearch()}
              placeholder={t('page.registerCorrection.slipSearch.placeholder')}
              startAdornment={
                <InputAdornment position="start">
                  <ReceiptLongOutlinedIcon fontSize="small" sx={{ color: 'text.secondary' }} />
                </InputAdornment>
              }
              sx={{ flex: 1, maxWidth: 420 }}
            />
            <Button variant="contained" startIcon={<SearchIcon />} onClick={handleSlipSearch} disabled={!slipInput.trim()}>
              {t('page.registerCorrection.slipSearch.run')}
            </Button>
          </Box>
        </Paper>
      )}

      {/* SC-L-01: レジ修正［買取訂正］明細修正エリア */}
      {slip && (
        <>
          {/* E-18-02-05: ＜コード＞入力バー */}
          <Paper variant="outlined" sx={{ p: 1.5 }}>
            <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', flexWrap: 'wrap' }}>
              <Typography sx={{ fontSize: '0.85rem', flex: '0 0 auto' }}>
                {t('page.registerCorrection.code.prompt')}
              </Typography>
              <OutlinedInput
                size="small"
                inputRef={codeRef}
                value={codeInput}
                disabled={registered}
                onChange={(e) => setCodeInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleCodeAdd()}
                placeholder={t('page.registerCorrection.code.placeholder')}
                startAdornment={
                  <InputAdornment position="start">
                    <QrCodeScannerIcon fontSize="small" sx={{ color: 'text.secondary' }} />
                  </InputAdornment>
                }
                endAdornment={codeInput ? (
                  <InputAdornment position="end">
                    <IconButton size="small" onClick={() => setCodeInput('')}>
                      <ClearIcon fontSize="small" />
                    </IconButton>
                  </InputAdornment>
                ) : null}
                sx={{ flex: 1, maxWidth: 400 }}
              />
              <Button variant="contained" onClick={handleCodeAdd} disabled={registered || !codeInput.trim()}>
                {t('page.registerCorrection.code.add')}
              </Button>
            </Box>
            <Typography sx={{ fontSize: '0.72rem', color: 'text.secondary', mt: 0.75 }}>
              ※ {t('page.registerCorrection.code.hint')}
            </Typography>
          </Paper>

          {/* 明細テーブル */}
          <AppTable<CorrectionLine>
            data={lines}
            columns={columns}
            getRowId={(row) => row.id}
            stickyHeader
            containerMaxHeight="calc(100vh - 560px)"
            dense
            emptyMessage={
              <Box sx={{ textAlign: 'center', color: 'text.disabled', pt: 3 }}>
                <ReceiptLongOutlinedIcon sx={{ fontSize: 40, mb: 0.5 }} />
                <Typography sx={{ fontSize: '0.9rem', color: 'text.disabled' }}>
                  {t('page.registerCorrection.empty')}
                </Typography>
              </Box>
            }
            tableSx={{ minWidth: 1080 }}
          />

          {/* 合計／差額＋アクションバー（E-18-02-06〜09） */}
          <Paper variant="outlined" sx={{ p: 1, display: 'flex', gap: 1, alignItems: 'center', flexWrap: 'wrap' }}>
            <Button size="small" variant="outlined" color="error" onClick={() => setAbortOpen(true)}>
              {t('page.registerCorrection.abort.button')}
            </Button>

            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', ml: 1, flexWrap: 'wrap' }}>
              <Typography sx={{ fontSize: '0.78rem', color: 'text.secondary' }}>
                {t('page.registerCorrection.summary.qty')}:{' '}
                <strong>{t('page.registerCorrection.summary.points', { n: totalQty })}</strong>
              </Typography>
              <Typography sx={{ fontSize: '0.78rem', color: 'text.secondary' }}>
                {t('page.registerCorrection.summary.amount')}: <strong>{fmtYen(currentTotal)}</strong>
              </Typography>
              <Typography sx={{
                fontSize: '0.78rem', fontWeight: 700,
                color: diff === 0 ? 'text.secondary' : diff > 0 ? 'success.main' : 'error.main',
              }}>
                {t('page.registerCorrection.summary.diff')}: {diff > 0 ? '+' : ''}{fmtYen(diff)}
              </Typography>
            </Box>

            <Box sx={{ ml: 'auto', display: 'flex', gap: 1 }}>
              <Button
                size="small" variant="outlined"
                startIcon={<EditNoteIcon />}
                disabled={!registered}
                onClick={() => setCommentOpen(true)}
              >
                {t('page.registerCorrection.comment.button')}
              </Button>
              <Button
                size="small" variant="contained"
                disabled={registered || !hasChanges}
                onClick={handleRegister}
              >
                {t('page.registerCorrection.register.button')}
              </Button>
            </Box>
          </Paper>
        </>
      )}

      {/* E-18-02-07/08: 理由登録ダイアログ（中止／確定） */}
      <AppModal
        open={commentOpen}
        onClose={() => setCommentOpen(false)}
        title={t('page.registerCorrection.comment.title')}
        maxWidth="sm"
        actions={[
          { label: t('page.registerCorrection.comment.abort'), onClick: () => setCommentOpen(false), color: 'inherit' },
          {
            label: t('page.registerCorrection.comment.confirm'),
            onClick: handleConfirm,
            variant: 'contained',
            disabled: !reason.trim(),
          },
        ]}
      >
        <Typography sx={{ fontSize: '0.85rem', mb: 1.5 }}>
          {t('page.registerCorrection.comment.prompt')}
        </Typography>
        <TextField
          fullWidth multiline minRows={3} autoFocus
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder={t('page.registerCorrection.comment.placeholder')}
        />
      </AppModal>

      {/* 中止確認 */}
      <AppModal
        open={abortOpen}
        onClose={() => setAbortOpen(false)}
        title={t('page.registerCorrection.abort.confirmTitle')}
        actions={[
          { label: t('common.cancel'), onClick: () => setAbortOpen(false), color: 'inherit' },
          { label: t('page.registerCorrection.abort.button'), onClick: handleAbort, variant: 'contained', color: 'error' },
        ]}
      >
        <Typography sx={{ fontSize: '0.85rem' }}>
          {t('page.registerCorrection.abort.confirmMessage')}
        </Typography>
      </AppModal>

      {/* E-18-02-09: 確定 → 帳票出力（レシートプリンタ） */}
      <AppModal
        open={completeOpen}
        onClose={handleCompleteClose}
        title={t('page.registerCorrection.complete.title')}
        actions={[
          { label: t('page.registerCorrection.complete.close'), onClick: handleCompleteClose, variant: 'contained' },
        ]}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
          <TaskAltIcon color="success" />
          <Typography sx={{ fontSize: '0.9rem', fontWeight: 600 }}>
            {t('page.registerCorrection.complete.message')}
          </Typography>
        </Box>
        <Paper variant="outlined" sx={{ mb: 1.5 }}>
          {(['r1', 'r2', 'r3', 'r4'] as const).map((key) => (
            <Box key={key} sx={{
              display: 'flex', alignItems: 'center', gap: 1, px: 1.5, py: 0.75,
              borderBottom: '1px solid', borderColor: 'divider', '&:last-child': { borderBottom: 0 },
            }}>
              <PrintOutlinedIcon sx={{ fontSize: '1rem', color: 'text.secondary' }} />
              <Typography sx={{ fontSize: '0.82rem' }}>
                {t(`page.registerCorrection.complete.${key}`)}
              </Typography>
            </Box>
          ))}
        </Paper>
        <Typography sx={{ fontSize: '0.78rem', color: 'text.secondary' }}>
          {t('page.registerCorrection.complete.reason', { reason })}
        </Typography>
      </AppModal>

      <Snackbar
        open={toast.open}
        autoHideDuration={3500}
        onClose={() => setToast((p) => ({ ...p, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
      >
        <Alert
          severity={toast.severity}
          variant="filled"
          onClose={() => setToast((p) => ({ ...p, open: false }))}
          sx={{ fontSize: '0.85rem' }}
        >
          {toast.message}
        </Alert>
      </Snackbar>
    </Box>
  )
}
