import { createFileRoute } from '@tanstack/react-router'
import { useMemo, useState, type ReactNode } from 'react'
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

const BLUE = '#1677e8'
const BORDER = '#d9e0e7'
const SOFT = '#f5f7fa'

const saleRows = [
  { deal: 'サンプル', code: '12345\n67890\n12345', name: 'JORDAN BRAND AS M\nJERS NIKE JP\n特選コメント', attr: 'S', qty: '1', unit: '¥2,000', amount: '¥2,000', tax: 'あああ' },
  { deal: 'サンプル', code: '12345\n67890\n12345', name: 'JORDAN BRAND AS M\nJERS NIKE JP\n特選コメント', attr: 'S', qty: '10,000', unit: '¥0,800,000', amount: '¥10,000,000', tax: 'あああ', red: true },
  { deal: 'サンプル', code: '12345\n67890\n12345', name: 'JORDAN BRAND AS M\nJERS NIKE JP\n特選コメント', attr: 'S', qty: '100', unit: '¥1,000', amount: '¥900', tax: '税込' },
  { deal: 'サンプル', code: '12345\n67890\n12345', name: 'JORDAN BRAND AS M\nJERS NIKE JP\n特選コメント', attr: 'S', qty: '10,000', unit: '¥0,800,000', amount: '¥10,000,000', tax: '非課税', blue: true },
  { deal: 'サンプル', code: '12345\n67890\n12345', name: 'JORDAN BRAND AS M\nJERS NIKE JP\n特選コメント', attr: 'S', qty: '1,000', unit: '¥1', amount: '¥1,000,000', tax: 'あああ', divider: true },
  { deal: 'サンプル', code: '12345\n67890\n12345', name: 'JORDAN BRAND AS M\nJERS NIKE JP\n特選コメント', attr: 'S', qty: '10,000', unit: '¥0,800,000', amount: '¥10,000,000', tax: 'あああ' },
]

const denominations = ['10,000円', '5,000円', '2,000円', '1,000円', '500円', '100円', '50円', '10円', '5円', '1円']

