import { useState } from 'react'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import Alert from '@mui/material/Alert'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import Button from '@mui/material/Button'
import Chip from '@mui/material/Chip'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import Divider from '@mui/material/Divider'
import FormControlLabel from '@mui/material/FormControlLabel'
import InputAdornment from '@mui/material/InputAdornment'
import OutlinedInput from '@mui/material/OutlinedInput'
import Radio from '@mui/material/Radio'
import RadioGroup from '@mui/material/RadioGroup'
import Snackbar from '@mui/material/Snackbar'
import BadgeOutlinedIcon from '@mui/icons-material/BadgeOutlined'
import BlockIcon from '@mui/icons-material/Block'
import BuildIcon from '@mui/icons-material/Build'
import PointOfSaleIcon from '@mui/icons-material/PointOfSale'
import PrintIcon from '@mui/icons-material/Print'
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft'
import ChevronRightIcon from '@mui/icons-material/ChevronRight'
import QrCodeScannerIcon from '@mui/icons-material/QrCodeScanner'
import ReceiptLongOutlinedIcon from '@mui/icons-material/ReceiptLongOutlined'
import SearchIcon from '@mui/icons-material/Search'
import { useLayoutConfig } from '../hooks/useLayoutConfig'
import { MOCK_PURCHASE_LIST } from '../features/buy-back/api/buyBackApi'

export const Route = createFileRoute('/purchase/invoice')({
  validateSearch: (s: Record<string, unknown>) => ({
    receiptId: typeof s.receiptId === 'number' ? s.receiptId : undefined,
  }),
  component: InvoiceDetailPage,
})

// ─── Configuration (§2 Step 2: showRecreateAlert toggle)
// Set to false to bypass the confirmation dialog and jump directly to Step 3.
const SHOW_RECREATE_ALERT = true

// ─── Types ────────────────────────────────────────────────────────────────────

interface InvoiceItem {
  id: string
  rowNo: number
  transactionType: 'sample' | 'return'
  code: string
  productName: string
  comment?: string
  condition?: string
  quantity: number
  unitPrice: number
  amount: number
  priceBonus?: number
  note?: string
}

interface InvoiceMeta {
  invoiceNumber: string
  registerNo: string
  staff: string
  staffCode: string
  businessDay: string
  createdAt: string
  itemCount: number
  subtotal: number
  tax: number
  total: number
}

// ─── Mock data ────────────────────────────────────────────────────────────────

const MOCK_ITEMS: InvoiceItem[] = [
  { id: '1', rowNo: 1, transactionType: 'sample', code: '12345\n67890\n12345', productName: 'JORDAN BRANS AS M J ESS MMBR JK', comment: '詳細コメント', condition: 'S', quantity: 10000, unitPrice: 10000000, amount: 10000000, priceBonus: 10000000, note: 'ああああ' },
  { id: '2', rowNo: 1, transactionType: 'sample', code: '12345\n67890\n12345', productName: 'JORDAN BRANS AS M J ESS MMBR JK', comment: '詳細コメント', condition: 'A', quantity: 10000, unitPrice: 10000000, amount: 10000000, priceBonus: 10000000, note: 'ああああ' },
  { id: '3', rowNo: 1, transactionType: 'sample', code: '12345\n67890\n12345', productName: 'JORDAN BRANS AS M J ESS MMBR JK', comment: '詳細コメント', condition: 'B', quantity: 10000, unitPrice: 10000000, amount: 10000000, priceBonus: 10000000, note: 'ああああ' },
  { id: '4', rowNo: 1, transactionType: 'return', code: '12345\n67890\n12345', productName: 'JORDAN BRANS AS M J ESS MMBR JK', condition: undefined, quantity: 10000, unitPrice: 10000000, amount: 10000000, priceBonus: 10000000, note: 'ああああ' },
]

const MOCK_META: InvoiceMeta = {
  invoiceNumber: '0001328491',
  registerNo: '01',
  staff: 'ナサニエル',
  staffCode: '0000000',
  businessDay: '26/12/25',
  createdAt: '17:52:31',
  itemCount: 6,
  subtotal: 7230,
  tax: 723,
  total: 7953,
}

