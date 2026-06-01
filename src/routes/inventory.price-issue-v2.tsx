import { createFileRoute, useRouter } from '@tanstack/react-router'
import { useRef, useState } from 'react'
import Box from '@mui/material/Box'
import FormControl from '@mui/material/FormControl'
import FormControlLabel from '@mui/material/FormControlLabel'
import FormLabel from '@mui/material/FormLabel'
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
import Typography from '@mui/material/Typography'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import PlayArrowIcon from '@mui/icons-material/PlayArrow'
import QrCodeScannerIcon from '@mui/icons-material/QrCodeScanner'
import RestartAltIcon from '@mui/icons-material/RestartAlt'
import { useTranslation } from 'react-i18next'
import { useLayoutConfig } from '../hooks/useLayoutConfig'
import { AppTableContainer } from '../components/table'
import { QuantityStepper } from '../components/QuantityStepper'
import AppModal from '../components/AppModal'

export const Route = createFileRoute('/inventory/price-issue-v2')({
  component: PriceIssueV2Page,
})

// ─── Types & random data generators ──────────────────────────────────────────

interface PriceItem {
  id: string
  code: string
  maker: string
  productName: string
  unitPrice: number
  count: number
  /** Immutable: the count value assigned when the item was first scanned */
  originalCount: number
  set: string
}

const PRICE_TYPES = [
  '縦長タグ', '横長タグ', '縦長シール', '横長シール',
  '縦長ショーケースタグ', '横長ショーケースタグ', '縦長ショーケースシール',
  '横短シール', 'プライスカード大', 'プライスカード大(上張り用)',
]

const RAND_MAKERS = ['RED WING', 'NIKE', 'ADIDAS', 'NEW BALANCE', 'CONVERSE', 'VANS', 'PUMA', 'REEBOK', 'TIMBERLAND']
const RAND_PRODUCTS = [
  'PLAIN TOE/プレーントウ/US9.5/BRD/レザー/',
  'AIR MAX/エアマックス/26.0/BLK/メッシュ/',
  'STAN SMITH/スタンスミス/25.5/WHT/レザー/',
  'AIR FORCE 1/エアフォース/27.0/WHT/レザー/',
  'OLD SKOOL/オールドスクール/26.5/BLK/スエード/',
  'CLASSIC LEATHER/クラシックレザー/25.0/NVY/レザー/',
  'CHUCK TAYLOR/チャックテイラー/24.5/RED/キャンバス/',
  'ULTRA BOOST/ウルトラブースト/27.5/GRY/メッシュ/',
]
const RAND_PRICES = [4900, 7900, 9900, 12900, 14900, 19900, 24900, 32900]
const RAND_SETS = ['', '', '', 'A', 'B', 'C']

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

function randInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

function generateRandomItem(code: string): PriceItem {
  const count = randInt(1, 5)
  return {
    id: `${code}-${Date.now()}`,
    code,
    maker: pick(RAND_MAKERS),
    productName: pick(RAND_PRODUCTS),
    unitPrice: pick(RAND_PRICES),
    count,
    originalCount: count,
    set: pick(RAND_SETS),
  }
}

// ─── Page ────────────────────────────────────────────────────────────────────

