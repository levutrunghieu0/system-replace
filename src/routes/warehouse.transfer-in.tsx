import { createFileRoute } from '@tanstack/react-router'
import { useMemo, useRef, useState } from 'react'
import Alert from '@mui/material/Alert'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Checkbox from '@mui/material/Checkbox'
import Chip from '@mui/material/Chip'
import Dialog from '@mui/material/Dialog'
import FormControlLabel from '@mui/material/FormControlLabel'
import InputAdornment from '@mui/material/InputAdornment'
import MenuItem from '@mui/material/MenuItem'
import OutlinedInput from '@mui/material/OutlinedInput'
import Paper from '@mui/material/Paper'
import Radio from '@mui/material/Radio'
import RadioGroup from '@mui/material/RadioGroup'
import Select from '@mui/material/Select'
import Snackbar from '@mui/material/Snackbar'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import Typography from '@mui/material/Typography'
import DocumentScannerOutlinedIcon from '@mui/icons-material/DocumentScannerOutlined'
import FiberManualRecordIcon from '@mui/icons-material/FiberManualRecord'
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined'
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown'
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp'
import PrintOutlinedIcon from '@mui/icons-material/PrintOutlined'
import QrCodeScannerIcon from '@mui/icons-material/QrCodeScanner'
import SearchIcon from '@mui/icons-material/Search'
import { useTranslation } from 'react-i18next'
import { useLayoutConfig } from '../hooks/useLayoutConfig'
import { AppTableContainer } from '../components/table'
import { QuantityStepper } from '../components/QuantityStepper'

export const Route = createFileRoute('/warehouse/transfer-in')({
  component: TransferInPage,
})

// ─── Types ────────────────────────────────────────────────────────────────────

type Phase =
  | 'mode'            // 機能選択
  | 'bulk'            // 伝票一括モード
  | 'individualSlip'  // 個別：納品伝票スキャン
  | 'individualItems' // 個別：商品スキャン検品
type Mode = 'bulk' | 'individual'

interface PlannedItem {
  jan: string
  category: string    // シューズ など
  maker: string
  productName: string
  size: string
  type: string        // リユース など
  condition: string   // 中古A / 新品 など
  plannedQty: number
  unitPrice: number
  lastUpdated: string // 最終更新日
}

interface BulkSlipRow {
  id: string
  no: number
  slipNumber: string
  supplierCode: string
  supplierName: string
  totalPoints: number
  scheduledDate: string
  amount: number
  status: string
  inboundSlipNumber: string
}

interface ScanItem {
  id: string
  no: number
  jan: string
  category: string
  maker: string
  productName: string
  size: string
  type: string
  condition: string   // 編集可
  unitPrice: number   // 編集可（売価）
  qty: number         // 編集可（数量）
  reason: string      // 廃棄理由タグ
  lastUpdated: string
}

// ─── Mock master data ───────────────────────────────────────────────────────

const CONDITIONS = ['新品', '中古A', '中古B', '中古C', 'ジャンク']

// 納品伝票番号（スキャン用）→ 出荷元 + サマリ + 明細
const SLIP_MASTER: Record<
  string,
  { source: string; supplierCode: string; scheduledDate: string; items: PlannedItem[] }
> = {
  '12345678': {
    source: 'サンプルテキスト店',
    supplierCode: '00651',
    scheduledDate: '2026/02/25',
    items: [
      { jan: '12345678901234578', category: 'シューズ', maker: 'ナイキ', productName: 'Nike Zoom Vomero 5', size: 'メンズ / 25cm', type: 'リユース', condition: '中古A', plannedQty: 5, unitPrice: 10000000, lastUpdated: '2026/1/23' },
    ],
  },
  '90088123': {
    source: '東京中央店',
    supplierCode: '001',
    scheduledDate: '2026/02/25',
    items: [
      { jan: '2300000000018', category: 'シューズ', maker: 'NIKE', productName: 'エアフォース1', size: '27.5cm / WHT', type: 'リユース', condition: '中古A', plannedQty: 1, unitPrice: 12800, lastUpdated: '2026/1/23' },
      { jan: '2300000000025', category: '衣料', maker: 'LACOSTE', productName: 'ポロシャツ', size: 'M / WHT', type: 'リユース', condition: '中古A', plannedQty: 1, unitPrice: 8500, lastUpdated: '2026/1/23' },
      { jan: '2300000000032', category: '衣料', maker: 'GAP', productName: 'デニムパンツ', size: 'M / BLK', type: 'リユース', condition: '中古B', plannedQty: 1, unitPrice: 3900, lastUpdated: '2026/1/23' },
      { jan: '2300000000049', category: 'シューズ', maker: 'REDWING', productName: 'ワークブーツ', size: '27cm', type: 'リユース', condition: '中古A', plannedQty: 1, unitPrice: 45000, lastUpdated: '2026/1/23' },
    ],
  },
  '90088124': {
    source: '大阪梅田店',
    supplierCode: '005',
    scheduledDate: '2026/02/25',
    items: [
      { jan: '4582412345678', category: 'シューズ', maker: 'RED WING', productName: 'CLASSIC WORK / ROUND-TOE', size: 'US9.5', type: 'リユース', condition: '中古A', plannedQty: 6, unitPrice: 19000, lastUpdated: '2026/1/23' },
      { jan: '4582412345685', category: 'シューズ', maker: 'NEW BALANCE', productName: '996 / GRY', size: '26.0cm', type: 'リユース', condition: '中古B', plannedQty: 6, unitPrice: 6000, lastUpdated: '2026/1/23' },
    ],
  },
}

