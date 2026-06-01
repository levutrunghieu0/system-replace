import { createFileRoute, useRouter } from '@tanstack/react-router'
import { useState } from 'react'
import Box from '@mui/material/Box'
import Chip from '@mui/material/Chip'
import Snackbar from '@mui/material/Snackbar'
import Alert from '@mui/material/Alert'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import Typography from '@mui/material/Typography'
import NavigateBeforeIcon from '@mui/icons-material/NavigateBefore'
import NavigateNextIcon from '@mui/icons-material/NavigateNext'
import BlockIcon from '@mui/icons-material/Block'
import FileDownloadIcon from '@mui/icons-material/FileDownload'
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutlined'
import { useTranslation } from 'react-i18next'
import { useLayoutConfig } from '../hooks/useLayoutConfig'
import { AppTableContainer } from '../components/table'

export const Route = createFileRoute('/warehouse/consignment')({
  component: ConsignmentImportPage,
})

// ─── Types ────────────────────────────────────────────────────────────────────

interface DiffItem {
  id: string
  no: number
  code: string
  productName: string
  condition: string
  subCategory: string
  shippedQty: number
  receivedQty: number
  diffQty: number
  imported: boolean
}

interface Slip {
  supplier: string
  storeCode: string
  slipNumber: string
  totalQuantity: number
  totalAmount: number
  items: DiffItem[]
}

// ─── Mock data ────────────────────────────────────────────────────────────────

const MOCK_SLIPS: Slip[] = [
  {
    supplier: 'サンプルテキスト店',
    storeCode: '12345',
    slipNumber: '123456',
    totalQuantity: 3,
    totalAmount: 13500,
    items: [
      { id: '1-1', no: 1, code: '1717171', productName: '千と千尋の神隠し', condition: 'S', subCategory: '映像・DVDアニメ', shippedQty: 10, receivedQty: 1, diffQty: -9, imported: false },
      { id: '1-2', no: 2, code: '1717172', productName: 'ハウルの動く城', condition: 'A', subCategory: '映像・DVDアニメ', shippedQty: 5, receivedQty: 3, diffQty: -2, imported: false },
      { id: '1-3', no: 3, code: '1717173', productName: '魔女の宅急便', condition: 'S', subCategory: '映像・DVDアニメ', shippedQty: 8, receivedQty: 8, diffQty: 0, imported: false },
    ],
  },
  {
    supplier: 'サンプルテキスト店',
    storeCode: '12345',
    slipNumber: '123457',
    totalQuantity: 2,
    totalAmount: 7200,
    items: [
      { id: '2-1', no: 1, code: '1818181', productName: 'もののけ姫', condition: 'B', subCategory: '映像・DVDアニメ', shippedQty: 4, receivedQty: 4, diffQty: 0, imported: false },
      { id: '2-2', no: 2, code: '1818182', productName: 'となりのトトロ', condition: 'A', subCategory: '映像・DVDアニメ', shippedQty: 6, receivedQty: 5, diffQty: -1, imported: false },
    ],
  },
  {
    supplier: 'メディア銀座店',
    storeCode: '23456',
    slipNumber: '234567',
    totalQuantity: 1,
    totalAmount: 3200,
    items: [
      { id: '3-1', no: 1, code: '1919191', productName: '崖の上のポニョ', condition: 'S', subCategory: '映像・DVDアニメ', shippedQty: 3, receivedQty: 1, diffQty: -2, imported: false },
      { id: '3-2', no: 2, code: '1919192', productName: '風の谷のナウシカ', condition: 'A', subCategory: '映像・DVDアニメ', shippedQty: 2, receivedQty: 2, diffQty: 0, imported: false },
    ],
  },
]

// ─── Slip info bar ────────────────────────────────────────────────────────────

