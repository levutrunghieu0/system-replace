import { createFileRoute } from '@tanstack/react-router'
import { useMemo, useRef, useState } from 'react'
import type { ColumnDef } from '@tanstack/react-table'
import Alert from '@mui/material/Alert'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Chip from '@mui/material/Chip'
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
import ClearIcon from '@mui/icons-material/Clear'
import DeleteOutlinedIcon from '@mui/icons-material/DeleteOutlined'
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined'
import LocalOfferOutlinedIcon from '@mui/icons-material/LocalOfferOutlined'
import PrintOutlinedIcon from '@mui/icons-material/PrintOutlined'
import QrCodeScannerIcon from '@mui/icons-material/QrCodeScanner'
import RestartAltIcon from '@mui/icons-material/RestartAlt'
import TaskAltIcon from '@mui/icons-material/TaskAlt'
import { useTranslation } from 'react-i18next'
import { AppTable } from '../components/table'
import { AppModal } from '../components/common/AppModal'
import { QuantityStepper } from '../components/QuantityStepper'
import { useLayoutConfig } from '../hooks/useLayoutConfig'

export const Route = createFileRoute('/purchase/sorting')({
  component: PurchaseSortingPage,
})

// ── Types ─────────────────────────────────────────────────────────────────────

type ItemKind = 'individual' | 'single' | 'gross'

/** E-39-01-07: タグプリンタ/ラベルプリンタから出力される帳票（ASIS踏襲の8種） */
const TAG_TYPES = [
  '縦長タグ',
  '横長タグ',
  '縦長シール',
  '横長シール',
  '商品バーコードシール',
  'プライスシール',
  '見出しシール',
  '値引き額バーコードシール',
] as const

type TagType = (typeof TAG_TYPES)[number]

interface SortingItem {
  id: string
  receiptNo: string // タグ・シール発行レシートNo.
  code: string
  productName: string
  kind: ItemKind // 個品 / 単品 / グロス
  price: number
  qty: number // 発行枚数
  tagType: TagType // 出し分けロジック（ASIS踏襲）による自動割当。変更可
}

interface ReceiptData {
  receiptNo: string
  slipNumber: string // 買取伝票番号
  grossOnly: boolean // TOBE：グロスのみの場合バーコード非表示＝発行対象外
  items: Omit<SortingItem, 'id' | 'receiptNo'>[]
}

// ── Mock data ─────────────────────────────────────────────────────────────────

const STAFF_MASTER: Record<string, string> = {
  '9999999': 'けんしゅうせい',
  '1234567': 'たなか',
  '2345678': 'やまざき',
  '3456789': 'わたなべ',
}

const RECEIPT_MASTER: Record<string, ReceiptData> = {
  '1001': {
    receiptNo: '1001',
    slipNumber: '0000030781',
    grossOnly: false,
    items: [
      { code: '7001001', productName: 'グッチ GGキャンバス トートバッグ', kind: 'individual', price: 45200, qty: 1, tagType: '縦長タグ' },
      { code: '7001002', productName: 'ルイヴィトン モノグラム ベルト 90cm', kind: 'individual', price: 19800, qty: 1, tagType: '横長タグ' },
      { code: '5060388', productName: 'ぬがせっ!! SEXY スロット天国DX', kind: 'single', price: 980, qty: 1, tagType: '商品バーコードシール' },
      { code: '5060453', productName: 'みんなのGOLF ポータブル2', kind: 'single', price: 1280, qty: 2, tagType: 'プライスシール' },
    ],
  },
  '1002': {
    receiptNo: '1002',
    slipNumber: '0000030785',
    grossOnly: false,
    items: [
      { code: '9001004', productName: 'ダイソン V15 Detect コードレス掃除機', kind: 'individual', price: 32900, qty: 1, tagType: '縦長タグ' },
      { code: '9001002', productName: 'ソニー ワイヤレスイヤホン WF-1000XM5', kind: 'individual', price: 24900, qty: 1, tagType: '縦長シール' },
      { code: '3021010', productName: 'トレカ まとめセット（見出し）', kind: 'single', price: 5660, qty: 1, tagType: '見出しシール' },
      { code: '3021011', productName: 'バーバリー チェックマフラー（値引き）', kind: 'single', price: 7900, qty: 1, tagType: '値引き額バーコードシール' },
    ],
  },
  '1003': {
    receiptNo: '1003',
    slipNumber: '0000030790',
    grossOnly: false,
    items: [
      { code: '3021003', productName: 'ユニクロ フリースジャケット ピンク M', kind: 'single', price: 790, qty: 1, tagType: '横長シール' },
      { code: '3021004', productName: 'ジーユー オーバーサイズシャツ ホワイト L', kind: 'single', price: 590, qty: 1, tagType: '横長シール' },
    ],
  },
  // TOBE補足：対象がグロスしかない場合はバーコードを表示しない → 発行対象外
  '2001': {
    receiptNo: '2001',
    slipNumber: '0000030795',
    grossOnly: true,
    items: [],
  },
}

