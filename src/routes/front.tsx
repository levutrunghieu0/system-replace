import { createFileRoute } from '@tanstack/react-router'
import { useMemo, useState, type ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Card from '@mui/material/Card'
import Chip from '@mui/material/Chip'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogTitle from '@mui/material/DialogTitle'
import Divider from '@mui/material/Divider'
import IconButton from '@mui/material/IconButton'
import InputAdornment from '@mui/material/InputAdornment'
import LinearProgress from '@mui/material/LinearProgress'
import OutlinedInput from '@mui/material/OutlinedInput'
import Paper from '@mui/material/Paper'
import Radio from '@mui/material/Radio'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet'
import AddIcon from '@mui/icons-material/Add'
import CheckIcon from '@mui/icons-material/Check'
import CloseIcon from '@mui/icons-material/Close'
import ContactlessIcon from '@mui/icons-material/Contactless'
import CreditCardIcon from '@mui/icons-material/CreditCard'
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined'
import ListAltIcon from '@mui/icons-material/ListAlt'
import LocalAtmIcon from '@mui/icons-material/LocalAtm'
import QrCode2Icon from '@mui/icons-material/QrCode2'
import QrCodeScannerIcon from '@mui/icons-material/QrCodeScanner'
import RemoveIcon from '@mui/icons-material/Remove'
import SearchIcon from '@mui/icons-material/Search'
import TuneIcon from '@mui/icons-material/Tune'
import { useLayoutConfig } from '../hooks/useLayoutConfig'

export const Route = createFileRoute('/front')({
  component: FrontPage,
})

type FrontMode = 'idle' | 'sale-empty' | 'sale-cart' | 'payment' | 'register-blank' | 'register-count' | 'register-confirmed'
type DialogMode = 'cardSelect' | 'cardAmount' | 'paymentComplete' | 'installment' | 'cardProcessing' | 'barcodeAmount' | 'barcodeScan' | null

interface SaleRow {
  deal: string
  code: string
  name: string
  attr: string
  qty: string
  unit: string
  amount: string
  tax: string
  tone?: 'red' | 'blue'
  divider?: boolean
}

const BLUE = '#1478f0'
const BORDER = '#d8dee6'
const HEADER_BG = '#f4f6f8'
const SOFT_BLUE = '#eef6ff'
const saleRows: SaleRow[] = [
  { deal: 'サンプル', code: '12345\n67890\n12345', name: 'JORDAN BRAND AS M\nJERS NIKE JP\n特選コメント', attr: 'S', qty: '1', unit: '¥2,000', amount: '¥2,000', tax: 'あああ' },
  { deal: 'サンプル', code: '12345\n67890\n12345', name: 'JORDAN BRAND AS M\nJERS NIKE JP\n特選コメント', attr: 'S', qty: '10,000', unit: '¥0,800,000', amount: '¥10,000,000', tax: 'あああ', tone: 'red' },
  { deal: 'サンプル', code: '12345\n67890\n12345', name: 'JORDAN BRAND AS M\nJERS NIKE JP\n特選コメント', attr: 'S', qty: '100', unit: '¥1,000', amount: '¥900', tax: '税込' },
  { deal: 'サンプル', code: '12345\n67890\n12345', name: 'JORDAN BRAND AS M\nJERS NIKE JP\n特選コメント', attr: 'S', qty: '10,000', unit: '¥0,800,000', amount: '¥10,000,000', tax: '非課税', tone: 'blue' },
  { deal: 'サンプル', code: '12345\n67890\n12345', name: 'JORDAN BRAND AS M\nJERS NIKE JP\n特選コメント', attr: 'S', qty: '1,000', unit: '¥1', amount: '¥1,000,000', tax: 'あああ', divider: true },
  { deal: 'サンプル', code: '12345\n67890\n12345', name: 'JORDAN BRAND AS M\nJERS NIKE JP\n特選コメント', attr: 'S', qty: '10,000', unit: '¥0,800,000', amount: '¥10,000,000', tax: 'あああ' },
]
const denominations = ['10,000円', '5,000円', '2,000円', '1,000円', '500円', '100円', '50円', '10円', '5円', '1円']
function FrontPage() {
  const { t } = useTranslation()
  const [mode, setMode] = useState<FrontMode>('idle')
  const [dialog, setDialog] = useState<DialogMode>(null)
  const [selectedCoupon, setSelectedCoupon] = useState('couponA')
  const [showReceipt, setShowReceipt] = useState(false)

  const title = mode.startsWith('register')
    ? t('page.front.title.registerOpen')
    : mode === 'payment'
      ? t('page.front.title.payment')
      : mode === 'sale-cart'
        ? t('page.front.title.sales')
        : t('page.front.title.front')

  const actions = useMemo(() => {
    const stop = { key: 'stop', labelKey: 'page.front.action.stopWork', variant: 'outlined' as const, position: 'left' as const, onClick: () => setMode('idle') }
    if (mode === 'idle') return [{ ...stop, disabled: true }]
    if (mode === 'sale-empty') {
      return [
        stop,
        { key: 'prev-day', labelKey: 'page.front.action.prevDayReflect', variant: 'outlined' as const, position: 'left' as const, disabled: true, onClick: () => undefined },
        { key: 'ticket-list', labelKey: 'page.front.action.ticketList', variant: 'outlined' as const, position: 'left' as const, onClick: () => setMode('sale-cart') },
        { key: 'reception', labelKey: 'page.front.action.receptionTicket', variant: 'outlined' as const, position: 'left' as const, onClick: () => undefined },
        { key: 'reception-info', labelKey: 'page.front.action.receptionInfo', variant: 'outlined' as const, position: 'left' as const, onClick: () => undefined },
        { key: 'receipt-fix', labelKey: 'page.front.action.receiptFix', variant: 'outlined' as const, position: 'left' as const, onClick: () => undefined },
        { key: 'correction', labelKey: 'page.front.action.correction', variant: 'outlined' as const, position: 'left' as const, onClick: () => undefined },
        { key: 'checkout', labelKey: 'page.front.action.checkout', variant: 'contained' as const, position: 'right' as const, disabled: true, onClick: () => undefined },
      ]
    }
    if (mode === 'sale-cart') {
      return [
        stop,
        { key: 'prev-day', labelKey: 'page.front.action.prevDayReflect', variant: 'outlined' as const, position: 'left' as const, disabled: true, onClick: () => undefined },
        { key: 'ticket-list', labelKey: 'page.front.action.ticketList', variant: 'outlined' as const, position: 'left' as const, onClick: () => undefined },
        { key: 'reception', labelKey: 'page.front.action.receptionTicket', variant: 'outlined' as const, position: 'left' as const, onClick: () => undefined },
        { key: 'reception-info', labelKey: 'page.front.action.receptionInfo', variant: 'outlined' as const, position: 'left' as const, onClick: () => undefined },
        { key: 'receipt-fix', labelKey: 'page.front.action.receiptFix', variant: 'outlined' as const, position: 'left' as const, onClick: () => undefined },
        { key: 'correction', labelKey: 'page.front.action.correction', variant: 'outlined' as const, position: 'left' as const, onClick: () => undefined },
        { key: 'checkout', labelKey: 'page.front.action.checkout', variant: 'contained' as const, position: 'right' as const, onClick: () => setMode('payment') },
      ]
    }
    if (mode === 'payment') {
      return [
        { ...stop, onClick: () => setMode('sale-cart') },
        { key: 'sample-a', labelKey: 'page.front.sample', variant: 'outlined' as const, position: 'left' as const, onClick: () => setDialog('paymentComplete') },
        { key: 'sample-b', labelKey: 'page.front.sample', variant: 'outlined' as const, position: 'left' as const, onClick: () => setDialog('installment') },
        { key: 'finish', labelKey: 'page.front.action.finish', variant: 'contained' as const, position: 'right' as const, onClick: () => setMode('register-blank') },
      ]
    }
    if (mode === 'register-blank') {
      return [
        { ...stop, onClick: () => setMode('payment') },
        { key: 'prev-register', labelKey: 'page.front.action.prevRegisterAmount', variant: 'outlined' as const, position: 'left' as const, disabled: true, onClick: () => undefined },
        { key: 'run', labelKey: 'page.front.action.execute', variant: 'contained' as const, position: 'right' as const, disabled: true, onClick: () => undefined },
      ]
    }
    return [
      { ...stop, onClick: () => setMode('payment') },
      { key: 'prev-register', labelKey: mode === 'register-confirmed' ? 'page.front.action.prevCloseRelease' : 'page.front.action.prevCloseReflect', variant: 'outlined' as const, position: 'left' as const, onClick: () => setMode(mode === 'register-confirmed' ? 'register-count' : 'register-confirmed') },
      { key: 'run', labelKey: 'page.front.action.execute', variant: 'contained' as const, position: 'right' as const, onClick: () => setShowReceipt(true) },
    ]
  }, [mode])

  useLayoutConfig({
    title,
    showBackButton: mode !== 'idle',
    hideSecondaryNav: true,
    actions,
    onBack: () => setMode(mode === 'payment' ? 'sale-cart' : mode.startsWith('register') ? 'payment' : 'idle'),
  })

  return (
    <Box sx={{ height: '100%', minHeight: 0, display: 'flex', flexDirection: 'column', gap: 1 }}>
      {mode === 'idle' && <BlankStage onStart={() => setMode('sale-empty')} />}
      {mode === 'sale-empty' && <SaleWorkspace empty onAdd={() => setMode('sale-cart')} selectedCoupon={selectedCoupon} onCouponChange={setSelectedCoupon} />}
      {mode === 'sale-cart' && <SaleWorkspace onAdd={() => setMode('payment')} selectedCoupon={selectedCoupon} onCouponChange={setSelectedCoupon} />}
      {mode === 'payment' && <PaymentWorkspace onOpenDialog={setDialog} />}
      {mode === 'register-blank' && <BlankStage onStart={() => setMode('register-count')} />}
      {(mode === 'register-count' || mode === 'register-confirmed') && <RegisterCount confirmed={mode === 'register-confirmed'} />}
      <PaymentDialogs dialog={dialog} onClose={() => setDialog(null)} onDialog={setDialog} />
      <ReceiptOverlay open={showReceipt} onClose={() => { setShowReceipt(false); setMode('register-blank') }} />
    </Box>
  )
}

function BlankStage({ onStart }: { onStart: () => void }) {
  return <Paper onClick={onStart} variant="outlined" sx={{ flex: 1, minHeight: 0, cursor: 'pointer', bgcolor: 'white', borderColor: BORDER }} />
}

function SaleWorkspace({ empty = false, onAdd, selectedCoupon, onCouponChange }: { empty?: boolean; onAdd: () => void; selectedCoupon: string; onCouponChange: (coupon: string) => void }) {
  return (
    <Box sx={{ flex: 1, minHeight: 0, display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 292px', gap: 1 }}>
      <Box sx={{ minWidth: 0, display: 'flex', flexDirection: 'column', gap: 0.75 }}>
        <SaleToolbar onAdd={onAdd} />
        <Paper variant="outlined" sx={{ flex: 1, minHeight: 0, overflow: 'hidden', bgcolor: 'white', borderColor: BORDER }}>
          {empty ? <EmptySaleCanvas /> : <SaleTable />}
        </Paper>
      </Box>
      {empty ? <EmptyDetail /> : <SaleDetail selectedCoupon={selectedCoupon} onCouponChange={onCouponChange} />}
    </Box>
  )
}

function SaleToolbar({ onAdd }: { onAdd: () => void }) {
  const { t } = useTranslation()

  return (
    <Box sx={{ height: 36, display: 'flex', alignItems: 'center', gap: 0.75 }}>
      <OutlinedInput
        size="small"
        placeholder={t('header.search')}
        startAdornment={<InputAdornment position="start"><SearchIcon sx={{ fontSize: 17 }} /></InputAdornment>}
        endAdornment={<InputAdornment position="end"><TuneIcon sx={{ fontSize: 17 }} /></InputAdornment>}
        sx={{ width: 345, height: 32, bgcolor: 'white', fontSize: 12 }}
      />
      <Button onClick={onAdd} size="small" variant="contained" sx={{ height: 28, minWidth: 82, fontSize: 11 }}>{t('page.front.action.createCase')}</Button>
      {[1, 2, 3].map((item) => <Chip key={item} label={t('page.front.sample')} variant="outlined" size="small" sx={{ height: 25, fontSize: 11 }} />)}
      <Box sx={{ flex: 1 }} />
      <Radio size="small" sx={{ p: 0.25 }} /><Typography variant="caption">{t('page.front.sale')}</Typography>
      <Radio size="small" sx={{ p: 0.25 }} /><Typography variant="caption">{t('page.front.newest')}</Typography>
    </Box>
  )
}

function EmptySaleCanvas() {
  const { t } = useTranslation()
  const items = [
    { icon: <SearchIcon />, title: t('page.front.empty.search'), text: t('page.front.empty.searchText') },
    { icon: <QrCodeScannerIcon />, title: t('page.front.empty.scan'), text: t('page.front.empty.scanText') },
    { icon: <ListAltIcon />, title: t('page.front.empty.list'), text: t('page.front.empty.listText') },
  ]

  return (
    <Box sx={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 9, color: '#8a98a8' }}>
      {items.map((item) => (
        <Box key={item.title} sx={{ textAlign: 'center', minWidth: 98 }}>
          <Box sx={{ '& svg': { fontSize: 42, color: '#9ba9b8' } }}>{item.icon}</Box>
          <Typography sx={{ fontSize: 14, fontWeight: 700 }}>{item.title}</Typography>
          <Typography variant="caption" sx={{ fontSize: 10 }}>{item.text}</Typography>
        </Box>
      ))}
    </Box>
  )
}

function SaleTable() {
  const { t } = useTranslation()
  const columns = ['deal', 'code', 'name', 'attr', 'qty', 'unit', 'amount', 'note']

  return (
    <Table size="small" stickyHeader sx={{ tableLayout: 'fixed', '& th': { bgcolor: HEADER_BG, fontWeight: 700, fontSize: 11, borderColor: BORDER, py: 0.7 }, '& td': { fontSize: 11, whiteSpace: 'pre-line', py: 0.55, borderColor: BORDER } }}>
      <TableHead>
        <TableRow>{columns.map((column) => <TableCell key={column} align={['qty', 'unit', 'amount'].includes(column) ? 'right' : 'left'}>{t(`page.front.table.${column}`)}</TableCell>)}</TableRow>
      </TableHead>
      <TableBody>
        {saleRows.map((row, index) => (
          <TableRow key={`${row.code}-${index}`} sx={{ borderTop: row.divider ? `2px dashed ${BLUE}` : undefined }}>
            <TableCell sx={{ width: 60 }}>{row.deal}</TableCell>
            <TableCell>{row.code}</TableCell>
            <TableCell sx={{ width: 185, fontWeight: 700 }}>{row.name}</TableCell>
            <TableCell>{row.attr}</TableCell>
            <TableCell align="right">{row.qty}</TableCell>
            <TableCell align="right">{row.unit}</TableCell>
            <TableCell align="right" sx={{ color: row.tone === 'red' ? 'error.main' : row.tone === 'blue' ? BLUE : 'text.primary', fontWeight: 800 }}>{row.amount}<Typography variant="caption" display="block" color="primary">税込 +¥1,000</Typography></TableCell>
            <TableCell>{row.tax}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}

function EmptyDetail() {
  const { t } = useTranslation()

  return (
    <SidePanel title={t('page.front.breakdownDetail')}>
      <Typography variant="caption">{t('page.front.serialNo')}</Typography>
      <Divider sx={{ my: 1 }} />
      <Box sx={{ flex: 1 }} />
      <SummaryLine label={t('page.front.qtyCount')} value="0点" />
      <SummaryLine label={t('page.front.subtotal')} value="¥0" />
      <SummaryLine label={t('page.front.tax')} value="¥0" />
    </SidePanel>
  )
}

function SaleDetail({ selectedCoupon, onCouponChange }: { selectedCoupon: string; onCouponChange: (coupon: string) => void }) {
  const { t } = useTranslation()
  const coupons = ['couponA', 'couponB', 'couponC', 'couponD']

  return (
    <SidePanel title={<Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>{t('page.front.breakdownDetail')} <Chip label={t('page.front.productIn')} color="primary" size="small" sx={{ height: 18, fontSize: 9 }} /></Box>}>
      <Typography variant="caption" sx={{ fontWeight: 700 }}>{t('page.front.couponInfo')}</Typography>
      {coupons.map((coupon) => (
        <Box
          key={coupon}
          onClick={() => onCouponChange(coupon)}
          sx={{ mt: 0.7, p: 0.7, height: 42, border: '1px solid', borderColor: selectedCoupon === coupon ? BLUE : BORDER, bgcolor: selectedCoupon === coupon ? SOFT_BLUE : 'white', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
        >
          <Radio checked={selectedCoupon === coupon} size="small" sx={{ p: 0.25, mr: 0.5 }} />
          <Typography variant="caption">{t(`page.front.${coupon}`)}</Typography>
        </Box>
      ))}
      <Box sx={{ flex: 1 }} />
      <SummaryLine label={t('page.front.qtyCount')} value="1点" />
      <SummaryLine label={t('page.front.subtotal')} value="¥10,000" />
      <SummaryLine label={t('page.front.tax')} value="¥1,000" />
      <SummaryLine label={t('page.front.discountTotal')} value="-¥1,000" danger />
      <SummaryLine label={t('page.front.couponDiscount')} value="-¥1,000" danger />
      <Divider sx={{ my: 1 }} />
      <SummaryLine label={t('page.front.totalAmount')} value="¥8,800" blue large />
    </SidePanel>
  )
}

function PaymentWorkspace({ onOpenDialog }: { onOpenDialog: (dialog: DialogMode) => void }) {
  const { t } = useTranslation()

  return (
    <Box sx={{ flex: 1, minHeight: 0, display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 292px', gap: 1 }}>
      <Box sx={{ minHeight: 0, display: 'grid', gridTemplateRows: 'minmax(0, 1fr) 188px', gap: 1 }}>
        <Paper variant="outlined" sx={{ overflow: 'hidden', borderColor: BORDER }}>
          <Table size="small" sx={{ '& th': { bgcolor: HEADER_BG, fontSize: 11 }, '& td': { fontSize: 12 } }}>
            <TableHead><TableRow><TableCell>{t('page.front.depositType')}</TableCell><TableCell align="right">{t('page.front.totalAmount')}</TableCell></TableRow></TableHead>
            <TableBody>{[1, 2, 3].map((item) => <TableRow key={item}><TableCell>{t('page.front.longSample')}</TableCell><TableCell align="right">¥00,000,000</TableCell></TableRow>)}</TableBody>
          </Table>
        </Paper>
        <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1 }}><BillPanel /><PaymentBreakdown /></Box>
      </Box>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
        <PayCard title={t('page.front.creditSettlement')}><PayButton icon={<CreditCardIcon />} label={t('page.front.credit')} onClick={() => onOpenDialog('cardSelect')} /></PayCard>
        <PayCard title={t('page.front.cashlessSettlement')}>
          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1 }}>
            <PayButton icon={<QrCode2Icon />} label={t('page.front.barcodePay')} onClick={() => onOpenDialog('barcodeAmount')} />
            <PayButton icon={<ContactlessIcon />} label={t('page.front.eMoney')} onClick={() => onOpenDialog('paymentComplete')} />
          </Box>
          <Button sx={{ mt: 1, height: 36 }} variant="contained" fullWidth>{t('page.front.otherPay')}</Button>
        </PayCard>
        <PayCard title={t('page.front.cashSettlement')}><TextField size="small" placeholder={t('page.front.amountInput')} fullWidth /><SummaryLine label={t('page.front.change')} value="¥0" blue /></PayCard>
      </Box>
    </Box>
  )
}

function BillPanel() {
  const { t } = useTranslation()

  return <Paper variant="outlined" sx={{ p: 1.4, borderColor: BORDER }}><Typography sx={{ fontWeight: 700, fontSize: 13 }}>{t('page.front.billingInfo')}</Typography><SummaryLine label={t('page.front.qtyCount')} value="0点" /><SummaryLine label={t('page.front.discount')} value="-¥0" danger /><SummaryLine label={t('page.front.subtotal')} value="¥0" /><SummaryLine label={t('page.front.tax')} value="¥0" /><Divider sx={{ my: 0.8 }} /><SummaryLine label={t('page.front.totalAmount')} value="¥0" blue /></Paper>
}

function PaymentBreakdown() {
  const { t } = useTranslation()

  return <Paper variant="outlined" sx={{ p: 1.4, borderColor: BORDER }}><Typography sx={{ fontWeight: 700, fontSize: 13 }}>{t('page.front.paymentBreakdown')}</Typography>{['cash', 'credit', 'pay'].map((method) => <SummaryLine key={method} label={t(`page.front.${method}`)} value="¥0" />)}<Divider sx={{ my: 0.8 }} /><SummaryLine label={t('page.front.balance')} value="¥0" danger /></Paper>
}

function PaymentDialogs({ dialog, onClose, onDialog }: { dialog: DialogMode; onClose: () => void; onDialog: (dialog: DialogMode) => void }) {
  const { t } = useTranslation()

  if (dialog === 'cardSelect') return <CommonDialog title={t('page.front.dialog.cardTitle')} onClose={onClose} onConfirm={() => onDialog('cardAmount')} confirm={t('page.front.done')}><Typography variant="body2">{t('page.front.dialog.selectCard')}</Typography><Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 1, mt: 2 }}>{Array.from({ length: 12 }, (_, index) => <Button key={index} variant={index === 0 ? 'contained' : 'outlined'}>{t('page.front.sample')}</Button>)}</Box></CommonDialog>
  if (dialog === 'cardAmount') return <CommonDialog title={t('page.front.dialog.cardTitle')} onClose={onClose} onConfirm={() => onDialog('paymentComplete')} confirm={t('page.front.confirm')}><SummaryLine label={t('page.front.totalAmount')} value="¥10,000" blue large /><TextField sx={{ mt: 2 }} size="small" fullWidth label={t('page.front.dialog.cardAmount')} value="¥10,000" /></CommonDialog>
  if (dialog === 'paymentComplete') return <CommonDialog icon={<CheckIcon sx={{ fontSize: 56 }} />} title={t('page.front.dialog.terminalComplete')} onClose={onClose} onConfirm={onClose} confirm={t('page.front.retry')}><Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1 }}>{['icWith', 'icWithout', 'authCard', 'cancelDeal'].map((key) => <Card key={key} variant="outlined" sx={{ p: 2, bgcolor: '#f1f3f5' }}><Typography sx={{ fontWeight: 700 }}>{t(`page.front.dialog.${key}`)}</Typography><Typography variant="caption">{t('page.front.dialog.terminalGuide')}</Typography></Card>)}</Box></CommonDialog>
  if (dialog === 'installment') return <CommonDialog title={t('page.front.dialog.installmentTitle')} onClose={onClose} onConfirm={() => onDialog('cardProcessing')} confirm={t('page.front.done')}><Typography variant="body2">{t('page.front.dialog.selectInstallment')}</Typography><Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 1, mt: 2 }}>{['1回', '3回', '5回', '12回', 'リボ払い', 'サンプル', 'サンプル', 'サンプル', 'サンプル', 'サンプル'].map((label, index) => <Button key={`${label}-${index}`} variant={index === 0 ? 'contained' : 'outlined'}>{label}</Button>)}</Box></CommonDialog>
  if (dialog === 'cardProcessing') return <CommonDialog icon={<InfoOutlinedIcon sx={{ fontSize: 56 }} />} title={t('page.front.dialog.cardProcessing')} onClose={onClose} onConfirm={onClose} confirm={t('page.front.retry')}><Typography align="center" sx={{ fontWeight: 700 }}>{t('page.front.dialog.terminalInput')}</Typography><LinearProgress sx={{ my: 2 }} /><Typography variant="caption" display="block" align="center">{t('page.front.dialog.terminalGuide')}</Typography></CommonDialog>
  if (dialog === 'barcodeAmount') return <CommonDialog title={t('page.front.dialog.barcodeTitle')} onClose={onClose} onConfirm={() => onDialog('barcodeScan')} confirm={t('page.front.confirm')}><SummaryLine label={t('page.front.totalAmount')} value="¥10,000" blue large /><TextField sx={{ mt: 2 }} size="small" fullWidth label={t('page.front.dialog.barcodeAmount')} value="¥10,000" /></CommonDialog>
  if (dialog === 'barcodeScan') return <CommonDialog icon={<InfoOutlinedIcon sx={{ fontSize: 56 }} />} title={t('page.front.dialog.scanCustomerBarcode')} onClose={onClose} onConfirm={onClose} confirm={t('page.front.retry')} />
  return null
}