function SlipInfoBar({
  slip,
  importedCount,
  totalDiff,
  slipIndex,
  totalSlips,
}: {
  slip: Slip
  importedCount: number
  totalDiff: number
  slipIndex: number
  totalSlips: number
}) {
  const { t } = useTranslation()
  const allDone = totalDiff > 0 && importedCount === totalDiff

  const infoItems = [
    { key: 'supplier', value: slip.supplier },
    { key: 'storeCode', value: slip.storeCode },
    { key: 'slipNumber', value: slip.slipNumber },
    { key: 'totalQuantity', value: `${slip.totalQuantity}` },
    { key: 'totalAmount', value: slip.totalAmount.toLocaleString() },
  ] as const

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        px: 2,
        py: 0.75,
        borderBottom: '1px solid',
        borderColor: 'divider',
        bgcolor: 'grey.50',
        flexWrap: 'wrap',
        gap: 2,
        flexShrink: 0,
      }}
    >
      {infoItems.map(({ key, value }) => (
        <Typography key={key} sx={{ fontSize: '0.78rem', whiteSpace: 'nowrap' }}>
          <Box component="span" sx={{ color: 'text.secondary', mr: 0.5 }}>
            {t(`page.consignmentImport.info.${key}` as Parameters<typeof t>[0])}：
          </Box>
          <Box component="span" sx={{ fontWeight: 600, color: 'text.primary' }}>{value}</Box>
        </Typography>
      ))}

      <Typography sx={{ fontSize: '0.75rem', color: 'text.disabled', whiteSpace: 'nowrap' }}>
        ({slipIndex + 1} / {totalSlips})
      </Typography>

      <Box sx={{ flex: 1 }} />

      {/* 未取込差異件数 — dashed box matching wireframe */}
      <Box
        sx={{
          borderRadius: 1,
          px: 1.5,
          py: 0.4,
          display: 'flex',
          alignItems: 'center',
          gap: 0.75,
          bgcolor: allDone ? '#f0fdf4' : '#fff5f5',
        }}
      >
        <Typography
          sx={{ fontSize: '0.75rem', color: allDone ? 'success.dark' : 'error.dark', fontWeight: 600, whiteSpace: 'nowrap' }}
        >
          {t('page.consignmentImport.info.pendingLabel')}
        </Typography>
        <Typography
          sx={{ fontSize: '0.85rem', fontWeight: 700, color: allDone ? 'success.dark' : 'error.dark', fontFamily: 'monospace' }}
        >
          {importedCount} / {totalDiff}
        </Typography>
        {allDone && <CheckCircleOutlineIcon sx={{ fontSize: '0.9rem', color: 'success.main' }} />}
      </Box>
    </Box>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

