import { createFileRoute, useRouter } from '@tanstack/react-router'
import { useState, useMemo, useEffect, useCallback } from 'react'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import TextField from '@mui/material/TextField'
import InputAdornment from '@mui/material/InputAdornment'
import Paper from '@mui/material/Paper'
import Button from '@mui/material/Button'
import Dialog from '@mui/material/Dialog'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import Divider from '@mui/material/Divider'
import Select from '@mui/material/Select'
import MenuItem from '@mui/material/MenuItem'
import Snackbar from '@mui/material/Snackbar'
import Alert from '@mui/material/Alert'
import type { ColumnDef } from '@tanstack/react-table'
import WarningAmberIcon from '@mui/icons-material/WarningAmber'
import CloseIcon from '@mui/icons-material/Close'
import PlayArrowIcon from '@mui/icons-material/PlayArrow'
import { useTranslation } from 'react-i18next'

import { PartnerSelectionModal } from '../features/csv-purchase/components/PartnerSelectionModal'
import { CsvFileSelector } from '../features/csv-purchase/components/CsvFileSelector'
import { InvoiceVerificationModal } from '../features/csv-purchase/components/InvoiceVerificationModal'
import { LabelPrintingDialog } from '../features/csv-purchase/components/LabelPrintingDialog'
import { RoutingOptionsDialog } from '../features/csv-purchase/components/RoutingOptionsDialog'
import { AppTable } from '../components/table/AppTable'
import { useLayoutConfig } from '../hooks/useLayoutConfig'
import { csvPurchaseApi } from '../features/csv-purchase/api/csvPurchaseApi'
import type { Partner, CsvPurchaseItem } from '../features/csv-purchase/types'

function PriceCell({ rowIndex, price, registrationDate, onPriceChange }: {
  rowIndex: number
  price: number
  registrationDate?: string
  onPriceChange: (rowIndex: number, newPrice: number) => void
}) {
  const [inputVal, setInputVal] = useState(String(price))

  useEffect(() => {
    setInputVal(String(price))
  }, [price])

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
      <TextField
        size="small"
        value={inputVal}
        onChange={(e) => {
          const clean = e.target.value.replace(/[^0-9]/g, '')
          setInputVal(clean)
          if (clean) onPriceChange(rowIndex, Number(clean))
        }}
        slotProps={{
          input: { startAdornment: <InputAdornment position="start">¥</InputAdornment> },
          htmlInput: { style: { textAlign: 'right', fontWeight: 700 } },
        }}
        sx={{ width: '100%' }}
      />
      {registrationDate && (
        <Typography sx={{ fontSize: '0.65rem', color: 'text.secondary', whiteSpace: 'nowrap' }}>
          最終更新日 {registrationDate}
        </Typography>
      )}
    </Box>
  )
}

export const Route = createFileRoute('/warehouse/csv-purchase')({
  validateSearch: (search: Record<string, unknown>) => ({
    skipToFile: search.skipToFile === true,
    partnerCode: typeof search.partnerCode === 'string' ? search.partnerCode : undefined,
    partnerName: typeof search.partnerName === 'string' ? search.partnerName : undefined,
  }),
  component: CsvPurchasePageRoot,
})

function CsvPurchasePageRoot() {
  return <CsvPurchasePage />
}

type ScreenFlowState =
  | 'partner_select'
  | 'file_select'
  | 'parsing_error'
  | 'workspace_grid'
  | 'invoice_verify'
  | 'label_print'
  | 'post_print'   // toast shown while items visible → items cleared → routing dialog
  | 'flow_completed'