function FrontPage() {
  const [mode, setMode] = useState<FrontMode>('idle')
  const [dialog, setDialog] = useState<DialogMode>(null)
  const [selectedCoupon, setSelectedCoupon] = useState('クーポンA')
  const [showReceipt, setShowReceipt] = useState(false)

  const isRegister = mode.startsWith('register')
  const title = isRegister ? '全体レジ開設' : mode === 'payment' ? 'フロント(会計)' : mode === 'sale-cart' ? 'フロント(売上)' : 'フロント'

  const actions = useMemo(() => {
    if (mode === 'idle') {
      return [{ key: 'cancel', labelKey: '作業を中止', variant: 'outlined' as const, position: 'left' as const, disabled: true, onClick: () => undefined }]
    }
    if (mode === 'sale-empty') {
      return [
        { key: 'cancel', labelKey: '作業を中止', variant: 'outlined' as const, position: 'left' as const, onClick: () => setMode('idle') },
        { key: 'next', labelKey: '伝票一覧', variant: 'outlined' as const, position: 'left' as const, onClick: () => setMode('sale-cart') },
        { key: 'receive', labelKey: '受付票', variant: 'outlined' as const, position: 'left' as const, onClick: () => undefined },
        { key: 'edit', labelKey: '伝票修正', variant: 'outlined' as const, position: 'left' as const, onClick: () => undefined },
        { key: 'checkout', labelKey: '会計', variant: 'contained' as const, position: 'right' as const, disabled: true, onClick: () => undefined },
      ]
    }
    if (mode === 'sale-cart') {
      return [
        { key: 'cancel', labelKey: '作業を中止', variant: 'outlined' as const, position: 'left' as const, onClick: () => setMode('idle') },
        { key: 'list', labelKey: '伝票一覧', variant: 'outlined' as const, position: 'left' as const, onClick: () => undefined },
        { key: 'receive', labelKey: '受付票', variant: 'outlined' as const, position: 'left' as const, onClick: () => undefined },
        { key: 'keep', labelKey: '受付情報', variant: 'outlined' as const, position: 'left' as const, onClick: () => undefined },
        { key: 'receipt', labelKey: 'レシ補正', variant: 'outlined' as const, position: 'left' as const, onClick: () => undefined },
        { key: 'fix', labelKey: '訂正', variant: 'outlined' as const, position: 'left' as const, onClick: () => undefined },
        { key: 'checkout', labelKey: '会計', variant: 'contained' as const, position: 'right' as const, onClick: () => setMode('payment') },
      ]
    }
    if (mode === 'payment') {
      return [
        { key: 'cancel', labelKey: '作業を中止', variant: 'outlined' as const, position: 'left' as const, onClick: () => setMode('sale-cart') },
        { key: 'sample1', labelKey: 'サンプル', variant: 'outlined' as const, position: 'left' as const, onClick: () => setDialog('paymentComplete') },
        { key: 'sample2', labelKey: 'サンプル', variant: 'outlined' as const, position: 'left' as const, onClick: () => setDialog('installment') },
        { key: 'finish', labelKey: '終了', variant: 'contained' as const, position: 'right' as const, onClick: () => setMode('register-blank') },
      ]
    }
    if (mode === 'register-blank') {
      return [
        { key: 'cancel', labelKey: '作業を中止', variant: 'outlined' as const, position: 'left' as const, onClick: () => setMode('payment') },
        { key: 'copy', labelKey: '前日までの釣銭準備金設定反映', variant: 'outlined' as const, position: 'left' as const, disabled: true, onClick: () => undefined },
        { key: 'run', labelKey: '実行', variant: 'contained' as const, position: 'right' as const, disabled: true, onClick: () => undefined },
      ]
    }
    return [
      { key: 'cancel', labelKey: '作業を中止', variant: 'outlined' as const, position: 'left' as const, onClick: () => setMode('payment') },
      { key: 'copy', labelKey: mode === 'register-confirmed' ? '前日閉店データ解除' : '前日閉店データ反映', variant: 'outlined' as const, position: 'left' as const, onClick: () => setMode(mode === 'register-confirmed' ? 'register-count' : 'register-confirmed') },
      { key: 'run', labelKey: '実行', variant: 'contained' as const, position: 'right' as const, onClick: () => setShowReceipt(true) },
    ]
  }, [mode])

  useLayoutConfig({ title, showBackButton: mode !== 'idle', hideSecondaryNav: true, actions, onBack: () => setMode(mode === 'payment' ? 'sale-cart' : 'idle') })

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', gap: 1 }}>
      {mode === 'idle' && <BlankStage onStart={() => setMode('sale-empty')} />}
      {mode === 'sale-empty' && <SaleWorkspace empty onAdd={() => setMode('sale-cart')} selectedCoupon={selectedCoupon} setSelectedCoupon={setSelectedCoupon} />}
      {mode === 'sale-cart' && <SaleWorkspace onAdd={() => setMode('payment')} selectedCoupon={selectedCoupon} setSelectedCoupon={setSelectedCoupon} />}
      {mode === 'payment' && <PaymentWorkspace onOpenDialog={setDialog} />}
      {mode === 'register-blank' && <RegisterBlank onStart={() => setMode('register-count')} />}
      {(mode === 'register-count' || mode === 'register-confirmed') && <RegisterCount confirmed={mode === 'register-confirmed'} />}

      <PaymentDialogs dialog={dialog} onClose={() => setDialog(null)} onDialog={setDialog} />
      <ReceiptOverlay open={showReceipt} onClose={() => { setShowReceipt(false); setMode('register-blank') }} />
    </Box>
  )
}

function BlankStage({ onStart }: { onStart: () => void }) {
  return (
    <Paper onClick={onStart} variant="outlined" sx={{ flex: 1, minHeight: 0, cursor: 'pointer', bgcolor: 'white' }} />
  )
}

function Toolbar({ onAdd }: { onAdd: () => void }) {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
      <OutlinedInput size="small" placeholder="検索" startAdornment={<InputAdornment position="start"><SearchIcon fontSize="small" /></InputAdornment>} endAdornment={<InputAdornment position="end"><TuneIcon fontSize="small" /></InputAdornment>} sx={{ width: 330, height: 34, bgcolor: 'white' }} />
      <Button onClick={onAdd} variant="contained" size="small" sx={{ minWidth: 70 }}>案件作成</Button>
      {['サンプル', 'サンプル', 'サンプル'].map((c, i) => <Chip key={i} label={c} variant="outlined" size="small" />)}
      <Box sx={{ flex: 1 }} />
      <Radio size="small" /> <Typography variant="caption">販売</Typography>
      <Radio size="small" /> <Typography variant="caption">新しい順</Typography>
    </Box>
  )
}