// E-44-01-03: 担当者コードスキャン（ハンディスキャナ）
const STAFF_MASTER: Record<string, string> = {
  '9999999': 'けんしゅうせい',
  '1234567': 'たなか',
  '2345678': 'やまざき',
  '3456789': 'わたなべ',
}

// X-01_伝票検索：伝票番号で対象伝票を特定
const SLIP_NUMBERS = ['0001328491', '0001328492']

// E-44-01-07: 理由選択（理由選択画面作成）
const RECREATE_REASONS = ['o1', 'o2', 'o3', 'o4', 'o5', 'o6'] as const
export type RecreateReason = (typeof RECREATE_REASONS)[number]

// ─── Dialog steps ─────────────────────────────────────────────────────────────
// E-44 シート準拠の手順：
//   X-06 取消 → E-44-01-05 買取金額を投入（取消ルート）
//   E-44-01-06 再作成 → E-44-01-07 理由選択（再作成ルート）
type DialogStep =
  | 'none'
  | 'cancel_confirm'   // X-06 取消
  | 'recreate_confirm' // E-44-01-06 「再作成」を押下
  | 'cash_input'       // E-44-01-05 買取金額を投入
  | 'reason_select'    // E-44-01-07 理由を選択

// Step 2: Confirmation — includes primary item name per §2 spec (wrench icon)
function RecreateConfirmDialog({
  productName,
  onConfirm,
  onCancel,
}: { productName: string; onConfirm: () => void; onCancel: () => void }) {
  const { t } = useTranslation()
  return (
    <Dialog open maxWidth="xs" fullWidth slotProps={{ paper: { sx: { borderRadius: 3, px: 1 } } }}>
      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2.5, pt: 2, pb: 1 }}>
          <Box
            sx={{
              width: 64, height: 64, borderRadius: '50%',
              bgcolor: 'grey.100',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >
            <BuildIcon sx={{ fontSize: 34, color: 'text.secondary' }} />
          </Box>
          <Typography variant="body1" sx={{ fontWeight: 600, textAlign: 'center' }}>
            {t('page.purchase.invoice.recreateDialog.message', { productName })}
          </Typography>
        </Box>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2.5, gap: 1, justifyContent: 'center' }}>
        <Button variant="outlined" color="inherit" onClick={onCancel} sx={{ textTransform: 'none', minWidth: 120 }}>
          {t('page.purchase.invoice.recreateDialog.cancel')}
        </Button>
        <Button variant="contained" color="primary" onClick={onConfirm} sx={{ textTransform: 'none', fontWeight: 700, minWidth: 120 }}>
          {t('page.purchase.invoice.recreateDialog.confirm')}
        </Button>
      </DialogActions>
    </Dialog>
  )
}

// X-06: 取消確認 — "この買取取引を取消します。よろしいですか？" (block icon)
function CancelConfirmDialog({
  onConfirm,
  onCancel,
}: { onConfirm: () => void; onCancel: () => void }) {
  const { t } = useTranslation()
  return (
    <Dialog open maxWidth="xs" fullWidth slotProps={{ paper: { sx: { borderRadius: 3, px: 1 } } }}>
      <DialogTitle sx={{ fontWeight: 700, fontSize: '1rem' }}>
        {t('page.purchase.invoice.cancelDialog.title')}
      </DialogTitle>
      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, pt: 1, pb: 1 }}>
          <Box
            sx={{
              width: 64, height: 64, borderRadius: '50%',
              bgcolor: 'error.light',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >
            <BlockIcon sx={{ fontSize: 34, color: 'error.main' }} />
          </Box>
          <Typography variant="body1" sx={{ fontWeight: 600, textAlign: 'center' }}>
            {t('page.purchase.invoice.cancelDialog.message')}
          </Typography>
          <Typography variant="caption" sx={{ color: 'text.secondary', textAlign: 'center' }}>
            {t('page.purchase.invoice.cancelDialog.note')}
          </Typography>
        </Box>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2.5, gap: 1, justifyContent: 'center' }}>
        <Button variant="outlined" color="inherit" onClick={onCancel} sx={{ textTransform: 'none', minWidth: 120 }}>
          {t('page.purchase.invoice.cancelDialog.cancel')}
        </Button>
        <Button variant="contained" color="error" onClick={onConfirm} sx={{ textTransform: 'none', fontWeight: 700, minWidth: 120 }}>
          {t('page.purchase.invoice.cancelDialog.confirm')}
        </Button>
      </DialogActions>
    </Dialog>
  )
}