const KIND_CHIP_COLOR: Record<ItemKind, 'primary' | 'info' | 'default'> = {
  individual: 'primary',
  single: 'info',
  gross: 'default',
}

// ── Page ──────────────────────────────────────────────────────────────────────

function PurchaseSortingPage() {
  const { t } = useTranslation()

  // E-39-01-05: 担当者コードスキャン
  const [staffCode, setStaffCode] = useState('')
  const [staffInput, setStaffInput] = useState('')
  const staffName = STAFF_MASTER[staffCode] ?? ''

  // E-39-01-06: タグ・シール発行レシートスキャン
  const [scanInput, setScanInput] = useState('')
  const [scannedReceipts, setScannedReceipts] = useState<ReceiptData[]>([])
  const [items, setItems] = useState<SortingItem[]>([])

  // E-39-01-07: 発行
  const [issueConfirmOpen, setIssueConfirmOpen] = useState(false)
  const [issueDoneOpen, setIssueDoneOpen] = useState(false)

  const [toast, setToast] = useState<{ open: boolean; message: string; severity: 'success' | 'warning' }>({
    open: false, message: '', severity: 'success',
  })

  const scanRef = useRef<HTMLInputElement>(null)

  useLayoutConfig({ title: t('page.purchaseSorting.title') })

  const showToast = (message: string, severity: 'success' | 'warning' = 'success') =>
    setToast({ open: true, message, severity })

  const totalSheets = useMemo(() => items.reduce((sum, i) => sum + i.qty, 0), [items])

  /** 発行確認用：タグ・シール種別ごとの枚数内訳 */
  const sheetsByType = useMemo(() => {
    const map = new Map<TagType, number>()
    for (const item of items) {
      map.set(item.tagType, (map.get(item.tagType) ?? 0) + item.qty)
    }
    return TAG_TYPES.filter((type) => map.has(type)).map((type) => ({ type, count: map.get(type)! }))
  }, [items])

  // ── Handlers ────────────────────────────────────────────────────────────────

  const handleStaffScan = () => {
    const code = staffInput.trim()
    if (!code) return
    if (!STAFF_MASTER[code]) {
      showToast(t('page.purchaseSorting.staff.notFound'), 'warning')
      return
    }
    setStaffCode(code)
    setStaffInput('')
    setTimeout(() => scanRef.current?.focus(), 50)
  }

  // E-39-01-06: レシートスキャン（出し分けロジックはASIS踏襲）
  const handleReceiptScan = () => {
    const code = scanInput.trim()
    if (!code) return
    if (!staffCode) {
      showToast(t('page.purchaseSorting.staff.required'), 'warning')
      return
    }
    const receipt = RECEIPT_MASTER[code]
    if (!receipt) {
      showToast(t('page.purchaseSorting.scan.notFound'), 'warning')
      return
    }
    // TOBE：グロスのみの伝票はバーコード非表示＝発行対象外
    if (receipt.grossOnly) {
      showToast(t('page.purchaseSorting.scan.grossOnly'), 'warning')
      setScanInput('')
      return
    }
    if (scannedReceipts.some((r) => r.receiptNo === receipt.receiptNo)) {
      showToast(t('page.purchaseSorting.scan.alreadyScanned'), 'warning')
      setScanInput('')
      return
    }
    setScannedReceipts((prev) => [...prev, receipt])
    setItems((prev) => [
      ...prev,
      ...receipt.items.map((item, index) => ({
        ...item,
        id: `${receipt.receiptNo}-${index}`,
        receiptNo: receipt.receiptNo,
      })),
    ])
    setScanInput('')
    showToast(t('page.purchaseSorting.scan.loaded', { receipt: receipt.receiptNo, n: receipt.items.length }))
    setTimeout(() => scanRef.current?.focus(), 50)
  }

  const handleQtyChange = (id: string, qty: number) => {
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, qty } : i)))
  }

  const handleTagTypeChange = (id: string, tagType: TagType) => {
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, tagType } : i)))
  }

  const handleDelete = (item: SortingItem) => {
    setItems((prev) => {
      const next = prev.filter((i) => i.id !== item.id)
      // レシートの全行が消えたら読込済み一覧からも除去
      if (!next.some((i) => i.receiptNo === item.receiptNo)) {
        setScannedReceipts((r) => r.filter((x) => x.receiptNo !== item.receiptNo))
      }
      return next
    })
    showToast(t('page.purchaseSorting.deleted', { name: item.productName }))
  }

  const handleReset = () => {
    setItems([])
    setScannedReceipts([])
    setScanInput('')
    setTimeout(() => scanRef.current?.focus(), 50)
  }

  // E-39-01-07:「発行」押下 → タグプリンタ/ラベルプリンタへ出力
  const handleIssueConfirm = () => {
    setIssueConfirmOpen(false)
    setIssueDoneOpen(true)
  }

  const handleIssueDoneClose = () => {
    setIssueDoneOpen(false)
    handleReset()
  }

  // ── Columns ──────────────────────────────────────────────────────────────────

  const columns = useMemo<ColumnDef<SortingItem>[]>(() => [
    {
      id: 'receiptNo', header: t('page.purchaseSorting.col.receipt'), size: 100, enableSorting: false,
      cell: ({ row }) => (
        <Typography sx={{ fontFamily: 'monospace', fontSize: '0.82rem', textAlign: 'center' }}>
          {row.original.receiptNo}
        </Typography>
      ),
      meta: { headerSx: { textAlign: 'center' }, cellSx: { textAlign: 'center' } },
    },
    {
      id: 'code', header: t('page.purchaseSorting.col.code'), size: 100, enableSorting: false,
      cell: ({ row }) => (
        <Typography sx={{ fontFamily: 'monospace', fontSize: '0.82rem' }}>{row.original.code}</Typography>
      ),
      meta: { cellSx: { whiteSpace: 'nowrap' as const } },
    },
    {
      id: 'productName', header: t('page.purchaseSorting.col.productName'), enableSorting: false,
      cell: ({ row }) => (
        <Typography sx={{ fontSize: '0.85rem' }}>{row.original.productName}</Typography>
      ),
      meta: { cellSx: { minWidth: 220 } },
    },
    {
      id: 'kind', header: t('page.purchaseSorting.col.kind'), size: 80, enableSorting: false,
      cell: ({ row }) => (
        <Chip
          label={t(`page.purchaseSorting.kind.${row.original.kind}`)}
          size="small"
          color={KIND_CHIP_COLOR[row.original.kind]}
          variant="outlined"
          sx={{ fontSize: '0.72rem', height: 22 }}
        />
      ),
      meta: { headerSx: { textAlign: 'center' }, cellSx: { textAlign: 'center' } },
    },
    {
      id: 'price', header: t('page.purchaseSorting.col.price'), size: 90, enableSorting: false,
      cell: ({ row }) => (
        <Typography sx={{ fontSize: '0.82rem', textAlign: 'right' }}>
          ¥{row.original.price.toLocaleString()}
        </Typography>
      ),
      meta: { headerSx: { textAlign: 'right' }, cellSx: { textAlign: 'right', whiteSpace: 'nowrap' as const } },
    },
    {
      id: 'qty', header: t('page.purchaseSorting.col.qty'), size: 110, enableSorting: false,
      cell: ({ row }) => (
        <QuantityStepper compact value={row.original.qty} min={1}
          onChange={(qty) => handleQtyChange(row.original.id, qty)} />
      ),
      meta: { headerSx: { textAlign: 'center' }, cellSx: { textAlign: 'center', whiteSpace: 'nowrap' as const } },
    },
    {
      id: 'tagType', header: t('page.purchaseSorting.col.tagType'), size: 210, enableSorting: false,
      cell: ({ row }) => (
        <TextField
          select size="small" value={row.original.tagType}
          onChange={(e) => handleTagTypeChange(row.original.id, e.target.value as TagType)}
          sx={{ width: 200, '& .MuiSelect-select': { py: 0.5, fontSize: '0.8rem' } }}
        >
          {TAG_TYPES.map((type) => (
            <MenuItem key={type} value={type} sx={{ fontSize: '0.82rem' }}>{type}</MenuItem>
          ))}
        </TextField>
      ),
    },
    {
      id: 'actions', header: t('page.purchaseSorting.col.actions'), size: 56, enableSorting: false,
      cell: ({ row }) => (
        <Tooltip title={t('page.purchaseSorting.deleteTooltip')} placement="left">
          <IconButton size="small" color="error" onClick={() => handleDelete(row.original)}>
            <DeleteOutlinedIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      ),
      meta: { headerSx: { textAlign: 'center' }, cellSx: { textAlign: 'center' } },
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
  ], [t])

  // ── Render ───────────────────────────────────────────────────────────────────

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, height: '100%' }}>

      {/* 作業の流れガイド（E-39-01-01〜09） */}
      <Paper variant="outlined" sx={{ p: 1.25, bgcolor: '#f5f8ff', borderColor: '#c5d3f5' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mb: 0.75 }}>
          <InfoOutlinedIcon sx={{ fontSize: '0.85rem', color: 'info.main', flexShrink: 0 }} />
          <Typography sx={{ fontSize: '0.78rem', fontWeight: 600, color: 'text.secondary' }}>
            {t('page.purchaseSorting.guide.title')}
          </Typography>
        </Box>
        <Box sx={{ pl: 2 }}>
          {(['s1', 's2', 's3', 's4'] as const).map((key, index) => (
            <Typography key={key} sx={{ fontSize: '0.72rem', color: 'text.secondary' }}>
              {index + 1}. {t(`page.purchaseSorting.guide.${key}`)}
            </Typography>
          ))}
        </Box>
      </Paper>

      {/* 担当者コードスキャン（E-39-01-05） */}
      {staffCode ? (
        <Paper variant="outlined" sx={{ p: 1.25, display: 'flex', alignItems: 'center', gap: 1 }}>
          <BadgeOutlinedIcon sx={{ color: 'primary.main' }} />
          <Typography sx={{ fontSize: '0.85rem' }}>
            {t('page.purchaseSorting.staff.label')}: <strong>{staffName}</strong>（{staffCode}）
          </Typography>
          <Button size="small" sx={{ ml: 'auto' }} onClick={() => setStaffCode('')}>
            {t('page.purchaseSorting.staff.change')}
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
              {t('page.purchaseSorting.staff.scanPrompt')}
            </Typography>
            <OutlinedInput
              size="small"
              autoFocus
              value={staffInput}
              onChange={(e) => setStaffInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleStaffScan()}
              placeholder={t('page.purchaseSorting.staff.placeholder')}
              sx={{ width: 260, height: 34, fontSize: '0.85rem', bgcolor: 'background.paper' }}
            />
            <Button size="small" variant="contained" onClick={handleStaffScan} disabled={!staffInput.trim()}>
              {t('page.purchaseSorting.staff.authenticate')}
            </Button>
          </Box>
        </Alert>
      )}

      {/* レシートスキャンバー（E-39-01-06） */}
      <Paper variant="outlined" sx={{ p: 1.5 }}>
        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', flexWrap: 'wrap' }}>
          <OutlinedInput
            size="small"
            inputRef={scanRef}
            value={scanInput}
            onChange={(e) => setScanInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleReceiptScan()}
            placeholder={t('page.purchaseSorting.scan.placeholder')}
            startAdornment={
              <InputAdornment position="start">
                <QrCodeScannerIcon fontSize="small" sx={{ color: 'text.secondary' }} />
              </InputAdornment>
            }
            endAdornment={scanInput ? (
              <InputAdornment position="end">
                <IconButton size="small" onClick={() => setScanInput('')}>
                  <ClearIcon fontSize="small" />
                </IconButton>
              </InputAdornment>
            ) : null}
            sx={{ flex: 1, maxWidth: 420 }}
          />
          <Button variant="contained" onClick={handleReceiptScan} disabled={!scanInput.trim()}>
            {t('page.purchaseSorting.scan.run')}
          </Button>

          {scannedReceipts.length > 0 && (
            <Box sx={{ ml: 'auto', display: 'flex', alignItems: 'center', gap: 0.75, flexWrap: 'wrap' }}>
              <Typography sx={{ fontSize: '0.75rem', color: 'text.secondary' }}>
                {t('page.purchaseSorting.receipt.scanned')}:
              </Typography>
              {scannedReceipts.map((receipt) => (
                <Tooltip key={receipt.receiptNo} title={t('page.purchaseSorting.receipt.slip', { slip: receipt.slipNumber })}>
                  <Chip
                    size="small" variant="outlined" color="primary"
                    icon={<LocalOfferOutlinedIcon />}
                    label={receipt.receiptNo}
                    sx={{ fontFamily: 'monospace' }}
                  />
                </Tooltip>
              ))}
            </Box>
          )}
        </Box>
      </Paper>

      {/* 対象商品一覧（出し分けロジックによる自動割当済み） */}
      <AppTable<SortingItem>
        data={items}
        columns={columns}
        getRowId={(row) => row.id}
        stickyHeader
        containerMaxHeight="calc(100vh - 420px)"
        dense
        emptyMessage={
          <Box sx={{ textAlign: 'center', color: 'text.disabled', pt: 3 }}>
            <QrCodeScannerIcon sx={{ fontSize: 40, mb: 0.5 }} />
            <Typography sx={{ fontSize: '0.9rem', color: 'text.disabled' }}>
              {t('page.purchaseSorting.empty')}
            </Typography>
          </Box>
        }
        tableSx={{ minWidth: 980 }}
      />

      {/* アクションバー（E-39-01-07） */}
      <Paper variant="outlined" sx={{ p: 1, display: 'flex', gap: 1, alignItems: 'center' }}>
        <Button size="small" variant="outlined" color="inherit"
          startIcon={<RestartAltIcon />}
          disabled={items.length === 0}
          onClick={handleReset}>
          {t('page.purchaseSorting.reset')}
        </Button>
        {items.length > 0 && (
          <Typography sx={{ fontSize: '0.78rem', color: 'text.secondary', ml: 1 }}>
            {t('page.purchaseSorting.summaryTotal', { n: totalSheets })}
          </Typography>
        )}
        <Button size="small" variant="contained" sx={{ ml: 'auto' }}
          startIcon={<PrintOutlinedIcon />}
          disabled={items.length === 0}
          onClick={() => setIssueConfirmOpen(true)}>
          {t('page.purchaseSorting.issue.button')}
        </Button>
      </Paper>

      {/* 発行確認（種別ごとの内訳） */}
      <AppModal
        open={issueConfirmOpen}
        onClose={() => setIssueConfirmOpen(false)}
        title={t('page.purchaseSorting.issue.confirmTitle')}
        maxWidth="sm"
        actions={[
          { label: t('page.consentInquiry.common.no'), onClick: () => setIssueConfirmOpen(false), color: 'inherit' },
          { label: t('page.consentInquiry.common.yes'), onClick: handleIssueConfirm, variant: 'contained' },
        ]}
      >
        <Typography sx={{ fontSize: '0.85rem', mb: 1.5 }}>
          {t('page.purchaseSorting.issue.confirmMessage')}
        </Typography>
        <Paper variant="outlined" sx={{ mb: 1.5 }}>
          {sheetsByType.map(({ type, count }) => (
            <Box key={type} sx={{
              display: 'flex', justifyContent: 'space-between', px: 1.5, py: 0.75,
              borderBottom: '1px solid', borderColor: 'divider', '&:last-child': { borderBottom: 0 },
            }}>
              <Typography sx={{ fontSize: '0.82rem' }}>{type}</Typography>
              <Typography sx={{ fontSize: '0.82rem', fontWeight: 700 }}>
                {t('page.purchaseSorting.issue.sheets', { n: count })}
              </Typography>
            </Box>
          ))}
          <Box sx={{
            display: 'flex', justifyContent: 'space-between', px: 1.5, py: 0.75,
            bgcolor: 'grey.50', borderTop: '1px solid', borderColor: 'divider',
          }}>
            <Typography sx={{ fontSize: '0.82rem', fontWeight: 700 }}>
              {t('page.purchaseSorting.summaryTotal', { n: totalSheets })}
            </Typography>
          </Box>
        </Paper>
        <Typography sx={{ fontSize: '0.75rem', color: 'text.secondary' }}>
          {t('page.purchaseSorting.issue.printer')}
        </Typography>
      </AppModal>

      {/* 発行完了 → 後工程の案内（E-39-01-08〜09） */}
      <AppModal
        open={issueDoneOpen}
        onClose={handleIssueDoneClose}
        title={t('page.purchaseSorting.issue.doneTitle')}
        actions={[
          { label: t('page.purchaseSorting.issue.close'), onClick: handleIssueDoneClose, variant: 'contained' },
        ]}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
          <TaskAltIcon color="success" />
          <Typography sx={{ fontSize: '0.9rem', fontWeight: 600 }}>
            {t('page.purchaseSorting.issue.doneMessage')}
          </Typography>
        </Box>
        <Typography sx={{ fontSize: '0.82rem', color: 'text.secondary' }}>
          1. {t('page.purchaseSorting.issue.after1')}
        </Typography>
        <Typography sx={{ fontSize: '0.82rem', color: 'text.secondary' }}>
          2. {t('page.purchaseSorting.issue.after2')}
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