function SaleWorkspace({ empty = false, onAdd, selectedCoupon, setSelectedCoupon }: { empty?: boolean; onAdd: () => void; selectedCoupon: string; setSelectedCoupon: (v: string) => void }) {
  return (
    <Box sx={{ flex: 1, minHeight: 0, display: 'flex', gap: 1.25 }}>
      <Box sx={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 1 }}>
        <Toolbar onAdd={onAdd} />
        <Paper variant="outlined" sx={{ flex: 1, minHeight: 0, overflow: 'hidden', bgcolor: 'white' }}>
          {empty ? <EmptySaleCanvas /> : <SaleTable />}
        </Paper>
      </Box>
      {empty ? <EmptyDetail /> : <SaleDetail selectedCoupon={selectedCoupon} setSelectedCoupon={setSelectedCoupon} />}
    </Box>
  )
}

function EmptySaleCanvas() {
  return (
    <Box sx={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, color: 'text.secondary' }}>
      {[{ icon: <SearchIcon />, title: '検索', text: '依頼バーで検索' }, { icon: <QrCodeScannerIcon />, title: 'スキャン', text: '伝票、商品バーコード' }, { icon: <ListAltIcon />, title: 'リスト呼出', text: 'サンプルテンプレ' }].map((item) => (
        <Box key={item.title} sx={{ textAlign: 'center' }}>
          <Box sx={{ '& svg': { fontSize: 42, color: '#9aa8b7' } }}>{item.icon}</Box>
          <Typography sx={{ fontWeight: 700 }}>{item.title}</Typography>
          <Typography variant="caption">{item.text}</Typography>
        </Box>
      ))}
    </Box>
  )
}

function SaleTable() {
  return (
    <Table size="small" stickyHeader sx={{ '& th': { bgcolor: '#f1f4f7', fontWeight: 700, fontSize: 12 }, '& td': { fontSize: 12, whiteSpace: 'pre-line', py: 0.6 } }}>
      <TableHead><TableRow>{['取引', 'コード', '品名', '分類', '数量', '単価', '金額', '備考'].map(h => <TableCell key={h}>{h}</TableCell>)}</TableRow></TableHead>
      <TableBody>{saleRows.map((r, i) => (
        <TableRow key={i} sx={{ borderTop: r.divider ? `2px dashed ${BLUE}` : undefined }}>
          <TableCell>{r.deal}</TableCell><TableCell>{r.code}</TableCell><TableCell sx={{ fontWeight: 700 }}>{r.name}</TableCell><TableCell>{r.attr}</TableCell><TableCell align="right">{r.qty}</TableCell><TableCell align="right">{r.unit}</TableCell><TableCell align="right" sx={{ color: r.red ? 'error.main' : r.blue ? BLUE : 'text.primary', fontWeight: 700 }}>{r.amount}<Typography variant="caption" display="block" color="primary">税込 +¥1,000</Typography></TableCell><TableCell>{r.tax}</TableCell>
        </TableRow>
      ))}</TableBody>
    </Table>
  )
}

function EmptyDetail() {
  return <SidePanel title="内訳詳細"><Box sx={{ flex: 1 }} /><SummaryLine label="点数" value="0点" /><SummaryLine label="小計" value="¥0" /><SummaryLine label="税" value="¥0" /></SidePanel>
}

function SaleDetail({ selectedCoupon, setSelectedCoupon }: { selectedCoupon: string; setSelectedCoupon: (v: string) => void }) {
  return (
    <SidePanel title={<Box>内訳詳細 <Chip label="商品入" color="primary" size="small" /></Box>}>
      <Typography variant="caption" sx={{ fontWeight: 700 }}>クーポン情報</Typography>
      {['クーポンA', 'クーポンB', 'クーポンC', 'クーポンD'].map(c => <Box key={c} onClick={() => setSelectedCoupon(c)} sx={{ mt: 0.75, p: 1, border: '1px solid', borderColor: selectedCoupon === c ? BLUE : BORDER, bgcolor: selectedCoupon === c ? '#f0f7ff' : 'white', cursor: 'pointer', display: 'flex', alignItems: 'center' }}><Radio checked={selectedCoupon === c} size="small" /> <Typography variant="caption">{c}</Typography></Box>)}
      <Box sx={{ flex: 1 }} />
      <SummaryLine label="点数" value="1点" />
      <SummaryLine label="小計" value="¥10,000" />
      <SummaryLine label="税" value="¥1,000" />
      <SummaryLine label="値引額合計" value="-¥1,000" danger />
      <SummaryLine label="クーポン値引" value="-¥1,000" danger />
      <Divider sx={{ my: 1 }} />
      <SummaryLine label="合計金額" value="¥8,800" blue large />
    </SidePanel>
  )
}