// Step 3: Cash register deposit — "現金をレジに投入してください。" (POS icon)
function CashDepositDialog({
  onConfirm,
  onCancel,
}: { onConfirm: () => void; onCancel: () => void }) {
  const { t } = useTranslation()
  return (
    <Dialog open maxWidth="xs" fullWidth slotProps={{ paper: { sx: { borderRadius: 3, px: 1 } } }}>
      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2.5, pt: 2, pb: 1 }}>
          <Box
            sx={{
              width: 64, height: 64, borderRadius: '50%',
              bgcolor: 'grey.100',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >
            <PointOfSaleIcon sx={{ fontSize: 34, color: 'text.secondary' }} />
          </Box>
          <Typography variant="body1" sx={{ fontWeight: 600, textAlign: 'center' }}>
            {t('page.purchase.invoice.cashDialog.message')}
          </Typography>
          {/* TOBE補足（X-06）：キャッシュレス決済は現金過不足。お客様に渡った決済分は取り戻さない */}
          <Typography variant="caption" sx={{ color: 'text.secondary', textAlign: 'center' }}>
            {t('page.purchase.invoice.cashDialog.note')}
          </Typography>
        </Box>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2.5, gap: 1, justifyContent: 'center' }}>
        <Button variant="outlined" color="inherit" onClick={onCancel} sx={{ textTransform: 'none', minWidth: 120 }}>
          {t('page.purchase.invoice.cashDialog.cancel')}
        </Button>
        <Button variant="contained" color="primary" onClick={onConfirm} sx={{ textTransform: 'none', fontWeight: 700, minWidth: 120 }}>
          {t('page.purchase.invoice.cashDialog.confirm')}
        </Button>
      </DialogActions>
    </Dialog>
  )
}

// E-44-01-07: 理由選択画面（再作成理由を選択して決定）
function ReasonSelectDialog({
  onConfirm,
  onCancel,
}: { onConfirm: (reason: RecreateReason) => void; onCancel: () => void }) {
  const { t } = useTranslation()
  const [selected, setSelected] = useState<RecreateReason | ''>('')
  return (
    <Dialog open maxWidth="xs" fullWidth slotProps={{ paper: { sx: { borderRadius: 3, px: 1 } } }}>
      <DialogTitle sx={{ fontWeight: 700, fontSize: '1rem' }}>
        {t('page.purchase.invoice.reasonDialog.title')}
      </DialogTitle>
      <DialogContent>
        <Typography variant="body2" sx={{ mb: 1.5 }}>
          {t('page.purchase.invoice.reasonDialog.prompt')}
        </Typography>
        <RadioGroup value={selected} onChange={(e) => setSelected(e.target.value as RecreateReason)}>
          {RECREATE_REASONS.map((key) => (
            <FormControlLabel
              key={key}
              value={key}
              control={<Radio size="small" />}
              label={t(`page.purchase.invoice.reasonDialog.${key}`)}
              slotProps={{ typography: { sx: { fontSize: '0.88rem' } } }}
            />
          ))}
        </RadioGroup>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2.5, gap: 1, justifyContent: 'center' }}>
        <Button variant="outlined" color="inherit" onClick={onCancel} sx={{ textTransform: 'none', minWidth: 120 }}>
          {t('page.purchase.invoice.reasonDialog.cancel')}
        </Button>
        <Button
          variant="contained" color="primary" disabled={!selected}
          onClick={() => selected && onConfirm(selected)}
          sx={{ textTransform: 'none', fontWeight: 700, minWidth: 120 }}
        >
          {t('page.purchase.invoice.reasonDialog.confirm')}
        </Button>
      </DialogActions>
    </Dialog>
  )
}

