import { createFileRoute, useRouter } from '@tanstack/react-router'
import { useState, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Paper from '@mui/material/Paper'
import Chip from '@mui/material/Chip'
import Divider from '@mui/material/Divider'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import RadioGroup from '@mui/material/RadioGroup'
import FormControlLabel from '@mui/material/FormControlLabel'
import FormLabel from '@mui/material/FormLabel'
import Radio from '@mui/material/Radio'
import Button from '@mui/material/Button'
import Snackbar from '@mui/material/Snackbar'
import Alert from '@mui/material/Alert'
import CircularProgress from '@mui/material/CircularProgress'
import type { ColumnDef } from '@tanstack/react-table'
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import { DatePicker } from '@mui/x-date-pickers/DatePicker'
import { ja } from 'date-fns/locale'
import NavigateBeforeIcon from '@mui/icons-material/NavigateBefore'
import NavigateNextIcon from '@mui/icons-material/NavigateNext'
import PlayArrowIcon from '@mui/icons-material/PlayArrow'
import CloseIcon from '@mui/icons-material/Close'
import SearchOffIcon from '@mui/icons-material/SearchOff'

import type { LegacySlip, CsvPurchaseItem } from '../features/csv-purchase/types'
import { useLayoutConfig } from '../hooks/useLayoutConfig'
import { AppTable } from '../components/table/AppTable'
import { csvPurchaseApi } from '../features/csv-purchase/api/csvPurchaseApi'

export const Route = createFileRoute('/warehouse/csv-purchase-correction')({
  component: CsvPurchaseCorrectionPageRoot,
})

function CsvPurchaseCorrectionPageRoot() {
  return <CsvPurchaseCorrectionPage />
}

type CorrectionMode = 'cancel' | 'correct'
type CorrectionFlowState = 'modal' | 'workspace'

function CsvPurchaseCorrectionPage() {
  const { t } = useTranslation()
  const router = useRouter()

  // ── Modal state ──────────────────────────────────────────────
  const [flowState, setFlowState] = useState<CorrectionFlowState>('modal')
  const [correctionDate, setCorrectionDate] = useState<Date | null>(null)
  const [mode, setMode] = useState<CorrectionMode>('cancel')
  const [searching, setSearching] = useState(false)

  // ── Workspace state ──────────────────────────────────────────
  const [slips, setSlips] = useState<LegacySlip[]>([])
  const [slipIndex, setSlipIndex] = useState(0)
  const [executing, setExecuting] = useState(false)
  const [toastMessage, setToastMessage] = useState<string | null>(null)

  const currentSlip: LegacySlip | null = slips[slipIndex] ?? null

  const formattedCorrectionDate = correctionDate
    ? `${correctionDate.getMonth() + 1}/${correctionDate.getDate()}`
    : ''

  const goBackToModal = () => {
    setFlowState('modal')
    setSlips([])
    setSlipIndex(0)
  }

  // ── Layout config ─────────────────────────────────────────────
  const layoutActions = useMemo(() => {
    if (flowState !== 'workspace') return []
    return [
      {
        key: 'prev',
        labelKey: 'action.prev',
        position: 'left' as const,
        variant: 'outlined' as const,
        color: 'inherit' as const,
        disabled: slipIndex === 0,
        startIcon: <NavigateBeforeIcon fontSize="small" />,
        onClick: () => setSlipIndex((i) => Math.max(0, i - 1)),
      },
      {
        key: 'next',
        labelKey: 'action.next',
        position: 'left' as const,
        variant: 'outlined' as const,
        color: 'inherit' as const,
        disabled: slipIndex === slips.length - 1,
        startIcon: <NavigateNextIcon fontSize="small" />,
        onClick: () => setSlipIndex((i) => Math.min(slips.length - 1, i + 1)),
      },
      {
        key: 'execute',
        labelKey: 'action.run',
        position: 'right' as const,
        variant: 'contained' as const,
        color: 'primary' as const,
        disabled: !currentSlip || executing,
        startIcon: executing ? undefined : <PlayArrowIcon fontSize="small" />,
        onClick: handleExecute,
      },
    ]
  }, [flowState, currentSlip, executing, slipIndex, slips.length]) // eslint-disable-line react-hooks/exhaustive-deps

  useLayoutConfig({
    title: t('page.warehouse.csvPurchaseCorrection.title'),
    showBackButton: true,
    hideSecondaryNav: flowState === 'workspace',
    onBack: flowState === 'workspace' ? goBackToModal : () => router.history.back(),
    actions: layoutActions,
  })

  // ── Handlers ──────────────────────────────────────────────────
  const handleModalExecute = async () => {
    if (!correctionDate) return
    setSearching(true)
    try {
      const dateStr = correctionDate.toISOString().split('T')[0]
      const fetchedSlips = await csvPurchaseApi.getLegacySlips(dateStr)
      setSlips(fetchedSlips)
      setSlipIndex(0)
      setFlowState('workspace')
    } finally {
      setSearching(false)
    }
  }

  function handleExecute() {
    if (!currentSlip) return
    setExecuting(true)
    csvPurchaseApi
      .cancelSlip(currentSlip.slipNumber)
      .then(() => {
        if (mode === 'cancel') {
          setToastMessage(t('page.warehouse.csvPurchaseCorrection.cancellationToast'))
          setTimeout(() => router.navigate({ to: '/' }), 2000)
        } else {
          router.navigate({
            to: '/warehouse/csv-purchase',
            search: {
              skipToFile: true,
              partnerCode: currentSlip.partnerCode,
              partnerName: currentSlip.partnerName,
            },
          })
        }
      })
      .finally(() => setExecuting(false))
  }

  // ── Table columns ──────────────────────────────────────────────
  const columns = useMemo<ColumnDef<CsvPurchaseItem>[]>(
    () => [
      {
        id: 'no',
        header: t('page.warehouse.csvPurchaseCorrection.workspace.column.no'),
        size: 60,
        cell: (info) => (
          <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center' }}>
            {info.row.index + 1}
          </Typography>
        ),
      },
      {
        accessorKey: 'productCode',
        header: t('page.warehouse.csvPurchase.workspace.column.productCode'),
        size: 140,
        cell: (info) => (
          <Typography variant="body2" sx={{ fontFamily: 'monospace', fontSize: '0.8rem' }}>
            {String(info.getValue())}
          </Typography>
        ),
      },
      {
        accessorKey: 'productName',
        header: t('page.warehouse.csvPurchaseCorrection.workspace.column.productName'),
        cell: (info) => <Typography variant="body2">{String(info.getValue())}</Typography>,
      },
      {
        accessorKey: 'status',
        header: t('page.warehouse.csvPurchaseCorrection.workspace.column.status'),
        size: 90,
        cell: (info) => <Typography variant="body2">{String(info.getValue())}</Typography>,
      },
      {
        accessorKey: 'quantity',
        header: t('page.warehouse.csvPurchase.workspace.column.quantity'),
        size: 70,
        cell: (info) => (
          <Typography variant="body2" sx={{ textAlign: 'right', fontWeight: 600 }}>
            {String(info.getValue())}
          </Typography>
        ),
      },
      {
        accessorKey: 'price',
        header: t('page.warehouse.csvPurchaseCorrection.workspace.column.unitPrice'),
        size: 110,
        cell: (info) => (
          <Typography variant="body2" sx={{ textAlign: 'right' }}>
            ¥{(info.getValue() as number).toLocaleString()}
          </Typography>
        ),
      },
      {
        id: 'purchaseAmount',
        header: t('page.warehouse.csvPurchaseCorrection.workspace.column.amount'),
        size: 110,
        cell: (info) => {
          const row = info.row.original
          return (
            <Typography variant="body2" sx={{ fontWeight: 600, textAlign: 'right' }}>
              ¥{(row.price * row.quantity).toLocaleString()}
            </Typography>
          )
        },
      },
    ],
    [t]
  )

  const rowSx = {
    display: 'flex',
    alignItems: 'center',
    px: 3,
    py: 2.5,
    borderBottom: '1px solid',
    borderColor: 'divider',
  }
  const labelSx = {
    minWidth: 120,
    fontSize: '0.875rem',
    fontWeight: 600,
    color: 'text.primary',
    flexShrink: 0,
  }

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ja}>
      <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>

        {/* ── 利用機能選択 Modal (wireframe screens 2-3) ── */}
        <Dialog
          open={flowState === 'modal'}
          maxWidth="xs"
          fullWidth
          slotProps={{ paper: { sx: { borderRadius: 3 } } }}
        >
          <DialogTitle sx={{
            fontSize: '0.975rem',
            fontWeight: 700,
            py: 2,
            borderBottom: '1px solid',
            borderColor: 'divider',
          }}>
            {t('page.warehouse.csvPurchaseCorrection.modalTitle')}
          </DialogTitle>

          <DialogContent sx={{ p: 0 }}>
            {/* 修正計上日 date picker row */}
            <Box sx={rowSx}>
              <FormLabel sx={labelSx}>
                {t('page.warehouse.csvPurchaseCorrection.date')}
              </FormLabel>
              <DatePicker
                value={correctionDate}
                onChange={setCorrectionDate}
                slotProps={{
                  textField: {
                    size: 'small',
                    sx: { flex: 1 },
                    helperText: t('page.warehouse.csvPurchaseCorrection.dateHint'),
                  },
                  field: { clearable: true },
                }}
              />
            </Box>

            {/* 伝票取消 / 仕入修正 radio row */}
            <Box sx={{ px: 3, py: 2.5 }}>
              <RadioGroup
                row
                value={mode}
                onChange={(e) => setMode(e.target.value as CorrectionMode)}
                sx={{ justifyContent: 'center', gap: 4 }}
              >
                <FormControlLabel
                  value="cancel"
                  control={<Radio size="small" />}
                  label={
                    <Typography sx={{ fontSize: '0.875rem' }}>
                      {t('page.warehouse.csvPurchaseCorrection.slipCancellation')}
                    </Typography>
                  }
                />
                <FormControlLabel
                  value="correct"
                  control={<Radio size="small" />}
                  label={
                    <Typography sx={{ fontSize: '0.875rem' }}>
                      {t('page.warehouse.csvPurchaseCorrection.purchaseCorrection')}
                    </Typography>
                  }
                />
              </RadioGroup>
            </Box>
          </DialogContent>

          <DialogActions sx={{
            px: 3,
            py: 2,
            gap: 1.5,
            borderTop: '1px solid',
            borderColor: 'divider',
            bgcolor: 'grey.50',
          }}>
            <Button
              variant="outlined"
              color="inherit"
              startIcon={<CloseIcon fontSize="small" />}
              onClick={() => router.history.back()}
              sx={{ textTransform: 'none', flex: 1, fontWeight: 600 }}
            >
              {t('action.cancel')}
            </Button>
            <Button
              variant="contained"
              startIcon={searching ? undefined : <PlayArrowIcon fontSize="small" />}
              onClick={handleModalExecute}
              disabled={!correctionDate || searching}
              sx={{ textTransform: 'none', flex: 1, fontWeight: 700 }}
            >
              {searching
                ? <CircularProgress size={20} color="inherit" />
                : t('action.run')
              }
            </Button>
          </DialogActions>
        </Dialog>

        {/* ── Workspace (wireframe screen 4) ── */}
        {flowState === 'workspace' && (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, height: '100%' }}>
            {slips.length === 0 ? (
              /* ── Empty state ── */
              <Box sx={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 2,
                color: 'text.secondary',
              }}>
                <SearchOffIcon sx={{ fontSize: 64, opacity: 0.4 }} />
                <Typography variant="body1" sx={{ fontWeight: 600 }}>
                  {t('page.warehouse.csvPurchaseCorrection.noSlipsFound')}
                </Typography>
                <Button
                  variant="outlined"
                  color="inherit"
                  startIcon={<NavigateBeforeIcon fontSize="small" />}
                  onClick={goBackToModal}
                  sx={{ textTransform: 'none', mt: 1 }}
                >
                  {t('action.back')}
                </Button>
              </Box>
            ) : (
              <>
                {/* ── Compact summary bar ── */}
                <Paper
                  variant="outlined"
                  sx={{
                    px: 2,
                    py: 1,
                    display: 'flex',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: 0,
                    bgcolor: 'background.paper',
                    borderRadius: 1,
                  }}
                >
                  {[
                    {
                      label: t('page.warehouse.csvPurchaseCorrection.workspace.header.source'),
                      value: currentSlip?.partnerName,
                    },
                    {
                      label: t('page.warehouse.csvPurchaseCorrection.workspace.header.sourceCode'),
                      value: currentSlip?.partnerCode,
                    },
                    {
                      label: t('page.warehouse.csvPurchaseCorrection.workspace.header.slipNumber'),
                      value: currentSlip?.slipNumber,
                    },
                    {
                      label: t('page.warehouse.csvPurchase.workspace.header.totalQuantity'),
                      value: `${currentSlip?.totalQuantity ?? 0} ${t('page.warehouse.csvPurchase.workspace.header.unit')}`,
                    },
                    {
                      label: t('page.warehouse.csvPurchase.workspace.header.totalAmount'),
                      value: `¥${(currentSlip?.totalAmount ?? 0).toLocaleString()}`,
                    },
                    {
                      label: t('page.warehouse.csvPurchaseCorrection.date'),
                      value: formattedCorrectionDate,
                    },
                  ].map((item, i, arr) => (
                    <Box key={item.label} sx={{ display: 'flex', alignItems: 'center' }}>
                      <Box sx={{ px: 1.5, py: 0.5 }}>
                        <Typography variant="caption" color="text.secondary" sx={{ mr: 0.5 }}>
                          {item.label}:
                        </Typography>
                        <Typography component="span" variant="body2" sx={{ fontWeight: 600 }}>
                          {item.value}
                        </Typography>
                      </Box>
                      {i < arr.length - 1 && (
                        <Divider orientation="vertical" flexItem sx={{ height: 20, alignSelf: 'center' }} />
                      )}
                    </Box>
                  ))}

                  {/* Right side: slip pagination + mode chip */}
                  <Box sx={{ ml: 'auto', display: 'flex', alignItems: 'center', gap: 1, px: 1 }}>
                    {slips.length > 1 && (
                      <Chip
                        label={`${t('page.warehouse.csvPurchaseCorrection.slip')} ${slipIndex + 1} / ${slips.length}`}
                        size="small"
                        variant="outlined"
                        color="primary"
                        sx={{ fontSize: '0.72rem', height: 22 }}
                      />
                    )}
                    <Chip
                      label={
                        mode === 'cancel'
                          ? t('page.warehouse.csvPurchaseCorrection.slipCancellation')
                          : t('page.warehouse.csvPurchaseCorrection.purchaseCorrection')
                      }
                      size="small"
                      color={mode === 'cancel' ? 'error' : 'warning'}
                      sx={{ fontSize: '0.72rem', height: 22, fontWeight: 700 }}
                    />
                  </Box>
                </Paper>

                {/* ── Items table ── */}
                <Box sx={{ flex: 1, minHeight: 0 }}>
                  {currentSlip && (
                    <AppTable<CsvPurchaseItem>
                      data={currentSlip.items}
                      columns={columns}
                      dense
                    />
                  )}
                </Box>
              </>
            )}
          </Box>
        )}

        {/* Toast */}
        <Snackbar
          open={Boolean(toastMessage)}
          autoHideDuration={4000}
          onClose={() => setToastMessage(null)}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
        >
          <Alert severity="success" onClose={() => setToastMessage(null)} sx={{ width: '100%' }}>
            {toastMessage}
          </Alert>
        </Snackbar>
      </Box>
    </LocalizationProvider>
  )
}