function SidePanel({ title, children }: { title: ReactNode; children: ReactNode }) {
  return <Paper variant="outlined" sx={{ width: 300, flexShrink: 0, p: 1.5, display: 'flex', flexDirection: 'column', bgcolor: 'white' }}><Typography sx={{ fontWeight: 700, mb: 1 }}>{title}</Typography><Divider sx={{ mb: 1 }} />{children}</Paper>
}

function SummaryLine({ label, value, blue, danger, large }: { label: string; value: string; blue?: boolean; danger?: boolean; large?: boolean }) {
  return <Box sx={{ display: 'flex', justifyContent: 'space-between', py: 0.5 }}><Typography variant="caption" sx={{ fontWeight: large ? 700 : 500 }}>{label}</Typography><Typography variant={large ? 'h6' : 'caption'} sx={{ color: blue ? BLUE : danger ? 'error.main' : 'text.primary', fontWeight: 800 }}>{value}</Typography></Box>
}

function PaymentWorkspace({ onOpenDialog }: { onOpenDialog: (d: DialogMode) => void }) {
  return (
    <Box sx={{ flex: 1, minHeight: 0, display: 'grid', gridTemplateColumns: '1fr 300px', gap: 1.25 }}>
      <Box sx={{ display: 'grid', gridTemplateRows: '1fr 190px', gap: 1.25, minHeight: 0 }}>
        <Paper variant="outlined" sx={{ overflow: 'hidden' }}>
          <Table size="small"><TableHead><TableRow><TableCell>入金区分</TableCell><TableCell align="right">合計金額</TableCell></TableRow></TableHead><TableBody>{[1, 2, 3].map(i => <TableRow key={i}><TableCell>サンプルテキストサンプルテキストサンプルテキスト</TableCell><TableCell align="right">¥00,000,000</TableCell></TableRow>)}</TableBody></Table>
        </Paper>
        <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1.25 }}><BillPanel /><PaymentBreakdown /></Box>
      </Box>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.25 }}>
        <PayCard title="クレジット決済"><PayButton icon={<CreditCardIcon />} label="クレジット" onClick={() => onOpenDialog('cardSelect')} /></PayCard>
        <PayCard title="キャッシュレス・その他決済"><Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1 }}><PayButton icon={<QrCode2Icon />} label="バーコード決済" onClick={() => onOpenDialog('barcodeAmount')} /><PayButton icon={<ContactlessIcon />} label="電子マネー" onClick={() => onOpenDialog('paymentComplete')} /></Box><Button sx={{ mt: 1 }} variant="contained" fullWidth>その他決済</Button></PayCard>
        <PayCard title="現金決済"><TextField size="small" placeholder="金額を入力" fullWidth /><SummaryLine label="おつり" value="¥0" blue /></PayCard>
      </Box>
    </Box>
  )
}

function PayCard({ title, children }: { title: string; children: ReactNode }) { return <Paper variant="outlined" sx={{ p: 1.25, bgcolor: 'white' }}><Typography sx={{ fontWeight: 700, mb: 1 }}>{title}</Typography>{children}</Paper> }
function PayButton({ icon, label, onClick }: { icon: ReactNode; label: string; onClick: () => void }) { return <Button onClick={onClick} variant="contained" sx={{ minHeight: 82, flexDirection: 'column', gap: 0.5 }}>{icon}{label}</Button> }

function BillPanel() { return <Paper variant="outlined" sx={{ p: 1.5 }}><Typography sx={{ fontWeight: 700 }}>請求情報</Typography><SummaryLine label="点数" value="0点" /><SummaryLine label="値引額" value="-¥0" danger /><SummaryLine label="小計" value="¥0" /><SummaryLine label="税" value="¥0" /><Divider sx={{ my: 1 }} /><SummaryLine label="合計金額" value="¥0" blue /></Paper> }
function PaymentBreakdown() { return <Paper variant="outlined" sx={{ p: 1.5 }}><Typography sx={{ fontWeight: 700 }}>支払内訳</Typography>{['現金', 'クレジット', '○○Pay'].map(x => <SummaryLine key={x} label={x} value="¥0" />)}<Divider sx={{ my: 1 }} /><SummaryLine label="残額" value="¥0" danger /></Paper> }