// ─── Table helpers ────────────────────────────────────────────────────────────

const thSx = {
  fontSize: '0.75rem',
  fontWeight: 700,
  color: 'text.secondary',
  py: 0.75,
  px: 1,
  bgcolor: 'background.paper',
  borderBottom: '2px solid',
  borderColor: 'divider',
  whiteSpace: 'nowrap' as const,
}

const tdSx = {
  py: 0.75,
  px: 1,
  borderBottom: '1px solid',
  borderColor: 'divider',
  verticalAlign: 'top' as const,
}

function DetailRow({ label, value, large }: { label: string; value: string; large?: boolean }) {
  return (
    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', py: 0.4 }}>
      <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.78rem' }}>
        {label}
      </Typography>
      <Typography
        variant={large ? 'h6' : 'body2'}
        sx={{ fontWeight: large ? 800 : 500, fontSize: large ? '1.15rem' : '0.85rem' }}
      >
        {value}
      </Typography>
    </Box>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

function InvoiceDetailPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { receiptId } = Route.useSearch()
  const entry = MOCK_PURCHASE_LIST.find((e) => e.id === receiptId) ?? MOCK_PURCHASE_LIST[0]

  const [dialogStep, setDialogStep] = useState<DialogStep>('none')

  // E-44-01-03: 担当者コードスキャン
  const [staffCode, setStaffCode] = useState('')
  const [staffInput, setStaffInput] = useState('')
  const staffName = STAFF_MASTER[staffCode] ?? ''

  // X-01: 伝票検索
  const [slipInput, setSlipInput] = useState('')
  const [slipLoaded, setSlipLoaded] = useState(false)

  // X-06: 取消済みフラグ（シート手順：取消 → 投入 の後に 再作成 を許可）
  const [voided, setVoided] = useState(false)

  const [toast, setToast] = useState<{ open: boolean; message: string; severity: 'success' | 'warning' }>({
    open: false, message: '', severity: 'success',
  })
  const showToast = (message: string, severity: 'success' | 'warning' = 'success') =>
    setToast({ open: true, message, severity })

  useLayoutConfig({
    title: t('page.purchase.invoice.title'),
    showBackButton: true,
    hideSecondaryNav: true,
    onBack: () => navigate({ to: '/purchase' }),
    actions: [
      {
        // X-06 取消：元伝票を無効化（要 伝票読込）
        key: 'cancel',
        labelKey: 'page.purchase.invoice.action.cancel',
        position: 'left' as const,
        variant: 'outlined' as const,
        color: 'error' as const,
        disabled: !slipLoaded || voided,
        onClick: () => setDialogStep('cancel_confirm'),
      },
      {
        // E-44-01-06 再作成：シート手順に従い、取消（X-06）完了後に活性化
        key: 'recreate',
        labelKey: 'page.purchase.invoice.action.recreate',
        position: 'left' as const,
        variant: 'outlined' as const,
        color: 'inherit' as const,
        disabled: !slipLoaded || !voided,
        // §2 Step 2: SHOW_RECREATE_ALERT toggle — skip confirmation if false
        onClick: () => setDialogStep(SHOW_RECREATE_ALERT ? 'recreate_confirm' : 'reason_select'),
      },
      {
        key: 'print',
        labelKey: 'page.purchase.invoice.action.print',
        position: 'right' as const,
        variant: 'contained' as const,
        color: 'primary' as const,
        startIcon: <PrintIcon fontSize="small" />,
        onClick: () => {},
      },
    ],
  })

  const handleStaffScan = () => {
    const code = staffInput.trim()
    if (!code) return
    if (!STAFF_MASTER[code]) {
      showToast(t('page.purchase.invoice.staff.notFound'), 'warning')
      return
    }
    setStaffCode(code)
    setStaffInput('')
  }

  // X-01: 伝票番号で検索
  const handleSlipSearch = () => {
    const no = slipInput.trim()
    if (!no) return
    if (!SLIP_NUMBERS.includes(no)) {
      showToast(t('page.purchase.invoice.slipSearch.notFound'), 'warning')
      return
    }
    setSlipLoaded(true)
    setVoided(false)
    setSlipInput('')
    showToast(t('page.purchase.invoice.slipSearch.loaded', { slip: no }))
  }

  // 取消ルート：X-06 取消確認 → E-44-01-05 買取金額を投入
  const handleConfirmCancel = () => setDialogStep('cash_input')

  // E-44-01-05 投入完了 → 取消ルート終了（取消済みにして再作成を活性化）
  const handleConfirmCash = () => {
    setDialogStep('none')
    setVoided(true)
    showToast(t('page.purchase.invoice.cancelDialog.done'))
  }

  // 再作成ルート：E-44-01-06 再作成確認 → E-44-01-07 理由選択
  const handleConfirmRecreate = () => setDialogStep('reason_select')

  // 理由決定（E-44-01-07）→ 明細再作成（E-44-01-08/09）へ遷移
  const handleConfirmReason = (reason: RecreateReason) => {
    setDialogStep('none')
    navigate({ to: '/purchase/recreate', search: { receiptId: entry.id, reason } })
  }

  // Cancel from any overlay → back to Step 1 (close overlay, stay on this page)
  const handleCancel = () => setDialogStep('none')

  const { invoiceNumber, registerNo, staff, businessDay, createdAt, itemCount, subtotal, tax, total } = MOCK_META

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, height: '100%', minHeight: 0 }}>

      {/* E-44-01-03: 担当者コードスキャン */}
      {staffCode ? (
        <Box sx={{
          display: 'flex', alignItems: 'center', gap: 1, px: 1.5, py: 0.75, flexShrink: 0,
          border: '1px solid', borderColor: 'divider', borderRadius: 2, bgcolor: 'background.paper',
        }}>
          <BadgeOutlinedIcon sx={{ color: 'primary.main', fontSize: '1.1rem' }} />
          <Typography sx={{ fontSize: '0.85rem' }}>
            {t('page.purchase.invoice.staff.label')}: <strong>{staffName}</strong>（{staffCode}）
          </Typography>

          {/* X-01: 伝票検索 */}
          <OutlinedInput
            size="small"
            value={slipInput}
            onChange={(e) => setSlipInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSlipSearch()}
            placeholder={t('page.purchase.invoice.slipSearch.placeholder')}
            startAdornment={
              <InputAdornment position="start">
                <ReceiptLongOutlinedIcon fontSize="small" sx={{ color: 'text.secondary' }} />
              </InputAdornment>
            }
            sx={{ ml: 2, width: 320, height: 32, fontSize: '0.82rem' }}
          />
          <Button size="small" variant="outlined" startIcon={<SearchIcon />} onClick={handleSlipSearch} disabled={!slipInput.trim()}>
            {t('page.purchase.invoice.slipSearch.run')}
          </Button>
          {slipLoaded && (
            <Chip size="small" variant="outlined" color="success" label={invoiceNumber} sx={{ fontFamily: 'monospace' }} />
          )}
          {voided && (
            <Chip size="small" variant="filled" color="error" icon={<BlockIcon />} label={t('page.purchase.invoice.action.cancel')} />
          )}

          <Button size="small" sx={{ ml: 'auto' }} onClick={() => { setStaffCode(''); setSlipLoaded(false); setVoided(false) }}>
            {t('page.purchase.invoice.staff.change')}
          </Button>
        </Box>
      ) : (
        <Alert
          severity="warning"
          icon={<QrCodeScannerIcon />}
          sx={{ alignItems: 'center', flexShrink: 0, '& .MuiAlert-message': { flex: 1 } }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
            <Typography sx={{ fontSize: '0.85rem', flex: '0 0 auto' }}>
              {t('page.purchase.invoice.staff.scanPrompt')}
            </Typography>
            <OutlinedInput
              size="small"
              autoFocus
              value={staffInput}
              onChange={(e) => setStaffInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleStaffScan()}
              placeholder={t('page.purchase.invoice.staff.placeholder')}
              sx={{ width: 260, height: 34, fontSize: '0.85rem', bgcolor: 'background.paper' }}
            />
            <Button size="small" variant="contained" onClick={handleStaffScan} disabled={!staffInput.trim()}>
              {t('page.purchase.invoice.staff.authenticate')}
            </Button>
          </Box>
        </Alert>
      )}

      {/* X-01 伝票検索で伝票を読み込むまで明細は表示しない */}
      {!slipLoaded ? (
        <Box
          sx={{
            flex: 1, minHeight: 0,
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            gap: 1.5, color: 'text.disabled',
            border: '1px dashed', borderColor: 'divider', borderRadius: 2,
          }}
        >
          <ReceiptLongOutlinedIcon sx={{ fontSize: 56 }} />
          <Typography sx={{ fontSize: '0.95rem', color: 'text.secondary' }}>
            {t('page.purchase.invoice.slipSearch.empty')}
          </Typography>
        </Box>
      ) : (
      <Box sx={{ display: 'flex', gap: 1.5, flex: 1, minHeight: 0 }}>
      {/* ── Left: Invoice table ── */}
      <Box sx={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 1.5, height: '100%' }}>
        {/* Invoice number + prev/next nav */}
        <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexShrink: 0 }}>
          <Box>
            <Typography variant="caption" color="text.secondary">
              {t('page.purchase.invoice.invoiceNumberLabel')}
            </Typography>
            <Typography variant="h5" sx={{ fontWeight: 800, letterSpacing: 1, lineHeight: 1.2 }}>
              {invoiceNumber}
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.25 }}>
            <Button size="small" startIcon={<ChevronLeftIcon />} sx={{ textTransform: 'none', color: 'text.secondary', fontSize: '0.8rem' }}>
              {t('page.purchase.invoice.prevInvoice')}
            </Button>
            <Button size="small" endIcon={<ChevronRightIcon />} sx={{ textTransform: 'none', color: 'text.secondary', fontSize: '0.8rem' }}>
              {t('page.purchase.invoice.nextInvoice')}
            </Button>
          </Box>
        </Box>

        {/* Items table */}
        <Box sx={{ flex: 1, overflow: 'auto' }}>
          <TableContainer sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 1 }}>
            <Table size="small" stickyHeader>
              <TableHead>
                <TableRow>
                  {(['no', 'transaction', 'code', 'productName', 'condition', 'quantity', 'unitPrice', 'amount', 'note'] as const).map((col) => (
                    <TableCell key={col} sx={thSx}>
                      {t(`page.purchase.invoice.col.${col}` as Parameters<typeof t>[0])}
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {MOCK_ITEMS.map((row) => (
                  <TableRow key={row.id} hover sx={{ '&:last-child td': { border: 0 } }}>
                    <TableCell sx={{ ...tdSx, color: 'text.secondary', fontSize: '0.8rem' }}>
                      {row.rowNo.toString().padStart(3, '0')}
                    </TableCell>
                    <TableCell sx={tdSx}>
                      {row.transactionType === 'return' ? (
                        <Chip label={t('page.purchase.invoice.transactionType.return')} size="small"
                          sx={{ height: 20, fontSize: '0.7rem', bgcolor: '#fff3e0', color: '#e65100', fontWeight: 600 }} />
                      ) : (
                        <Typography sx={{ fontSize: '0.82rem' }}>
                          {t('page.purchase.invoice.transactionType.sample')}
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell sx={{ ...tdSx, fontFamily: 'monospace', fontSize: '0.78rem', whiteSpace: 'pre-line' }}>
                      {row.code}
                    </TableCell>
                    <TableCell sx={tdSx}>
                      <Typography sx={{ fontSize: '0.82rem', fontWeight: 500 }}>{row.productName}</Typography>
                      {row.comment && (
                        <Typography sx={{ fontSize: '0.72rem', color: 'text.secondary', mt: 0.25 }}>{row.comment}</Typography>
                      )}
                    </TableCell>
                    <TableCell sx={{ ...tdSx, textAlign: 'center', fontWeight: 600, fontSize: '0.82rem' }}>
                      {row.condition ?? ''}
                    </TableCell>
                    <TableCell sx={{ ...tdSx, textAlign: 'right', fontFamily: 'monospace', fontSize: '0.82rem' }}>
                      {row.quantity.toLocaleString()}
                    </TableCell>
                    <TableCell sx={{ ...tdSx, textAlign: 'right', fontFamily: 'monospace', fontSize: '0.82rem' }}>
                      ¥{row.unitPrice.toLocaleString()}
                    </TableCell>
                    <TableCell sx={tdSx}>
                      <Typography sx={{ fontFamily: 'monospace', fontSize: '0.82rem', fontWeight: 700, textAlign: 'right', whiteSpace: 'nowrap' }}>
                        ¥{row.amount.toLocaleString()}
                      </Typography>
                      {row.priceBonus != null && (
                        <Typography sx={{ fontSize: '0.7rem', color: 'primary.main', textAlign: 'right', whiteSpace: 'nowrap', mt: 0.25 }}>
                          {t('page.purchase.invoice.priceBonus')}: +¥{row.priceBonus.toLocaleString()}
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell sx={{ ...tdSx, fontSize: '0.82rem' }}>{row.note ?? ''}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      </Box>

      {/* ── Right: Detail panel ── */}
      <Box
        sx={{
          width: 300,
          flexShrink: 0,
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          border: '1px solid',
          borderColor: 'divider',
          borderRadius: 2,
          bgcolor: 'background.paper',
          overflow: 'hidden',
        }}
      >
        <Box sx={{ px: 2, py: 1.25, borderBottom: '1px solid', borderColor: 'divider' }}>
          <Typography variant="body2" sx={{ fontWeight: 700, fontSize: '0.9rem' }}>
            {t('page.purchase.invoice.detail.title')}
          </Typography>
        </Box>
        <Box sx={{ px: 2, py: 1.5, flex: 1 }}>
          {[
            { label: t('page.purchase.invoice.detail.registerNo'), value: registerNo },
            { label: t('page.purchase.invoice.detail.staff'), value: staff },
            { label: t('page.purchase.invoice.detail.staffCode'), value: MOCK_META.staffCode },
            { label: t('page.purchase.invoice.detail.businessDay'), value: businessDay },
            { label: t('page.purchase.invoice.detail.createdAt'), value: createdAt },
          ].map(({ label, value }) => (
            <DetailRow key={label} label={label} value={value} />
          ))}
        </Box>
        <Box sx={{ px: 2, py: 1.5 }}>
          <DetailRow label={t('page.purchase.invoice.detail.itemCount')} value={`${itemCount}点`} />
          <Divider sx={{ my: 0.75, borderColor: 'text.primary' }} />
          <DetailRow label={t('page.purchase.invoice.detail.subtotal')} value={`¥${subtotal.toLocaleString()}`} />
          <DetailRow label={t('page.purchase.invoice.detail.tax')} value={`¥${tax.toLocaleString()}`} />
          <DetailRow label={t('page.purchase.invoice.detail.total')} value={`¥${total.toLocaleString()}`} large />
        </Box>
      </Box>

      </Box>
      )}

      {/* X-06 取消確認 */}
      {dialogStep === 'cancel_confirm' && (
        <CancelConfirmDialog onConfirm={handleConfirmCancel} onCancel={handleCancel} />
      )}

      {/* E-44-01-05 買取金額を投入（取消ルート／TOBE補足：キャッシュレスは現金過不足） */}
      {dialogStep === 'cash_input' && (
        <CashDepositDialog onConfirm={handleConfirmCash} onCancel={handleCancel} />
      )}

      {/* E-44-01-06 再作成確認 (shown when SHOW_RECREATE_ALERT=true) */}
      {dialogStep === 'recreate_confirm' && (
        <RecreateConfirmDialog
          productName={MOCK_ITEMS[0].productName}
          onConfirm={handleConfirmRecreate}
          onCancel={handleCancel}
        />
      )}

      {/* E-44-01-07: 理由選択 */}
      {dialogStep === 'reason_select' && (
        <ReasonSelectDialog onConfirm={handleConfirmReason} onCancel={handleCancel} />
      )}

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