function PriceIssueV2Page() {
  const router = useRouter()
  const { t } = useTranslation()
  const [items, setItems] = useState<PriceItem[]>([])
  const [codeInput, setCodeInput] = useState('')
  const [confirmId, setConfirmId] = useState<string | null>(null)
  const [issueModalOpen, setIssueModalOpen] = useState(false)
  const [issueMethod, setIssueMethod] = useState<'auto' | 'manual'>('auto')
  const [priceType, setPriceType] = useState(PRICE_TYPES[0])
  const [toast, setToast] = useState<{ open: boolean; severity: 'info' | 'error'; message: string }>({
    open: false, severity: 'info', message: '',
  })
  const inputRef = useRef<HTMLInputElement>(null)

  const hasItems = items.length > 0

  const handleScan = () => {
    const code = codeInput.trim()
    if (!code) return
    setItems(prev => [...prev, generateRandomItem(code)])
    setCodeInput('')
    setTimeout(() => inputRef.current?.focus(), 0)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') handleScan()
  }

  const handleConfirmDelete = () => {
    if (!confirmId) return
    setItems(prev => prev.filter(i => i.id !== confirmId))
    setConfirmId(null)
    setTimeout(() => inputRef.current?.focus(), 0)
  }

  const handleReset = () => setItems([])

  const updateCount = (id: string, v: number) => {
    setItems(prev => prev.map(i => i.id === id ? { ...i, count: v } : i))
  }

  const handleRun = () => {
    setIssueMethod('auto')
    setPriceType(PRICE_TYPES[0])
    setIssueModalOpen(true)
  }

  const handleIssueConfirm = () => {
    setIssueModalOpen(false)
    setToast({ open: true, severity: 'info', message: t('page.priceIssue.toast.issued') })
    setItems([])
    setTimeout(() => inputRef.current?.focus(), 0)
  }

  useLayoutConfig({
    title: t('page.priceIssueV2.title'),
    hideSecondaryNav: true,
    actions: [
      {
        key: 'back',
        labelKey: 'action.back',
        position: 'left',
        variant: 'outlined',
        color: 'inherit',
        startIcon: <ArrowBackIcon fontSize="small" />,
        onClick: () => router.history.back(),
      },
      {
        key: 'reset',
        labelKey: 'action.reset',
        position: 'left',
        variant: 'outlined',
        color: 'inherit',
        startIcon: <RestartAltIcon fontSize="small" />,
        disabled: !hasItems,
        onClick: handleReset,
      },
      {
        key: 'run',
        labelKey: 'page.priceIssue.action.run',
        position: 'left',
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
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, height: '100%' }}>
      <AppTableContainer stickyHeader maxHeight="calc(100vh - 140px)">
        <Table size="small" stickyHeader sx={{ tableLayout: 'fixed' }}>
          <TableHead>
            <TableRow>
              <TableCell sx={{ ...hSx, width: 148 }}>
                {t('page.priceIssue.col.code')}
              </TableCell>
              <TableCell sx={{ ...hSx, width: 130 }}>
                {t('page.priceIssue.col.maker')}
              </TableCell>
              <TableCell sx={hSx}>
                {t('page.priceIssue.col.productName')}
              </TableCell>
              <TableCell sx={{ ...hSx, width: 88, textAlign: 'right' }}>
                {t('page.priceIssue.col.unitPrice')}
              </TableCell>
              <TableCell sx={{ ...hSx, width: 64, textAlign: 'center' }}>
                {t('page.priceIssue.col.count')}
              </TableCell>
              <TableCell sx={{ ...hSx, width: 64, textAlign: 'center' }}>
                {t('page.priceIssue.col.set')}
              </TableCell>
              {/* Stepper column — no header */}
              <TableCell sx={{ ...hSx, width: 116, textAlign: 'center' }} />
            </TableRow>
          </TableHead>

          <TableBody>
            {/* Input row — always at top */}
            <TableRow>
              <TableCell sx={{ py: 0.75 }} colSpan={7}>
                <InputBase
                  inputRef={inputRef}
                  autoFocus
                  value={codeInput}
                  onChange={e => setCodeInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={t('page.priceIssue.placeholder')}
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

            {/* Scanned item rows */}
            {items.map((item) => (
              <TableRow key={item.id} hover>
                <TableCell sx={{ fontSize: '0.82rem', fontFamily: 'monospace', whiteSpace: 'nowrap' }}>
                  {item.code}
                </TableCell>
                <TableCell sx={{ fontSize: '0.82rem', whiteSpace: 'nowrap' }}>
                  {item.maker}
                </TableCell>
                <TableCell sx={{ fontSize: '0.82rem' }}>
                  {item.productName}
                </TableCell>
                <TableCell sx={{ fontSize: '0.82rem', textAlign: 'right', whiteSpace: 'nowrap' }}>
                  {item.unitPrice.toLocaleString()}
                </TableCell>

                {/* 枚数 — read-only display, updated by the stepper */}
                <TableCell sx={{ textAlign: 'center', whiteSpace: 'nowrap' }}>
                  {item.count !== item.originalCount ? (
                    <Box component="span" sx={{ display: 'inline-flex', alignItems: 'baseline', gap: 0.25 }}>
                      <Typography
                        component="span"
                        sx={{ fontSize: '0.82rem', fontWeight: 700, color: 'primary.main', lineHeight: 'inherit' }}
                      >
                        {item.count}
                      </Typography>
                      <Typography
                        component="span"
                        sx={{ fontSize: '0.72rem', color: 'text.disabled', lineHeight: 'inherit' }}
                      >
                        ({item.originalCount})
                      </Typography>
                    </Box>
                  ) : (
                    <Typography
                      component="span"
                      sx={{ fontSize: '0.82rem', color: 'text.secondary', lineHeight: 'inherit' }}
                    >
                      {item.count}
                    </Typography>
                  )}
                </TableCell>

                <TableCell sx={{ fontSize: '0.82rem', textAlign: 'center' }}>
                  {item.set}
                </TableCell>

                {/* QuantityStepper — interactive control at end of row */}
                <TableCell sx={{ textAlign: 'center', py: 0.5 }}>
                  <QuantityStepper
                    compact
                    value={item.count - item.originalCount}
                    onChange={(v) => updateCount(item.id, item.originalCount + v)}
                    onDeleteRequest={() => setConfirmId(item.id)}
                    deleteTooltip={t('page.priceIssueV2.stepper.deleteTooltip')}
                  />
                </TableCell>
              </TableRow>
            ))}

            {/* Empty state hint */}
            {!hasItems && (
              <TableRow>
                <TableCell colSpan={7} sx={{ py: 5, textAlign: 'center', border: 'none' }}>
                  <Box sx={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
                    <QrCodeScannerIcon sx={{ fontSize: '2.5rem', color: 'text.disabled' }} />
                    <Box sx={{ textAlign: 'center' }}>
                      <Typography sx={{ fontSize: '0.82rem', color: 'text.disabled' }}>
                        タグのバーコードをスキャン
                      </Typography>
                      <Typography sx={{ fontSize: '0.82rem', color: 'text.disabled' }}>
                        または商品コードを直接入力してください
                      </Typography>
                    </Box>
                  </Box>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </AppTableContainer>

      {/* Delete confirm dialog */}
      {/* Delete confirm dialog */}
      <AppModal
        open={confirmId !== null}
        title={t('page.priceIssue.confirm.title')}
        onCancel={() => setConfirmId(null)}
        onConfirm={handleConfirmDelete}
        confirmAutoFocus
      >
        <Typography sx={{ fontSize: '0.875rem', color: 'text.secondary', whiteSpace: 'pre-line' }}>
          {t('page.priceIssue.confirm.message')}
        </Typography>
      </AppModal>

      {/* Issue method modal */}
      <AppModal
        open={issueModalOpen}
        title={t('page.priceIssue.issueModal.title')}
        onCancel={() => setIssueModalOpen(false)}
        onConfirm={handleIssueConfirm}
        confirmAutoFocus
      >
        <FormControl>
          <FormLabel sx={{ fontSize: '0.8rem', mb: 0.5 }}>
            {t('page.priceIssue.issueModal.methodLabel')}
          </FormLabel>
          <RadioGroup
            row
            value={issueMethod}
            onChange={e => setIssueMethod(e.target.value as 'auto' | 'manual')}
          >
            <FormControlLabel
              value="auto"
              control={<Radio size="small" />}
              label={<Typography sx={{ fontSize: '0.875rem' }}>{t('page.priceIssue.issueModal.auto')}</Typography>}
            />
            <FormControlLabel
              value="manual"
              control={<Radio size="small" />}
              label={<Typography sx={{ fontSize: '0.875rem' }}>{t('page.priceIssue.issueModal.manual')}</Typography>}
            />
          </RadioGroup>
        </FormControl>
        <Select
          size="small"
          fullWidth
          value={priceType}
          onChange={e => setPriceType(e.target.value)}
          disabled={issueMethod === 'auto'}
          sx={{ mt: 1.5, fontSize: '0.875rem' }}
        >
          {PRICE_TYPES.map(pt => (
            <MenuItem key={pt} value={pt} sx={{ fontSize: '0.875rem' }}>{pt}</MenuItem>
          ))}
        </Select>
      </AppModal>

      <Snackbar
        open={toast.open}
        autoHideDuration={4000}
        onClose={() => setToast(p => ({ ...p, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
      >
        <Alert
          severity={toast.severity}
          onClose={() => setToast(p => ({ ...p, open: false }))}
          sx={{ width: '100%' }}
        >
          {toast.message}
        </Alert>
      </Snackbar>
    </Box>
  )
}