function PaymentDialogs({ dialog, onClose, onDialog }: { dialog: DialogMode; onClose: () => void; onDialog: (d: DialogMode) => void }) {
  if (dialog === 'cardSelect') return <CommonDialog title="クレジットカード支払い" onClose={onClose} onConfirm={() => onDialog('cardAmount')} confirm="完了"><Typography variant="body2">クレジットカード会社を選択してください</Typography><Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 1, mt: 2 }}>{Array.from({ length: 12 }, (_, i) => <Button key={i} variant={i === 0 ? 'contained' : 'outlined'}>サンプル</Button>)}</Box></CommonDialog>
  if (dialog === 'cardAmount') return <CommonDialog title="クレジットカード支払い" onClose={onClose} onConfirm={() => onDialog('paymentComplete')} confirm="確定"><SummaryLine label="合計金額" value="¥10,000" blue large /><TextField sx={{ mt: 2 }} size="small" fullWidth label="クレジットカードでのお支払い金額" value="¥10,000" /></CommonDialog>
  if (dialog === 'paymentComplete') return <CommonDialog icon={<CheckIcon sx={{ fontSize: 56 }} />} title="決済端末処理完了" onClose={onClose} onConfirm={onClose} confirm="再試行"><Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1 }}>{['ICチップあり', 'ICチップなし', '認証カード', '取引の中止'].map(t => <Card key={t} variant="outlined" sx={{ p: 2, bgcolor: SOFT }}><Typography sx={{ fontWeight: 700 }}>{t}</Typography><Typography variant="caption">端末の案内に従って処理してください</Typography></Card>)}</Box></CommonDialog>
  if (dialog === 'installment') return <CommonDialog title="支払い回数" onClose={onClose} onConfirm={() => onDialog('cardProcessing')} confirm="完了"><Typography variant="body2">お支払い回数を選択してください</Typography><Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 1, mt: 2 }}>{['1回', '3回', '5回', '12回', 'リボ払い', 'サンプル', 'サンプル', 'サンプル', 'サンプル', 'サンプル'].map((t, i) => <Button key={`${t}${i}`} variant={i === 0 ? 'contained' : 'outlined'}>{t}</Button>)}</Box></CommonDialog>
  if (dialog === 'cardProcessing') return <CommonDialog icon={<InfoOutlinedIcon sx={{ fontSize: 56 }} />} title="クレジットカード支払い処理中" onClose={onClose} onConfirm={onClose} confirm="再試行"><Typography align="center" sx={{ fontWeight: 700 }}>決済端末入力をお願いします。</Typography><LinearProgress sx={{ my: 2 }} /><Typography variant="caption" display="block" align="center">端末の案内に従ってカードを挿入、タッチ、またはスワイプしてください。</Typography></CommonDialog>
  if (dialog === 'barcodeAmount') return <CommonDialog title="スマホコード決済" onClose={onClose} onConfirm={() => onDialog('barcodeScan')} confirm="確定"><SummaryLine label="合計金額" value="¥10,000" blue large /><TextField sx={{ mt: 2 }} size="small" fullWidth label="スマホコード決済でのお支払い金額" value="¥10,000" /></CommonDialog>
  if (dialog === 'barcodeScan') return <CommonDialog icon={<InfoOutlinedIcon sx={{ fontSize: 56 }} />} title="お客様のスマホのバーコードをスキャンしてください" onClose={onClose} onConfirm={onClose} confirm="再試行" />
  return null
}

function CommonDialog({ title, icon, children, onClose, onConfirm, confirm }: { title: string; icon?: ReactNode; children?: ReactNode; onClose: () => void; onConfirm: () => void; confirm: string }) {
  return <Dialog open maxWidth="sm" fullWidth><DialogTitle sx={{ textAlign: icon ? 'center' : 'left', fontWeight: 800 }}>{icon}{title}</DialogTitle><DialogContent dividers>{children}</DialogContent><DialogActions><Button variant="outlined" onClick={onClose}>キャンセル</Button><Button variant="contained" onClick={onConfirm}>{confirm}</Button></DialogActions></Dialog>
}

function RegisterBlank({ onStart }: { onStart: () => void }) { return <Paper onClick={onStart} variant="outlined" sx={{ flex: 1, cursor: 'pointer', bgcolor: 'white' }} /> }