function CsvPurchasePage() {
  const router = useRouter()
  const { t } = useTranslation()
  const { skipToFile, partnerCode: prefillCode, partnerName: prefillName } = Route.useSearch()

  const prefillPartner = skipToFile && prefillCode && prefillName
    ? { code: prefillCode, name: prefillName }
    : null

  const [flowState, setFlowState] = useState<ScreenFlowState>(prefillPartner ? 'file_select' : 'partner_select')
  const [partner, setPartner] = useState<Partner | null>(prefillPartner)
  
  const [slipNumber, setSlipNumber] = useState('')
  const [items, setItems] = useState<CsvPurchaseItem[]>([])
  const [toastMessage, setToastMessage] = useState<string | null>(null)
  const [registering, setRegistering] = useState(false)

  // Calculating totals
  const totalQuantity = useMemo(() => items.reduce((sum, item) => sum + item.quantity, 0), [items])
  const totalAmount = useMemo(() => items.reduce((sum, item) => sum + item.price * item.quantity, 0), [items])

  // Handle flow navigations
  const handlePartnerConfirm = (_selectedMode: 'csv' | 'reference', selectedPartner: Partner) => {
    setPartner(selectedPartner)
    setFlowState('file_select')
  }

  const handleFileConfirm = (_fileName: string, parsedItems: CsvPurchaseItem[], isCorrupted: boolean) => {
    if (isCorrupted) {
      setFlowState('parsing_error')
    } else {
      setItems(parsedItems)
      setSlipNumber(String(Math.floor(100000 + Math.random() * 900000)))
      setFlowState('workspace_grid')
    }
  }

  const setItemStatus = useCallback((rowIndex: number, newStatus: string) => {
    setItems(prev => prev.map((item, i) => i === rowIndex ? { ...item, status: newStatus } : item))
  }, [])

  const setItemPrice = useCallback((rowIndex: number, newPrice: number) => {
    const today = new Date().toLocaleDateString('ja-JP', { year: 'numeric', month: '2-digit', day: '2-digit' })
    setItems(prev => prev.map((item, i) => i === rowIndex ? { ...item, price: newPrice, registrationDate: today } : item))
  }, [])

  const handleAbort = () => {
    setItems([])
    setFlowState('file_select')
  }

  const handleGridExecute = () => {
    setFlowState('invoice_verify')
  }

  const handleInvoiceConfirm = async (slipAmount: number) => {
    setRegistering(true)
    try {
      await csvPurchaseApi.registerCsvPurchase(
        {
          partnerCode: partner!.code,
          partnerName: partner!.name,
          items,
          totalQuantity,
          totalAmount,
        },
        slipAmount,
        false,
      )
      setFlowState('label_print')
    } finally {
      setRegistering(false)
    }
  }

  const handleLabelPrintClose = (_printed: boolean, _labelConfig?: string) => {
    setFlowState('post_print')
  }

  // pages 15-16: show toast while grid still populated, then clear items, then show routing dialog
  useEffect(() => {
    if (flowState !== 'post_print') return
    setToastMessage(t('page.warehouse.csvPurchase.toast.purchaseComplete'))
    const t1 = setTimeout(() => setItems([]), 1500)
    const t2 = setTimeout(() => setFlowState('flow_completed'), 2500)
    return () => { clearTimeout(t1); clearTimeout(t2) }
  }, [flowState]) // eslint-disable-line react-hooks/exhaustive-deps

  const handleContinueFlow = () => {
    setItems([])
    setPartner(null)
    setFlowState('partner_select')
  }

  const handleReturnToTop = () => {
    router.navigate({ to: '/' })
  }

  // Layout action configurations based on current UI state
  const layoutActions = useMemo(() => {
    if (flowState === 'workspace_grid') {
      return [
        {
          key: 'abort',
          labelKey: 'action.cancel',
          position: 'left' as const,
          variant: 'outlined' as const,
          color: 'inherit' as const,
          startIcon: <CloseIcon fontSize="small" />,
          onClick: handleAbort,
        },
        {
          key: 'execute',
          labelKey: 'action.run',
          position: 'right' as const,
          variant: 'contained' as const,
          color: 'primary' as const,
          startIcon: <PlayArrowIcon fontSize="small" />,
          onClick: handleGridExecute,
        },
      ]
    }
    return []
  }, [flowState, t])

  useLayoutConfig({
    title: t('page.warehouse.csvPurchase.title'),
    showBackButton: true,
    hideSecondaryNav: flowState === 'workspace_grid' || flowState === 'post_print',
    onBack: flowState === 'workspace_grid' ? handleAbort : () => router.history.back(),
    actions: layoutActions,
  })

  // Table Columns
  const columns = useMemo<ColumnDef<CsvPurchaseItem>[]>(
    () => [
      {
        id: 'productInfo',
        header: t('page.warehouse.csvPurchase.workspace.column.productInfo'),
        size: 280,
        cell: (info) => {
          const row = info.row.original
          return (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.3, py: 0.25, overflow: 'hidden' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                {row.category && (
                  <Box sx={{ display: 'inline-block', bgcolor: 'action.hover', px: 1, py: 0.1, borderRadius: 1, fontSize: '0.7rem', fontWeight: 600, color: 'text.secondary', whiteSpace: 'nowrap' }}>
                    {row.category}
                  </Box>
                )}
                {row.brand && (
                  <Typography sx={{ fontSize: '0.8rem', color: 'text.secondary' }}>{row.brand}</Typography>
                )}
              </Box>
              <Typography variant="body2" sx={{ fontWeight: 600 }}>{row.productName}</Typography>
              {row.details && (
                <Typography sx={{ fontSize: '0.75rem', color: 'text.secondary' }}>{row.details}</Typography>
              )}
            </Box>
          )
        },
      },
      {
        accessorKey: 'type',
        header: t('page.warehouse.csvPurchase.workspace.column.type'),
        size: 90,
        cell: (info) => (
          <Box sx={{ display: 'inline-block', bgcolor: 'warning.light', color: 'warning.contrastText', px: 1.5, py: 0.4, borderRadius: 2, fontSize: '0.78rem', fontWeight: 600, whiteSpace: 'nowrap' }}>
            {String(info.getValue())}
          </Box>
        ),
      },
      {
        accessorKey: 'status',
        header: t('page.warehouse.csvPurchase.workspace.column.status'),
        size: 120,
        cell: (info) => (
          <Select
            size="small"
            value={info.getValue() as string}
            onChange={(e) => setItemStatus(info.row.index, e.target.value)}
            sx={{ fontSize: '0.8rem', '& .MuiSelect-select': { py: 0.5, px: 1 } }}
          >
            {['新品', '未使用', '中古A', '中古B', '中古C'].map((s) => (
              <MenuItem key={s} value={s} sx={{ fontSize: '0.8rem' }}>{s}</MenuItem>
            ))}
          </Select>
        ),
      },
      {
        accessorKey: 'productCode',
        header: t('page.warehouse.csvPurchase.workspace.column.productCode'),
        size: 170,
        cell: (info) => (
          <Typography variant="body2" sx={{ fontFamily: 'monospace', fontSize: '0.8rem' }}>
            {String(info.getValue())}
          </Typography>
        ),
      },
      {
        accessorKey: 'price',
        header: t('page.warehouse.csvPurchase.workspace.column.price'),
        size: 160,
        cell: (info) => {
          const row = info.row.original
          return (
            <PriceCell
              rowIndex={info.row.index}
              price={row.price}
              registrationDate={row.registrationDate}
              onPriceChange={setItemPrice}
            />
          )
        },
      },
      {
        accessorKey: 'quantity',
        header: t('page.warehouse.csvPurchase.workspace.column.quantity'),
        size: 70,
        cell: (info) => (
          <Typography variant="body2" sx={{ fontWeight: 600 }}>
            {String(info.getValue())}
          </Typography>
        ),
      },
    ],
    [t, setItemStatus, setItemPrice]
  )


  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, height: '100%' }}>
      {/* Modals & Dialog overlays */}
      <PartnerSelectionModal
        open={flowState === 'partner_select'}
        onConfirm={handlePartnerConfirm}
        onCancel={() => router.navigate({ to: '/' })}
      />

      <CsvFileSelector
        open={flowState === 'file_select'}
        onConfirm={handleFileConfirm}
        onCancel={() => setFlowState('partner_select')}
      />

      <InvoiceVerificationModal
        open={flowState === 'invoice_verify'}
        totalAmount={totalAmount}
        onConfirm={handleInvoiceConfirm}
        onCancel={() => setFlowState('workspace_grid')}
        submitting={registering}
      />

      <LabelPrintingDialog
        open={flowState === 'label_print'}
        onClose={handleLabelPrintClose}
      />

      <RoutingOptionsDialog
        open={flowState === 'flow_completed'}
        onContinue={handleContinueFlow}
        onReturn={handleReturnToTop}
      />

      {/* Ingestion Parser Error Modal */}
      <Dialog
        open={flowState === 'parsing_error'}
        maxWidth="xs"
        fullWidth
        slotProps={{ paper: { sx: { borderRadius: 3, p: 1 } } }}
      >
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, textAlign: 'center', pt: 3 }}>
          <WarningAmberIcon color="error" sx={{ fontSize: 56 }} />
          <Typography variant="h6" sx={{ fontWeight: 700 }}>
            {t('page.warehouse.csvPurchase.ingestionError.title')}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {t('page.warehouse.csvPurchase.ingestionError.subtitle')}
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2.5, gap: 1.5, justifyContent: 'center' }}>
          <Button
            variant="contained"
            color="error"
            onClick={() => router.navigate({ to: '/' })}
            sx={{ textTransform: 'none', px: 4, fontWeight: 700 }}
          >
            {t('page.warehouse.csvPurchase.ingestionError.returnToTop')}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Main Workspace Grid (Parsed CSV Rows) — also visible during post_print to show items clearing (pages 15-16) */}
      {(flowState === 'workspace_grid' || flowState === 'post_print') && (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, height: '100%' }}>
          {/* Compact inline header bar */}
          <Paper variant="outlined" sx={{ px: 2, py: 1, display: 'flex', alignItems: 'center', flexWrap: 'wrap', bgcolor: 'background.paper', borderRadius: 1 }}>
            {[
              { label: t('page.warehouse.csvPurchase.workspace.header.supplier'), value: partner?.name },
              { label: t('page.warehouse.csvPurchase.workspace.header.storeCode'), value: partner?.code },
              { label: t('page.warehouse.csvPurchase.workspace.header.slipNumber'), value: slipNumber },
              { label: t('page.warehouse.csvPurchase.workspace.header.totalQuantity'), value: `${totalQuantity} ${t('page.warehouse.csvPurchase.workspace.header.unit')}` },
              { label: t('page.warehouse.csvPurchase.workspace.header.totalAmount'), value: `¥${totalAmount.toLocaleString()}` },
            ].map((item, i, arr) => (
              <Box key={item.label} sx={{ display: 'flex', alignItems: 'center' }}>
                <Box sx={{ px: 1.5, py: 0.5 }}>
                  <Typography variant="caption" color="text.secondary" sx={{ mr: 0.5 }}>{item.label}:</Typography>
                  <Typography component="span" variant="body2" sx={{ fontWeight: 600 }}>{item.value}</Typography>
                </Box>
                {i < arr.length - 1 && <Divider orientation="vertical" flexItem sx={{ height: 20, alignSelf: 'center' }} />}
              </Box>
            ))}
          </Paper>

          {/* Grid presentation */}
          <Box sx={{ flex: 1, minHeight: 0 }}>
            <AppTable<CsvPurchaseItem>
              data={items}
              columns={columns}
              dense
            />
          </Box>
        </Box>
      )}

      {/* Toast popup */}
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
  )
}