function slipQty(slip: string): number {
  return SLIP_MASTER[slip]?.items.reduce((s, i) => s + i.plannedQty, 0) ?? 0
}
function slipAmount(slip: string): number {
  return SLIP_MASTER[slip]?.items.reduce((s, i) => s + i.unitPrice * i.plannedQty, 0) ?? 0
}

let scanSeq = 0
function makeScanRow(it: PlannedItem, idx: number): ScanItem {
  scanSeq += 1
  return {
    id: `${it.jan}-${scanSeq}`, no: idx + 1, jan: it.jan, category: it.category,
    maker: it.maker, productName: it.productName, size: it.size, type: it.type,
    condition: it.condition, unitPrice: it.unitPrice, qty: 1, reason: '品質劣化',
    lastUpdated: it.lastUpdated,
  }
}

// ─── Mode card ───────────────────────────────────────────────────────────────

interface ModeCardProps {
  title: string
  icon: React.ReactNode
  onClick: () => void
}

function ModeCard({ title, icon, onClick }: ModeCardProps) {
  return (
    <Paper
      elevation={0}
      onClick={onClick}
      sx={{
        width: 230, height: 230, borderRadius: 2, cursor: 'pointer',
        border: '1px solid', borderColor: '#cfe0f5',
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        gap: 2.5, textAlign: 'center', transition: 'all .15s',
        '&:hover': { borderColor: 'primary.main', boxShadow: 3 },
      }}
    >
      <Box sx={{ color: 'primary.main', display: 'flex' }}>{icon}</Box>
      <Typography sx={{ fontSize: '1.05rem', fontWeight: 700 }}>{title}</Typography>
    </Paper>
  )
}

// ─── 手持ちスキャナーアイコン（伝票バーコード読み取りイメージ）──────────────

