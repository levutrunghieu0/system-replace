import { createFileRoute } from '@tanstack/react-router'
import { useRef, useState } from 'react'
import Box from '@mui/material/Box'
import IconButton from '@mui/material/IconButton'
import InputBase from '@mui/material/InputBase'
import Snackbar from '@mui/material/Snackbar'
import Alert from '@mui/material/Alert'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import Typography from '@mui/material/Typography'
import CloseIcon from '@mui/icons-material/Close'
import PlayArrowIcon from '@mui/icons-material/PlayArrow'
import QrCodeScannerIcon from '@mui/icons-material/QrCodeScanner'
import UndoIcon from '@mui/icons-material/Undo'
import { useTranslation } from 'react-i18next'
import { useLayoutConfig } from '../hooks/useLayoutConfig'
import { AppTableContainer } from '../components/table'
import AppModal from '../components/AppModal'

export const Route = createFileRoute('/inventory/gross-delete')({
  component: GrossDeletePage,
})

// ─── Types & random data generators ──────────────────────────────────────────

interface ScanItem {
  id: string
  janCode: string
  salesFloor: string
  salesSubCategory: string
  sellingPrice: number
  productMigration: number
}

const RAND_FLOORS = ['01 衣料', '02 服飾', '03 キッズ', '04 生活用品', '05 家電']
const RAND_SUBS = [
  '01101 レ_カットソー_長袖',
  '01102 レ_カットソー_半袖',
  '01103 レ_シャツ・ブラウス_長袖',
  '01104 レ_シャツ・ブラウス_半袖',
  '01105 レ_スウェット',
  '01106 レ_パーカー',
  '01107 レ_ニット',
  '01108 レ_カーディガン',
]
const RAND_PRICES = [500, 700, 900, 1300, 1600, 1900, 2300]

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

function randInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

function generateRandomItem(janCode: string): ScanItem {
  return {
    id: `${janCode}-${Date.now()}`,
    janCode,
    salesFloor: pick(RAND_FLOORS),
    salesSubCategory: pick(RAND_SUBS),
    sellingPrice: pick(RAND_PRICES),
    productMigration: randInt(1, 999),
  }
}

// ─── Page ────────────────────────────────────────────────────────────────────

function GrossDeletePage() {
  const { t } = useTranslation()
  const [items, setItems] = useState<ScanItem[]>([])
  const [janInput, setJanInput] = useState('')
  const [confirmId, setConfirmId] = useState<string | null>(null)
  const [toast, setToast] = useState<{ open: boolean; severity: 'info' | 'error'; message: string }>({
    open: false, severity: 'info', message: '',
  })
  const inputRef = useRef<HTMLInputElement>(null)

  const hasItems = items.length > 0

  const handleScan = () => {
    const jan = janInput.trim()
    if (!jan) return
    setItems(prev => [...prev, generateRandomItem(jan)])
    setJanInput('')
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

  const handleCancel = () => {
    setItems(prev => prev.slice(0, -1))
  }

  const handleRun = () => {
    setToast({ open: true, severity: 'info', message: t('page.grossDelete.toast.deleted') })
    setItems([])
  }

  useLayoutConfig({
    title: t('page.grossDelete.title'),
    hideSecondaryNav: true,
    actions: [
      {
        key: 'cancel',
        labelKey: 'page.grossDelete.action.cancel',
        position: 'left',
        variant: 'outlined',
        color: 'inherit',
        startIcon: <UndoIcon fontSize="small" />,
        disabled: !hasItems,
        onClick: handleCancel,
      },
      {
        key: 'run',
        labelKey: 'page.grossDelete.action.run',
        position: 'left',
        variant: 'contained',
        color: 'error',
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
              <TableCell sx={{ ...hSx, width: 52, textAlign: 'center' }}>
                {t('page.grossDelete.col.no')}
              </TableCell>
              <TableCell sx={{ ...hSx, width: 164 }}>
                {t('page.grossDelete.col.jan')}
              </TableCell>
              <TableCell sx={{ ...hSx, width: 110 }}>
                {t('page.grossDelete.col.salesFloor')}
              </TableCell>
              <TableCell sx={hSx}>
                {t('page.grossDelete.col.salesSubCategory')}
              </TableCell>
              <TableCell sx={{ ...hSx, width: 90, textAlign: 'right' }}>
                {t('page.grossDelete.col.sellingPrice')}
              </TableCell>
              <TableCell sx={{ ...hSx, width: 90, textAlign: 'center' }}>
                {t('page.grossDelete.col.productMigration')}
              </TableCell>
              <TableCell sx={{ ...hSx, width: 72, textAlign: 'center' }}>
                {t('page.grossDelete.col.cancel')}
              </TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {/* Input row */}
            <TableRow>
              <TableCell sx={{ py: 0.75 }} colSpan={7}>
                <InputBase
                  inputRef={inputRef}
                  autoFocus
                  value={janInput}
                  onChange={e => setJanInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={t('page.grossDelete.placeholder')}
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
            {items.map((item, index) => (
              <TableRow key={item.id} hover>
                <TableCell sx={{ textAlign: 'center', fontSize: '0.82rem' }}>
                  {index + 1}
                </TableCell>
                <TableCell sx={{ fontSize: '0.82rem', fontFamily: 'monospace', whiteSpace: 'nowrap' }}>
                  {item.janCode}
                </TableCell>
                <TableCell sx={{ fontSize: '0.82rem', whiteSpace: 'nowrap' }}>
                  {item.salesFloor}
                </TableCell>
                <TableCell sx={{ fontSize: '0.82rem' }}>
                  {item.salesSubCategory}
                </TableCell>
                <TableCell sx={{ fontSize: '0.82rem', textAlign: 'right', whiteSpace: 'nowrap' }}>
                  {item.sellingPrice.toLocaleString()}
                </TableCell>
                <TableCell sx={{ fontSize: '0.82rem', textAlign: 'center' }}>
                  {item.productMigration}
                </TableCell>
                <TableCell sx={{ textAlign: 'center', py: 0.25 }}>
                  <IconButton
                    size="small"
                    onClick={() => setConfirmId(item.id)}
                    sx={{ color: 'error.main', '&:hover': { bgcolor: 'error.50' } }}
                  >
                    <CloseIcon sx={{ fontSize: '1rem' }} />
                  </IconButton>
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

      <AppModal
        open={confirmId !== null}
        title="確認"
        onCancel={() => setConfirmId(null)}
        onConfirm={handleConfirmDelete}
        confirmAutoFocus
      >
        <Typography sx={{ fontSize: '0.875rem', color: 'text.secondary', whiteSpace: 'pre-line' }}>
          {'在庫データから削除されます。\n処理を実行してよいですか？'}
        </Typography>
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