function ConsignmentImportPage() {
  const router = useRouter()
  const { t } = useTranslation()
  const [slips, setSlips] = useState<Slip[]>(() =>
    MOCK_SLIPS.map(s => ({ ...s, items: s.items.map(i => ({ ...i })) }))
  )
  const [slipIndex, setSlipIndex] = useState(0)
  const [toast, setToast] = useState<{ open: boolean; severity: 'success' | 'info' | 'error'; message: string }>({
    open: false, severity: 'info', message: '',
  })

  const currentSlip = slips[slipIndex]
  const diffItems = currentSlip.items.filter(i => i.diffQty !== 0)
  const importedCount = diffItems.filter(i => i.imported).length
  const totalDiff = diffItems.length
  const allDiffImported = totalDiff === 0 || importedCount === totalDiff

  const handlePrev = () => {
    if (slipIndex > 0) setSlipIndex(prev => prev - 1)
    else setToast({ open: true, severity: 'info', message: t('page.consignmentImport.toast.noPrev') })
  }

  const handleNext = () => {
    if (slipIndex < slips.length - 1) setSlipIndex(prev => prev + 1)
    else setToast({ open: true, severity: 'info', message: t('page.consignmentImport.toast.noNext') })
  }

  const handleStop = () => router.history.back()

  const handleImport = () => {
    setSlips(prev =>
      prev.map((slip, i) =>
        i !== slipIndex
          ? slip
          : { ...slip, items: slip.items.map(item => item.diffQty !== 0 ? { ...item, imported: true } : item) }
      )
    )
    setToast({ open: true, severity: 'success', message: t('page.consignmentImport.toast.imported') })
  }

  useLayoutConfig({
    title: t('page.consignmentImport.title'),
    hideSecondaryNav: true,
    actions: [
      {
        key: 'prev',
        labelKey: 'page.consignmentImport.action.prev',
        position: 'left',
        variant: 'outlined',
        color: 'inherit',
        startIcon: <NavigateBeforeIcon fontSize="small" />,
        disabled: slipIndex === 0,
        onClick: handlePrev,
      },
      {
        key: 'next',
        labelKey: 'page.consignmentImport.action.next',
        position: 'left',
        variant: 'outlined',
        color: 'inherit',
        startIcon: <NavigateNextIcon fontSize="small" />,
        disabled: slipIndex === slips.length - 1,
        onClick: handleNext,
      },
      {
        key: 'stop',
        labelKey: 'page.consignmentImport.action.stop',
        position: 'right',
        variant: 'outlined',
        color: 'inherit',
        startIcon: <BlockIcon fontSize="small" />,
        onClick: handleStop,
      },
      {
        key: 'import',
        labelKey: 'page.consignmentImport.action.import',
        position: 'right',
        variant: 'contained',
        color: 'primary',
        startIcon: <FileDownloadIcon fontSize="small" />,
        disabled: allDiffImported,
        onClick: handleImport,
      },
    ],
  })

  const hSx = {
    fontWeight: 700,
    fontSize: '0.78rem',
    color: 'text.secondary',
    bgcolor: 'grey.50',
    whiteSpace: 'nowrap' as const,
    py: 0.75,
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>

      {/* ── Slip summary bar ── */}
      <SlipInfoBar
        slip={currentSlip}
        importedCount={importedCount}
        totalDiff={totalDiff}
        slipIndex={slipIndex}
        totalSlips={slips.length}
      />

      {/* ── Diff table ── */}
      <Box sx={{ flex: 1, minHeight: 0, overflow: 'hidden', '& > .MuiPaper-root': { height: '100%' } }}>
        <AppTableContainer stickyHeader maxHeight="100%">
          <Table size="small" stickyHeader sx={{ tableLayout: 'fixed' }}>
            <TableHead>
              <TableRow>
                <TableCell sx={{ ...hSx, width: 48, textAlign: 'center' }}>
                  {t('page.consignmentImport.col.no')}
                </TableCell>
                <TableCell sx={{ ...hSx, width: 120 }}>
                  {t('page.consignmentImport.col.code')}
                </TableCell>
                <TableCell sx={hSx}>
                  {t('page.consignmentImport.col.productName')}
                </TableCell>
                <TableCell sx={{ ...hSx, width: 44, textAlign: 'center' }}>
                  {t('page.consignmentImport.col.condition')}
                </TableCell>
                <TableCell sx={{ ...hSx, width: 170 }}>
                  {t('page.consignmentImport.col.subCategory')}
                </TableCell>
                <TableCell sx={{ ...hSx, width: 72, textAlign: 'right' }}>
                  {t('page.consignmentImport.col.shippedQty')}
                </TableCell>
                <TableCell sx={{ ...hSx, width: 72, textAlign: 'right' }}>
                  {t('page.consignmentImport.col.receivedQty')}
                </TableCell>
                <TableCell sx={{ ...hSx, width: 72, textAlign: 'right' }}>
                  {t('page.consignmentImport.col.diffQty')}
                </TableCell>
                <TableCell sx={{ ...hSx, width: 88, textAlign: 'center' }} />
              </TableRow>
            </TableHead>

            <TableBody>
              {currentSlip.items.map(item => {
                const hasDiff = item.diffQty !== 0
                const rowBg = item.imported
                  ? 'action.disabledBackground'
                  : hasDiff
                    ? '#fff5f5'
                    : 'inherit'
                const diffColBg = !item.imported && hasDiff ? '#ffcdd2' : undefined

                return (
                  <TableRow key={item.id} hover sx={{ bgcolor: rowBg }}>
                    <TableCell sx={{ fontSize: '0.82rem', textAlign: 'center', color: 'text.disabled' }}>
                      {item.no}
                    </TableCell>
                    <TableCell sx={{ fontSize: '0.82rem', fontFamily: 'monospace', whiteSpace: 'nowrap' }}>
                      {item.code}
                    </TableCell>
                    <TableCell sx={{ fontSize: '0.82rem' }}>
                      {item.productName}
                    </TableCell>
                    <TableCell sx={{ fontSize: '0.82rem', textAlign: 'center' }}>
                      {item.condition}
                    </TableCell>
                    <TableCell sx={{ fontSize: '0.82rem' }}>
                      {item.subCategory}
                    </TableCell>
                    <TableCell sx={{ fontSize: '0.82rem', textAlign: 'right', bgcolor: diffColBg }}>
                      {item.shippedQty}
                    </TableCell>
                    <TableCell sx={{ fontSize: '0.82rem', textAlign: 'right', bgcolor: diffColBg }}>
                      {item.receivedQty}
                    </TableCell>
                    <TableCell
                      sx={{
                        fontSize: '0.82rem',
                        textAlign: 'right',
                        fontWeight: hasDiff ? 700 : 400,
                        color: item.diffQty < 0 ? 'error.main' : item.diffQty > 0 ? 'success.main' : 'text.secondary',
                        bgcolor: diffColBg,
                      }}
                    >
                      {item.diffQty > 0 ? `+${item.diffQty}` : item.diffQty === 0 ? '−' : item.diffQty}
                    </TableCell>
                    <TableCell sx={{ textAlign: 'center', py: 0.25 }}>
                      {hasDiff && (
                        <Chip
                          label={item.imported
                            ? t('page.consignmentImport.status.imported')
                            : t('page.consignmentImport.status.pending')}
                          size="small"
                          color={item.imported ? 'success' : 'error'}
                          variant={item.imported ? 'outlined' : 'filled'}
                          sx={{ fontSize: '0.7rem', height: 20, fontWeight: 600 }}
                        />
                      )}
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </AppTableContainer>
      </Box>

      <Snackbar
        open={toast.open}
        autoHideDuration={3000}
        onClose={() => setToast(p => ({ ...p, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity={toast.severity} onClose={() => setToast(p => ({ ...p, open: false }))} sx={{ width: '100%' }}>
          {toast.message}
        </Alert>
      </Snackbar>
    </Box>
  )
}