function RegisterCount({ confirmed }: { confirmed: boolean }) {
  return (
    <Box sx={{ flex: 1, display: 'grid', gridTemplateColumns: '1fr 300px', gap: 1.25, minHeight: 0 }}>
      <Paper variant="outlined" sx={{ p: 1, bgcolor: confirmed ? '#fff1f1' : 'white', overflow: 'auto' }}>
        <Table size="small"><TableHead><TableRow><TableCell>金種</TableCell><TableCell>枚数</TableCell><TableCell align="right">金額</TableCell></TableRow></TableHead><TableBody>{denominations.map((denomination, i) => <TableRow key={denomination}><TableCell>{denomination}</TableCell><TableCell><Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}><IconButton size="small"><RemoveIcon fontSize="small" /></IconButton><TextField size="small" value={i === 0 ? '10' : ''} sx={{ width: 48, '& input': { textAlign: 'center', p: 0.5 } }} /><IconButton size="small"><AddIcon fontSize="small" /></IconButton><Typography variant="caption" color="text.disabled">{'›'.repeat(46)}</Typography></Box></TableCell><TableCell align="right" sx={{ color: i === 0 ? BLUE : 'text.secondary', fontWeight: 700 }}>{i === 0 ? '¥100,000' : '¥0'}</TableCell></TableRow>)}</TableBody></Table>
        {confirmed && <Typography sx={{ position: 'absolute', left: 190, top: 260, color: 'error.main', fontSize: 32, fontWeight: 900, lineHeight: 1.45 }}>全体レジ閉設02<br />レジ閉設画面で確定した<br />パターンに<br />数字が反映されたもの</Typography>}
        <TextField size="small" placeholder="調整などは金額を直接入力してください" fullWidth sx={{ mt: 1 }} />
      </Paper>
      {confirmed ? <RegisterConfirmedSide /> : <SidePanel title="内訳詳細"><InfoBox icon={<InfoOutlinedIcon />} label="前日までの釣銭準備金設定反映" value="¥000,000,000" /><InfoBox icon={<AccountBalanceWalletIcon color="error" />} label="預かり詳細" value="-¥000,000,000" danger /><Box sx={{ flex: 1 }} /><SummaryLine label="合計金額" value="¥0" blue /></SidePanel>}
    </Box>
  )
}

function InfoBox({ icon, label, value, danger }: { icon: ReactNode; label: string; value: string; danger?: boolean }) { return <Box sx={{ border: '1px solid', borderColor: danger ? 'error.main' : BORDER, borderRadius: 1, p: 1, mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>{icon}<Box sx={{ flex: 1 }}><Typography variant="caption">{label}</Typography><Typography sx={{ fontWeight: 800, color: danger ? 'error.main' : 'text.primary' }}>{value}</Typography></Box></Box> }
function RegisterConfirmedSide() { return <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.25 }}><PayCard title="金庫金"><SummaryLine label="準備釣銭" value="¥000,000,000" /><SummaryLine label="現金過不足" value="¥000,000,000" blue /></PayCard><PayCard title="レジ金"><SummaryLine label="準備釣銭" value="¥000,000,000" /><SummaryLine label="現金過不足" value="¥000,000,000" danger /></PayCard><Box sx={{ flex: 1 }} /><PayCard title="合計金額"><SummaryLine label="" value="¥0" blue large /></PayCard></Box> }

function ReceiptOverlay({ open, onClose }: { open: boolean; onClose: () => void }) {
  if (!open) return null
  return <Box sx={{ position: 'fixed', inset: 0, bgcolor: 'rgba(0,0,0,0.55)', zIndex: 2000, display: 'flex', justifyContent: 'center', alignItems: 'center' }}><IconButton onClick={onClose} sx={{ position: 'absolute', top: 24, right: 24, color: 'white' }}><CloseIcon /></IconButton><Paper sx={{ width: 420, height: 620, p: 4, bgcolor: 'white' }}><Typography variant="caption">印刷パターン番号テスト　06月16日（火）</Typography><Divider sx={{ my: 2 }} /><Typography variant="body2" sx={{ whiteSpace: 'pre-line' }}>・棚卸の内容を出力します{`\n`}・商品分類別集計データを出力します{`\n`}・出力帳票を確認してください{`\n\n\n\n\n\n\n\n\n`}Printed with Front test receipt mock.</Typography></Paper><Button onClick={onClose} variant="contained" sx={{ position: 'absolute', right: 24, bottom: 24, borderRadius: '50%', minWidth: 56, height: 56 }}><LocalAtmIcon /></Button></Box>
}