function RegisterCount({ confirmed }: { confirmed: boolean }) {
  const { t } = useTranslation()

  return (
    <Box sx={{ flex: 1, minHeight: 0, display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 292px', gap: 1 }}>
      <Paper variant="outlined" sx={{ p: 1, position: 'relative', bgcolor: confirmed ? '#fff0f2' : 'white', overflow: 'auto', borderColor: confirmed ? '#ffc9d1' : BORDER }}>
        <Table size="small" sx={{ '& th': { bgcolor: HEADER_BG, fontSize: 11 }, '& td': { fontSize: 12, py: 0.45 } }}>
          <TableHead><TableRow><TableCell>{t('page.front.denomination')}</TableCell><TableCell>{t('page.front.count')}</TableCell><TableCell align="right">{t('page.front.amount')}</TableCell></TableRow></TableHead>
          <TableBody>{denominations.map((denomination, index) => <RegisterDenominationRow key={denomination} denomination={denomination} index={index} />)}</TableBody>
        </Table>
        {confirmed && <Typography sx={{ position: 'absolute', left: 170, top: 215, color: 'error.main', fontSize: 28, fontWeight: 900, lineHeight: 1.55, textAlign: 'center', whiteSpace: 'pre-line' }}>{t('page.front.registerConfirmedNote')}</Typography>}
        <TextField size="small" placeholder={t('page.front.adjustmentPlaceholder')} fullWidth sx={{ mt: 0.8, bgcolor: 'white' }} />
      </Paper>
      {confirmed ? <RegisterConfirmedSide /> : <SidePanel title={t('page.front.breakdownDetail')}><InfoBox icon={<InfoOutlinedIcon color="primary" />} label={t('page.front.prevCashReserve')} value="¥000,000,000" /><InfoBox icon={<AccountBalanceWalletIcon color="error" />} label={t('page.front.cashDetail')} value="-¥000,000,000" danger /><Box sx={{ flex: 1 }} /><SummaryLine label={t('page.front.totalAmount')} value="¥0" blue /></SidePanel>}
    </Box>
  )
}

function RegisterDenominationRow({ denomination, index }: { denomination: string; index: number }) {
  return (
    <TableRow>
      <TableCell sx={{ width: 90 }}>{denomination}</TableCell>
      <TableCell>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <IconButton size="small" sx={{ border: '1px solid', borderColor: BORDER, borderRadius: 0.5, width: 22, height: 22 }}><RemoveIcon sx={{ fontSize: 14 }} /></IconButton>
          <TextField size="small" value={index === 0 ? '10' : ''} sx={{ width: 54, '& input': { textAlign: 'center', p: 0.45, fontSize: 12 } }} />
          <IconButton size="small" sx={{ border: '1px solid', borderColor: BORDER, borderRadius: 0.5, width: 22, height: 22 }}><AddIcon sx={{ fontSize: 14 }} /></IconButton>
          <Typography variant="caption" color="text.disabled">{'›'.repeat(62)}</Typography>
        </Box>
      </TableCell>
      <TableCell align="right" sx={{ color: index === 0 ? BLUE : 'text.secondary', fontWeight: 800 }}>{index === 0 ? '¥100,000' : '¥0'}</TableCell>
    </TableRow>
  )
}

function RegisterConfirmedSide() {
  const { t } = useTranslation()

  return <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}><PayCard title={t('page.front.safeCash')}><SummaryLine label={t('page.front.cashReserve')} value="¥000,000,000" /><SummaryLine label={t('page.front.cashDifference')} value="¥000,000,000" blue /></PayCard><PayCard title={t('page.front.registerCash')}><SummaryLine label={t('page.front.cashReserve')} value="¥000,000,000" /><SummaryLine label={t('page.front.cashDifference')} value="¥000,000,000" danger /></PayCard><Box sx={{ flex: 1 }} /><PayCard title={t('page.front.totalAmount')}><SummaryLine label="" value="¥0" blue large /></PayCard></Box>
}

function ReceiptOverlay({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { t } = useTranslation()

  if (!open) return null
  return <Box sx={{ position: 'fixed', inset: 0, bgcolor: 'rgba(0,0,0,0.55)', zIndex: 2000, display: 'flex', justifyContent: 'center', alignItems: 'center' }}><IconButton onClick={onClose} sx={{ position: 'absolute', top: 24, right: 24, color: 'white' }}><CloseIcon /></IconButton><Paper sx={{ width: 420, height: 620, p: 4, bgcolor: 'white' }}><Typography variant="caption">{t('page.front.receiptTitle')}</Typography><Divider sx={{ my: 2 }} /><Typography variant="body2" sx={{ whiteSpace: 'pre-line' }}>{t('page.front.receiptBody')}</Typography></Paper><Button onClick={onClose} variant="contained" sx={{ position: 'absolute', right: 24, bottom: 24, borderRadius: '50%', minWidth: 56, height: 56 }}><LocalAtmIcon /></Button></Box>
}

function CommonDialog({ title, icon, children, onClose, onConfirm, confirm }: { title: string; icon?: ReactNode; children?: ReactNode; onClose: () => void; onConfirm: () => void; confirm: string }) {
  const { t } = useTranslation()

  return <Dialog open maxWidth="sm" fullWidth><DialogTitle sx={{ textAlign: icon ? 'center' : 'left', fontWeight: 800 }}>{icon}<Box component="span" sx={{ display: 'block' }}>{title}</Box></DialogTitle><DialogContent dividers>{children}</DialogContent><DialogActions sx={{ justifyContent: 'center', gap: 1, p: 2 }}><Button variant="outlined" onClick={onClose} sx={{ minWidth: 150 }}>{t('page.front.cancel')}</Button><Button variant="contained" onClick={onConfirm} sx={{ minWidth: 150 }}>{confirm}</Button></DialogActions></Dialog>
}

function SidePanel({ title, children }: { title: ReactNode; children: ReactNode }) {
  return <Paper variant="outlined" sx={{ minWidth: 0, p: 1.2, display: 'flex', flexDirection: 'column', bgcolor: 'white', borderColor: BORDER }}><Typography sx={{ fontWeight: 700, mb: 0.8, fontSize: 13 }}>{title}</Typography><Divider sx={{ mb: 1 }} />{children}</Paper>
}

function SummaryLine({ label, value, blue, danger, large }: { label: string; value: string; blue?: boolean; danger?: boolean; large?: boolean }) {
  return <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', py: 0.4 }}><Typography variant="caption" sx={{ fontWeight: large ? 700 : 500 }}>{label}</Typography><Typography variant={large ? 'h6' : 'caption'} sx={{ color: blue ? BLUE : danger ? 'error.main' : 'text.primary', fontWeight: 800 }}>{value}</Typography></Box>
}

function PayCard({ title, children }: { title: string; children: ReactNode }) {
  return <Paper variant="outlined" sx={{ p: 1.2, bgcolor: 'white', borderColor: BORDER }}><Typography sx={{ fontWeight: 700, mb: 1, fontSize: 13 }}>{title}</Typography>{children}</Paper>
}

function PayButton({ icon, label, onClick }: { icon: ReactNode; label: string; onClick: () => void }) {
  return <Button onClick={onClick} variant="contained" sx={{ minHeight: 78, flexDirection: 'column', gap: 0.45, fontSize: 12 }}>{icon}{label}</Button>
}

function InfoBox({ icon, label, value, danger }: { icon: ReactNode; label: string; value: string; danger?: boolean }) {
  return <Box sx={{ border: '1px solid', borderColor: danger ? 'error.main' : BORDER, borderRadius: 1, p: 1, mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>{icon}<Box sx={{ flex: 1 }}><Typography variant="caption">{label}</Typography><Typography sx={{ fontWeight: 800, color: danger ? 'error.main' : 'text.primary' }}>{value}</Typography></Box></Box>
}