function ScanGunIcon({ size = 76 }: { size?: number }) {
  return (
    <svg
      width={size} height={size} viewBox="0 0 64 64" fill="none"
      stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"
    >
      {/* スキャナー本体 */}
      <path d="M12 32 L33 20 L43 26 L22 38 Z" />
      {/* 本体の読み取り面 */}
      <path d="M19 31 L33 23" />
      {/* グリップ */}
      <path d="M22 38 L18 50 L25 53 L30 41" />
      {/* 読み取り波 */}
      <path d="M45 16 q4 2.5 4 6.5" />
      <path d="M49 12 q8 3.5 8 12" />
    </svg>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

function TransferInPage() {
  const { t } = useTranslation()

  const slipInputRef = useRef<HTMLInputElement>(null)
  const itemInputRef = useRef<HTMLInputElement>(null)

  const [phase, setPhase] = useState<Phase>('mode')
  const [mode, setMode] = useState<Mode>('individual')

  // 伝票一括モード
  const [bulkSlipInput, setBulkSlipInput] = useState('')
  const [bulkRows, setBulkRows] = useState<BulkSlipRow[]>([])
  const [bulkSelected, setBulkSelected] = useState<Record<string, boolean>>({})

  // 個別スキャン検品モード
  const [indSlipInput, setIndSlipInput] = useState('')
  const [activeSlip, setActiveSlip] = useState<string | null>(null)
  const [source, setSource] = useState('')
  const [itemInput, setItemInput] = useState('')
  const [scanItems, setScanItems] = useState<ScanItem[]>([])
  const [scanSelected, setScanSelected] = useState<Record<string, boolean>>({})

  // Dialogs
  const [mismatchOpen, setMismatchOpen] = useState(false)
  const [priceConfirmOpen, setPriceConfirmOpen] = useState(false)
  const [printOpen, setPrintOpen] = useState(false)
  const [completeOpen, setCompleteOpen] = useState(false)
  type LabelType =
    | 'auto'
    | 'tagV' | 'tagH' | 'showcaseV' | 'sealV' | 'sealH' | 'sealShort' | 'cardL' | 'cardLOver'
    | 'perItem'
  const [labelType, setLabelType] = useState<LabelType>('auto')

  const [toast, setToast] = useState<{ open: boolean; message: string; severity: 'success' | 'warning' }>({
    open: false, message: '', severity: 'success',
  })
  const showToast = (message: string, severity: 'success' | 'warning' = 'success') =>
    setToast({ open: true, message, severity })

  // 画面に応じたタイトル（アプリヘッダーに表示）
  const phaseTitle =
    phase === 'bulk' ? t('page.transferIn.bulk.title')
    : phase === 'individualSlip' || phase === 'individualItems' ? t('page.transferIn.individual.title')
    : t('page.transferIn.title')

  useLayoutConfig({
    title: phaseTitle,
    showBackButton: phase !== 'mode',
    onBack: () => setPhase('mode'),
  })

  // 入力点数（数量合計）と予定点数
  const scannedTotal = useMemo(() => scanItems.reduce((s, i) => s + i.qty, 0), [scanItems])
  const plannedTotal = useMemo(
    () => (activeSlip ? SLIP_MASTER[activeSlip]?.items.reduce((s, i) => s + i.plannedQty, 0) ?? 0 : 0),
    [activeSlip],
  )
  const bulkSelectedCount = useMemo(() => bulkRows.filter((r) => bulkSelected[r.id]).length, [bulkRows, bulkSelected])
  const scanSelectedCount = useMemo(() => scanItems.filter((r) => scanSelected[r.id]).length, [scanItems, scanSelected])

  // ── 機能選択 ───────────────────────────────────────────────────────────────

  const handleSelectBulk = () => {
    setMode('bulk')
    setBulkRows([])
    setBulkSelected({})
    setBulkSlipInput('')
    setPhase('bulk')
  }

  const handleSelectIndividual = () => {
    setMode('individual')
    setActiveSlip(null)
    setScanItems([])
    setScanSelected({})
    setIndSlipInput('')
    setPhase('individualSlip')
    setTimeout(() => slipInputRef.current?.focus(), 80)
  }

  // ── 伝票一括モード ─────────────────────────────────────────────────────────

  const handleBulkSlipScan = () => {
    const slip = bulkSlipInput.trim()
    if (!slip) return
    const master = SLIP_MASTER[slip]
    if (!master) {
      showToast(t('page.transferIn.bulk.slipNotFound'), 'warning')
      return
    }
    if (bulkRows.some((r) => r.slipNumber === slip)) {
      showToast(t('page.transferIn.bulk.slipDuplicate'), 'warning')
      setBulkSlipInput('')
      return
    }
    setBulkRows((prev) => [
      ...prev,
      {
        id: `${slip}-${Date.now()}`, no: prev.length + 1, slipNumber: slip,
        supplierCode: master.supplierCode, supplierName: master.source,
        totalPoints: slipQty(slip), scheduledDate: master.scheduledDate, amount: slipAmount(slip),
        status: t('page.transferIn.bulk.statusWaiting'), inboundSlipNumber: '',
      },
    ])
    setBulkSlipInput('')
  }

  const handleBulkDeleteSelected = () => {
    setBulkRows((prev) => prev.filter((r) => !bulkSelected[r.id]).map((r, i) => ({ ...r, no: i + 1 })))
    setBulkSelected({})
  }

  // サンプル：動作確認用にサンプル伝票を読み込む
  const handleBulkSample = () => {
    const samples = Object.keys(SLIP_MASTER).filter((s) => !bulkRows.some((r) => r.slipNumber === s))
    if (samples.length === 0) return
    setBulkRows((prev) => [
      ...prev,
      ...samples.map((slip, i) => {
        const master = SLIP_MASTER[slip]
        return {
          id: `${slip}-${Date.now()}-${i}`, no: prev.length + i + 1, slipNumber: slip,
          supplierCode: master.supplierCode, supplierName: master.source,
          totalPoints: slipQty(slip), scheduledDate: master.scheduledDate, amount: slipAmount(slip),
          status: t('page.transferIn.bulk.statusWaiting'), inboundSlipNumber: '',
        }
      }),
    ])
  }

  // 伝票一括は取扱データが膨大なため、プライス発行はしない。入荷伝票番号を採番し完了ダイアログ表示
  const handleBulkRegister = () => {
    if (bulkRows.length === 0) return
    setMode('bulk')
    setBulkRows((prev) => prev.map((r) => ({ ...r, inboundSlipNumber: `IN${Date.now().toString().slice(-8)}` })))
    openComplete()
  }

  // ── 個別スキャン検品モード ───────────────────────────────────────────────

  // 伝票スキャン後は空の検品リストから開始（スキャンで積み上げる）
  const openScanInspection = (slip: string, src: string) => {
    setActiveSlip(slip)
    setSource(src)
    setScanItems([])
    setScanSelected({})
    setPhase('individualItems')
    setTimeout(() => itemInputRef.current?.focus(), 80)
  }

  const handleIndividualSlipScan = () => {
    const slip = indSlipInput.trim()
    if (!slip) return
    const master = SLIP_MASTER[slip]
    if (!master) {
      showToast(t('page.transferIn.individual.slipNotFound'), 'warning')
      return
    }
    setIndSlipInput('')
    openScanInspection(slip, master.source)
  }

  const handleItemScan = () => {
    const jan = itemInput.trim()
    if (!jan || !activeSlip) return
    const planned = SLIP_MASTER[activeSlip]?.items.find((i) => i.jan === jan)
    if (!planned) {
      showToast(t('page.transferIn.individual.notInSlip'), 'warning')
      setItemInput('')
      return
    }
    setScanItems((prev) => [...prev, makeScanRow(planned, prev.length)])
    setItemInput('')
    setTimeout(() => itemInputRef.current?.focus(), 0)
  }

  // サンプル：予定明細を一括で検品リストへ
  const handleIndividualSample = () => {
    if (!activeSlip) return
    const items = SLIP_MASTER[activeSlip]?.items ?? []
    const rows: ScanItem[] = []
    items.forEach((it) => {
      for (let q = 0; q < it.plannedQty; q++) rows.push(makeScanRow(it, rows.length))
    })
    setScanItems(rows)
  }

  const updateScanItem = (id: string, patch: Partial<ScanItem>) => {
    setScanItems((prev) => prev.map((i) => (i.id === id ? { ...i, ...patch } : i)))
  }

  const handleScanDeleteSelected = () => {
    setScanItems((prev) => prev.filter((i) => !scanSelected[i.id]).map((r, idx) => ({ ...r, no: idx + 1 })))
    setScanSelected({})
  }

  const handleIndividualRegister = () => {
    if (scanItems.length === 0) return
    if (scannedTotal !== plannedTotal) {
      setMismatchOpen(true)
      return
    }
    setPriceConfirmOpen(true)
  }

  // 伝票内容の確認「登録」→ プライス発行確認へ
  const handleMismatchProceed = () => {
    setMismatchOpen(false)
    setPriceConfirmOpen(true)
  }

  // プライス発行「はい」→ ラベル選択、「いいえ」→ そのまま完了
  const handlePriceYes = () => {
    setPriceConfirmOpen(false)
    setLabelType('auto')
    setPrintOpen(true)
  }
  const handlePriceNo = () => {
    setPriceConfirmOpen(false)
    openComplete()
  }
  const handlePrintExec = () => {
    setPrintOpen(false)
    showToast(t('page.transferIn.print.done'))
    openComplete()
  }

  // ── 完了ダイアログ（戻る/継続）img128 ─────────────────────────────────────

  const openComplete = () => setCompleteOpen(true)

  // はい：TOP（機能選択）まで戻る
  const handleCompleteReturnTop = () => {
    setCompleteOpen(false)
    setScanItems([])
    setScanSelected({})
    setBulkRows([])
    setBulkSelected({})
    setActiveSlip(null)
    setPhase('mode')
  }
  // 引き続き登録：同じモードで継続（一括は伝票一括、個別は納品伝票スキャンから）
  const handleCompleteContinue = () => {
    setCompleteOpen(false)
    setScanItems([])
    setScanSelected({})
    setActiveSlip(null)
    if (mode === 'bulk') {
      setBulkRows([])
      setBulkSelected({})
      setBulkSlipInput('')
      setPhase('bulk')
      return
    }
    setIndSlipInput('')
    setPhase('individualSlip')
    setTimeout(() => slipInputRef.current?.focus(), 80)
  }

  // ─────────────────────────────────────────────────────────────────────────

  const hSx = {
    fontWeight: 700, fontSize: '0.78rem', color: 'text.secondary',
    bgcolor: 'grey.50', whiteSpace: 'nowrap' as const, py: 0.75,
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, height: '100%', minHeight: 0 }}>

      {/* ════ 機能選択（2カード）════════════════════════════════════════════════ */}
      {phase === 'mode' && (
        <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Box sx={{ display: 'flex', gap: 4, flexWrap: 'wrap', justifyContent: 'center' }}>
            <ModeCard
              title={t('page.transferIn.mode.bulkTitle')}
              icon={<DocumentScannerOutlinedIcon sx={{ fontSize: 56 }} />}
              onClick={handleSelectBulk}
            />
            <ModeCard
              title={t('page.transferIn.mode.individualTitle')}
              icon={<QrCodeScannerIcon sx={{ fontSize: 56 }} />}
              onClick={handleSelectIndividual}
            />
          </Box>
        </Box>
      )}

      {/* ════ 移動入荷（伝票一括入荷）═══════════════════════════════════════════ */}
      {phase === 'bulk' && (
        <>
          {/* 伝票スキャン入力（全幅・アイコンは右） */}
          <OutlinedInput
            size="small" autoFocus value={bulkSlipInput}
            onChange={(e) => setBulkSlipInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleBulkSlipScan()}
            placeholder={t('page.transferIn.bulk.slipPlaceholder')}
            startAdornment={
              <InputAdornment position="start">
                <SearchIcon fontSize="small" sx={{ color: 'text.disabled' }} />
              </InputAdornment>
            }
            endAdornment={
              <InputAdornment position="end">
                <QrCodeScannerIcon fontSize="small" sx={{ color: 'text.secondary' }} />
              </InputAdornment>
            }
            sx={{ flexShrink: 0, width: 360, maxWidth: '100%', height: 42, fontSize: '0.9rem', bgcolor: 'background.paper' }}
          />

          {bulkRows.length === 0 ? (
            // 空：スキャン待ち（手持ちスキャナーのイメージ）— 必ずスキャン（選択不可）
            <Paper
              variant="outlined"
              sx={{
                flex: 1, minHeight: 0, borderRadius: 2,
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                gap: 1, color: 'text.disabled',
              }}
            >
              <ScanGunIcon size={84} />
              <Typography sx={{ fontSize: '1.05rem', fontWeight: 700, color: 'text.secondary', mt: 1 }}>
                {t('page.transferIn.bulk.emptyScanTitle')}
              </Typography>
              <Typography sx={{ fontSize: '0.82rem' }}>{t('page.transferIn.bulk.emptyScanSub')}</Typography>
            </Paper>
          ) : (
            <Box sx={{ flex: 1, minHeight: 0, overflow: 'hidden', '& > .MuiPaper-root': { height: '100%' } }}>
              <AppTableContainer stickyHeader maxHeight="100%">
                <Table size="small" stickyHeader>
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ ...hSx, width: 50, textAlign: 'center' }}>{t('page.transferIn.bulk.col.no')}</TableCell>
                      <TableCell sx={{ ...hSx, width: 56, textAlign: 'center' }}>{t('page.transferIn.bulk.col.select')}</TableCell>
                      <TableCell sx={hSx}>{t('page.transferIn.bulk.col.slipNumber')}</TableCell>
                      <TableCell sx={{ ...hSx, width: 110 }}>{t('page.transferIn.bulk.col.supplierCode')}</TableCell>
                      <TableCell sx={hSx}>{t('page.transferIn.bulk.col.supplierName')}</TableCell>
                      <TableCell sx={{ ...hSx, width: 100, textAlign: 'right' }}>{t('page.transferIn.bulk.col.totalPoints')}</TableCell>
                      <TableCell sx={{ ...hSx, width: 130 }}>{t('page.transferIn.bulk.col.scheduledDate')}</TableCell>
                      <TableCell sx={{ ...hSx, width: 130, textAlign: 'right' }}>{t('page.transferIn.bulk.col.amount')}</TableCell>
                      <TableCell sx={{ ...hSx, width: 100, textAlign: 'center' }}>{t('page.transferIn.bulk.col.status')}</TableCell>
                      <TableCell sx={{ ...hSx, width: 130, textAlign: 'center' }}>{t('page.transferIn.bulk.col.inboundSlipNumber')}</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {bulkRows.map((row) => (
                      <TableRow key={row.id} hover selected={!!bulkSelected[row.id]}>
                        <TableCell sx={{ fontSize: '0.82rem', textAlign: 'center', color: 'text.secondary' }}>
                          {String(row.no).padStart(3, '0')}
                        </TableCell>
                        <TableCell sx={{ textAlign: 'center', py: 0 }}>
                          <Checkbox
                            size="small"
                            checked={!!bulkSelected[row.id]}
                            onChange={(e) => setBulkSelected((prev) => ({ ...prev, [row.id]: e.target.checked }))}
                          />
                        </TableCell>
                        <TableCell sx={{ fontSize: '0.82rem', fontFamily: 'monospace' }}>{row.slipNumber}</TableCell>
                        <TableCell sx={{ fontSize: '0.82rem' }}>{row.supplierCode}</TableCell>
                        <TableCell sx={{ fontSize: '0.82rem' }}>{row.supplierName}</TableCell>
                        <TableCell sx={{ fontSize: '0.82rem', textAlign: 'right', fontFamily: 'monospace' }}>{row.totalPoints.toLocaleString()}</TableCell>
                        <TableCell sx={{ fontSize: '0.82rem' }}>{row.scheduledDate}</TableCell>
                        <TableCell sx={{ fontSize: '0.82rem', textAlign: 'right', fontFamily: 'monospace' }}>¥{row.amount.toLocaleString()}</TableCell>
                        <TableCell sx={{ textAlign: 'center' }}>
                          {row.inboundSlipNumber ? (
                            <Chip label={t('page.transferIn.list.typeInbound')} size="small" color="success" sx={{ fontSize: '0.72rem', height: 22 }} />
                          ) : (
                            <Chip label={row.status} size="small"
                              sx={{ fontSize: '0.72rem', height: 22, bgcolor: '#fff3e0', color: '#e65100', fontWeight: 600 }} />
                          )}
                        </TableCell>
                        <TableCell sx={{ textAlign: 'center' }}>
                          {row.inboundSlipNumber ? (
                            <Typography sx={{ fontSize: '0.82rem', fontFamily: 'monospace', color: 'success.main' }}>{row.inboundSlipNumber}</Typography>
                          ) : (
                            <Chip label={row.status} size="small"
                              sx={{ fontSize: '0.72rem', height: 22, bgcolor: '#fff3e0', color: '#e65100', fontWeight: 600 }} />
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </AppTableContainer>
            </Box>
          )}

          {/* 下部アクションバー：作業を中止 / 選択項目削除（左）／ サンプル・入荷登録（右）*/}
          <Paper variant="outlined" sx={{ p: 1, display: 'flex', alignItems: 'center', gap: 1, flexShrink: 0 }}>
            <Button variant="outlined" color="inherit" onClick={() => setPhase('mode')}>
              {t('page.transferIn.bulk.abort')}
            </Button>
            <Button variant="outlined" color="inherit" disabled={bulkSelectedCount === 0} onClick={handleBulkDeleteSelected}>
              {t('page.transferIn.bulk.deleteSelected')}{bulkSelectedCount > 0 ? `（${bulkSelectedCount}）` : ''}
            </Button>
            {bulkRows.length === 0 ? (
              <Button variant="outlined" color="inherit" sx={{ ml: 'auto' }} onClick={handleBulkSample}>
                {t('page.transferIn.bulk.sample')}
              </Button>
            ) : (
              <Button variant="contained" sx={{ ml: 'auto' }} onClick={handleBulkRegister}>
                {t('page.transferIn.bulk.register')}
              </Button>
            )}
          </Paper>
        </>
      )}

      {/* ════ 個別スキャン：納品伝票スキャン（image2 レイアウト）════════════════ */}
      {phase === 'individualSlip' && (
        <>
          {/* 納品伝票スキャン入力（全幅・アイコンは右） */}
          <OutlinedInput
            size="small" inputRef={slipInputRef} autoFocus value={indSlipInput}
            onChange={(e) => setIndSlipInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleIndividualSlipScan()}
            placeholder={t('page.transferIn.individual.slipPlaceholder')}
            startAdornment={
              <InputAdornment position="start">
                <SearchIcon fontSize="small" sx={{ color: 'text.disabled' }} />
              </InputAdornment>
            }
            endAdornment={
              <InputAdornment position="end">
                <QrCodeScannerIcon fontSize="small" sx={{ color: 'text.secondary' }} />
              </InputAdornment>
            }
            sx={{ flexShrink: 0, width: 360, maxWidth: '100%', height: 42, fontSize: '0.9rem', bgcolor: 'background.paper' }}
          />

          {/* スキャン待ち（手持ちスキャナーのイメージ）*/}
          <Paper
            variant="outlined"
            sx={{
              flex: 1, minHeight: 0, borderRadius: 2,
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
              gap: 1, color: 'text.disabled',
            }}
          >
            <ScanGunIcon size={84} />
            <Typography sx={{ fontSize: '1.05rem', fontWeight: 700, color: 'text.secondary', mt: 1 }}>
              {t('page.transferIn.bulk.emptyScanTitle')}
            </Typography>
            <Typography sx={{ fontSize: '0.82rem' }}>{t('page.transferIn.bulk.emptyScanSub')}</Typography>
          </Paper>

          {/* 下部アクションバー：作業を中止 / 選択項目削除 / サンプル */}
          <Paper variant="outlined" sx={{ p: 1, display: 'flex', alignItems: 'center', gap: 1, flexShrink: 0 }}>
            <Button variant="outlined" color="inherit" onClick={() => setPhase('mode')}>
              {t('page.transferIn.individual.abort')}
            </Button>
            <Button variant="outlined" color="inherit" disabled>
              {t('page.transferIn.individual.deleteSelected')}
            </Button>
            <Button variant="outlined" color="inherit" sx={{ ml: 'auto' }} onClick={() => openScanInspection('12345678', SLIP_MASTER['12345678'].source)}>
              {t('page.transferIn.individual.sample')}
            </Button>
          </Paper>
        </>
      )}

      {/* ════ 移動入荷（個別スキャン検品）═══════════════════════════════════════ */}
      {phase === 'individualItems' && (
        <>
          {/* 出荷元・伝票番号 */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexShrink: 0 }}>
            <Typography sx={{ fontSize: '0.82rem', color: 'text.secondary', flex: 1 }}>
              {t('page.transferIn.individual.sourceLabel')}: <strong>{source}</strong>
              {' | '}
              {t('page.transferIn.individual.slipLabel')}: <strong style={{ fontFamily: 'monospace' }}>{activeSlip}</strong>
            </Typography>
          </Box>

          {/* 商品スキャン入力（全幅・アイコンは右） */}
          <OutlinedInput
            size="small" inputRef={itemInputRef} autoFocus value={itemInput}
            onChange={(e) => setItemInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleItemScan()}
            placeholder={t('page.transferIn.individual.scanPlaceholder')}
            startAdornment={
              <InputAdornment position="start">
                <SearchIcon fontSize="small" sx={{ color: 'text.disabled' }} />
              </InputAdornment>
            }
            endAdornment={
              <InputAdornment position="end">
                <QrCodeScannerIcon fontSize="small" sx={{ color: 'text.secondary' }} />
              </InputAdornment>
            }
            sx={{ flexShrink: 0, width: 360, maxWidth: '100%', height: 42, fontSize: '0.9rem', bgcolor: 'background.paper' }}
          />

          {scanItems.length === 0 ? (
            // 空：スキャン待ち（手持ちスキャナーのイメージ）
            <Paper
              variant="outlined"
              sx={{
                flex: 1, minHeight: 0, borderRadius: 2,
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                gap: 1, color: 'text.disabled',
              }}
            >
              <ScanGunIcon size={84} />
              <Typography sx={{ fontSize: '1.05rem', fontWeight: 700, color: 'text.secondary', mt: 1 }}>
                {t('page.transferIn.bulk.emptyScanTitle')}
              </Typography>
              <Typography sx={{ fontSize: '0.82rem' }}>{t('page.transferIn.individual.emptyScanSub')}</Typography>
            </Paper>
          ) : (
            <Box sx={{ flex: 1, minHeight: 0, overflow: 'hidden', '& > .MuiPaper-root': { height: '100%' } }}>
              <AppTableContainer stickyHeader maxHeight="100%">
                <Table size="small" stickyHeader>
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ ...hSx, width: 50, textAlign: 'center' }}>{t('page.transferIn.individual.col.no')}</TableCell>
                      <TableCell sx={{ ...hSx, width: 56, textAlign: 'center' }}>{t('page.transferIn.individual.col.select')}</TableCell>
                      <TableCell sx={hSx}>{t('page.transferIn.individual.col.productInfo')}</TableCell>
                      <TableCell sx={{ ...hSx, width: 96, textAlign: 'center' }}>{t('page.transferIn.individual.col.type')}</TableCell>
                      <TableCell sx={{ ...hSx, width: 110, textAlign: 'center' }}>{t('page.transferIn.individual.col.condition')}</TableCell>
                      <TableCell sx={{ ...hSx, width: 160 }}>{t('page.transferIn.individual.col.code')}</TableCell>
                      <TableCell sx={{ ...hSx, width: 150, textAlign: 'right' }}>{t('page.transferIn.individual.col.price')}</TableCell>
                      <TableCell sx={{ ...hSx, width: 120, textAlign: 'center' }}>{t('page.transferIn.individual.col.qty')}</TableCell>
                      <TableCell sx={{ ...hSx, width: 130, textAlign: 'center' }}>{t('page.transferIn.individual.col.reason')}</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {scanItems.map((item) => (
                      <TableRow key={item.id} hover selected={!!scanSelected[item.id]}>
                        <TableCell sx={{ fontSize: '0.82rem', textAlign: 'center', color: 'text.secondary' }}>
                          {String(item.no).padStart(3, '0')}
                        </TableCell>
                        <TableCell sx={{ textAlign: 'center', py: 0 }}>
                          <Checkbox
                            size="small"
                            checked={!!scanSelected[item.id]}
                            onChange={(e) => setScanSelected((prev) => ({ ...prev, [item.id]: e.target.checked }))}
                          />
                        </TableCell>
                        {/* 商品情報：サムネイル + カテゴリ + メーカー + 商品名 + サイズ */}
                        <TableCell sx={{ py: 0.5 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Box sx={{ width: 40, height: 40, borderRadius: 1, bgcolor: 'grey.200', flexShrink: 0 }} />
                            <Box sx={{ minWidth: 0 }}>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                <Chip label={item.category} size="small"
                                  sx={{ bgcolor: 'grey.200', color: 'text.secondary', fontSize: '0.66rem', height: 18 }} />
                                <Typography sx={{ fontSize: '0.72rem', color: 'text.secondary' }}>{item.maker}</Typography>
                              </Box>
                              <Typography sx={{ fontSize: '0.82rem', lineHeight: 1.3 }}>{item.productName}</Typography>
                              <Typography sx={{ fontSize: '0.72rem', color: 'text.secondary' }}>{item.size}</Typography>
                            </Box>
                          </Box>
                        </TableCell>
                        {/* タイプ（リユース：オレンジ） */}
                        <TableCell sx={{ textAlign: 'center' }}>
                          <Chip label={item.type} size="small"
                            sx={{ bgcolor: '#fff3e0', color: '#e65100', fontWeight: 600, fontSize: '0.72rem', height: 22 }} />
                        </TableCell>
                        {/* 状態（編集可） */}
                        <TableCell sx={{ textAlign: 'center' }}>
                          <Select
                            size="small" value={item.condition}
                            onChange={(e) => updateScanItem(item.id, { condition: e.target.value })}
                            sx={{ fontSize: '0.8rem', height: 30, '& .MuiSelect-select': { py: 0.25, px: 1 } }}
                          >
                            {CONDITIONS.map((c) => (
                              <MenuItem key={c} value={c} sx={{ fontSize: '0.82rem' }}>{c}</MenuItem>
                            ))}
                          </Select>
                        </TableCell>
                        {/* コード + 最終更新日 */}
                        <TableCell sx={{ fontFamily: 'monospace' }}>
                          <Typography sx={{ fontSize: '0.8rem', fontFamily: 'monospace' }}>{item.jan}</Typography>
                          <Typography sx={{ fontSize: '0.66rem', color: 'text.disabled' }}>最終更新日 {item.lastUpdated}</Typography>
                        </TableCell>
                        {/* 売価（編集可・上下）+ 最終更新日 */}
                        <TableCell sx={{ textAlign: 'right' }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 0.5 }}>
                            <Typography sx={{ fontSize: '0.85rem', fontWeight: 700, fontFamily: 'monospace' }}>
                              ¥{item.unitPrice.toLocaleString()}
                            </Typography>
                            <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                              <KeyboardArrowUpIcon
                                onClick={() => updateScanItem(item.id, { unitPrice: item.unitPrice + 1000 })}
                                sx={{ fontSize: '1rem', cursor: 'pointer', color: 'text.secondary', '&:hover': { color: 'primary.main' } }}
                              />
                              <KeyboardArrowDownIcon
                                onClick={() => updateScanItem(item.id, { unitPrice: Math.max(0, item.unitPrice - 1000) })}
                                sx={{ fontSize: '1rem', cursor: 'pointer', color: 'text.secondary', '&:hover': { color: 'primary.main' } }}
                              />
                            </Box>
                          </Box>
                          <Typography sx={{ fontSize: '0.66rem', color: 'text.disabled' }}>最終更新日 {item.lastUpdated}</Typography>
                        </TableCell>
                        {/* 数量（編集可） */}
                        <TableCell sx={{ textAlign: 'center' }}>
                          <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                            <QuantityStepper compact value={item.qty} min={1} onChange={(q) => updateScanItem(item.id, { qty: q })} />
                          </Box>
                        </TableCell>
                        {/* 廃棄理由タグ（先頭は丸印）*/}
                        <TableCell sx={{ textAlign: 'center' }}>
                          <Chip
                            icon={<FiberManualRecordIcon sx={{ fontSize: '0.6rem !important', color: 'text.disabled' }} />}
                            label={item.reason}
                            size="small" variant="outlined"
                            sx={{ fontSize: '0.72rem', height: 24 }}
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </AppTableContainer>
            </Box>
          )}

          {/* 下部アクションバー：作業を中止 / 選択項目削除（左）／ サンプル・入荷登録（右）*/}
          <Paper variant="outlined" sx={{ p: 1, display: 'flex', alignItems: 'center', gap: 1, flexShrink: 0 }}>
            <Button variant="outlined" color="inherit" onClick={() => setPhase('mode')}>
              {t('page.transferIn.individual.abort')}
            </Button>
            <Button variant="outlined" color="inherit" disabled={scanSelectedCount === 0} onClick={handleScanDeleteSelected}>
              {t('page.transferIn.individual.deleteSelected')}{scanSelectedCount > 0 ? `（${scanSelectedCount}）` : ''}
            </Button>
            {scanItems.length === 0 ? (
              <Button variant="outlined" color="inherit" sx={{ ml: 'auto' }} onClick={handleIndividualSample}>
                {t('page.transferIn.individual.sample')}
              </Button>
            ) : (
              <Button variant="contained" sx={{ ml: 'auto' }} onClick={handleIndividualRegister}>
                {t('page.transferIn.individual.register')}
              </Button>
            )}
          </Paper>
        </>
      )}
      {/* ════ ダイアログ ═══════════════════════════════════════════════════════ */}

      {/* 伝票内容の確認（中央寄せ・(i)アイコン・入力点数 X/Y）*/}
      <Dialog
        open={mismatchOpen}
        maxWidth="xs"
        onClose={() => setMismatchOpen(false)}
        slotProps={{ paper: { sx: { borderRadius: 3, px: 2, py: 1, minWidth: 380 } } }}
      >
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1.5, pt: 3, px: 3 }}>
          <InfoOutlinedIcon sx={{ fontSize: 46, color: 'text.primary' }} />
          <Typography sx={{ fontSize: '1rem', fontWeight: 700 }}>{t('page.transferIn.mismatch.title')}</Typography>
          <Typography sx={{ fontSize: '0.88rem', textAlign: 'center', color: 'text.secondary', lineHeight: 1.7 }}>
            {t('page.transferIn.mismatch.message')}
          </Typography>
          <Typography sx={{ fontSize: '0.9rem', fontWeight: 700, color: 'warning.dark' }}>
            {t('page.transferIn.mismatch.summary', { planned: plannedTotal, scanned: scannedTotal })}
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1.5, p: 3, pt: 2.5 }}>
          <Button variant="outlined" color="inherit" onClick={() => setMismatchOpen(false)} sx={{ minWidth: 130 }}>
            {t('page.transferIn.mismatch.cancel')}
          </Button>
          <Button variant="contained" onClick={handleMismatchProceed} autoFocus sx={{ minWidth: 130 }}>
            {t('page.transferIn.mismatch.confirm')}
          </Button>
        </Box>
      </Dialog>

      {/* プライス発行しますか？（中央寄せ・プリンターアイコン）*/}
      <Dialog
        open={priceConfirmOpen}
        maxWidth="xs"
        slotProps={{ paper: { sx: { borderRadius: 3, px: 2, py: 1, minWidth: 360 } } }}
      >
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, pt: 3, px: 3 }}>
          <PrintOutlinedIcon sx={{ fontSize: 48, color: 'text.primary' }} />
          <Typography sx={{ fontSize: '0.95rem', fontWeight: 600, textAlign: 'center' }}>
            {t('page.transferIn.priceConfirm.message')}
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1.5, p: 3, pt: 2.5 }}>
          <Button variant="outlined" color="inherit" onClick={handlePriceNo} sx={{ minWidth: 130 }}>
            {t('page.transferIn.priceConfirm.cancel')}
          </Button>
          <Button variant="contained" onClick={handlePriceYes} autoFocus sx={{ minWidth: 130 }}>
            {t('page.transferIn.priceConfirm.confirm')}
          </Button>
        </Box>
      </Dialog>

      {/* プライス発行（印刷ラベルタイプの選択）*/}
      <Dialog
        open={printOpen}
        maxWidth="sm"
        fullWidth
        onClose={() => { setPrintOpen(false); openComplete() }}
        slotProps={{ paper: { sx: { borderRadius: 2 } } }}
      >
        <Box sx={{ px: 3, py: 2, borderBottom: '1px solid', borderColor: 'divider' }}>
          <Typography sx={{ fontSize: '1rem', fontWeight: 700 }}>{t('page.transferIn.print.title')}</Typography>
        </Box>
        <Box sx={{ px: 3, py: 2 }}>
          <Typography sx={{ fontSize: '0.85rem', fontWeight: 700, mb: 0.5 }}>{t('page.transferIn.print.tab')}</Typography>
          <Typography sx={{ fontSize: '0.82rem', color: 'text.secondary', mb: 1.5 }}>{t('page.transferIn.print.prompt')}</Typography>
          <Typography sx={{ fontSize: '0.82rem', fontWeight: 700, mb: 0.5 }}>{t('page.transferIn.print.typeLabel')}</Typography>
          <RadioGroup value={labelType} onChange={(e) => setLabelType(e.target.value as LabelType)}>
            <FormControlLabel value="auto" control={<Radio size="small" />}
              label={<Typography sx={{ fontSize: '0.85rem' }}>{t('page.transferIn.print.auto')}</Typography>} />
            <Typography sx={{ fontSize: '0.82rem', fontWeight: 700, mt: 0.5, mb: 0.25 }}>{t('page.transferIn.print.batchLabel')}</Typography>
            <Box sx={{ pl: 2, display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', columnGap: 1, rowGap: 0 }}>
              {(['tagV', 'tagH', 'showcaseV', 'sealV', 'sealH', 'sealShort', 'cardL', 'cardLOver'] as const).map((k) => (
                <FormControlLabel key={k} value={k} control={<Radio size="small" />}
                  label={<Typography sx={{ fontSize: '0.82rem' }}>{t(`page.transferIn.print.labels.${k}`)}</Typography>} />
              ))}
            </Box>
            <FormControlLabel value="perItem" control={<Radio size="small" />}
              label={<Typography sx={{ fontSize: '0.85rem' }}>{t('page.transferIn.print.perItem')}</Typography>} />
          </RadioGroup>
        </Box>
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1.5, px: 3, py: 2, borderTop: '1px solid', borderColor: 'divider' }}>
          <Button variant="outlined" color="inherit" onClick={() => { setPrintOpen(false); openComplete() }} sx={{ minWidth: 120 }}>
            {t('page.transferIn.print.cancel')}
          </Button>
          <Button variant="contained" onClick={handlePrintExec} sx={{ minWidth: 120 }}>
            {t('page.transferIn.print.exec')}
          </Button>
        </Box>
      </Dialog>

      {/* 完了ダイアログ（中央寄せ・(i)アイコン）img128 */}
      <Dialog
        open={completeOpen}
        maxWidth="xs"
        slotProps={{ paper: { sx: { borderRadius: 3, px: 2, py: 1, minWidth: 380 } } }}
      >
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, pt: 3, px: 3 }}>
          <InfoOutlinedIcon sx={{ fontSize: 46, color: 'text.primary' }} />
          <Typography sx={{ fontSize: '0.95rem', fontWeight: 600, textAlign: 'center', whiteSpace: 'pre-line', lineHeight: 1.7 }}>
            {t('page.transferIn.complete.message')}
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1.5, p: 3, pt: 2.5 }}>
          <Button variant="outlined" color="inherit" onClick={handleCompleteReturnTop} sx={{ minWidth: 150 }}>
            {t('page.transferIn.complete.returnTop')}
          </Button>
          <Button variant="contained" onClick={handleCompleteContinue} autoFocus sx={{ minWidth: 150 }}>
            {t('page.transferIn.complete.continue')}
          </Button>
        </Box>
      </Dialog>

      <Snackbar
        open={toast.open}
        autoHideDuration={3000}
        onClose={() => setToast((p) => ({ ...p, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity={toast.severity} variant="filled" onClose={() => setToast((p) => ({ ...p, open: false }))} sx={{ fontSize: '0.85rem' }}>
          {toast.message}
        </Alert>
      </Snackbar>
    </Box>
  )
}
