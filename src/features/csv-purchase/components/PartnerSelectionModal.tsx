import { useState, useEffect } from 'react'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import Button from '@mui/material/Button'
import FormLabel from '@mui/material/FormLabel'
import RadioGroup from '@mui/material/RadioGroup'
import FormControlLabel from '@mui/material/FormControlLabel'
import Radio from '@mui/material/Radio'
import TextField from '@mui/material/TextField'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import InputAdornment from '@mui/material/InputAdornment'
import SearchIcon from '@mui/icons-material/Search'
import Alert from '@mui/material/Alert'
import { useTranslation } from 'react-i18next'
import { csvPurchaseApi } from '../api/csvPurchaseApi'
import type { Partner } from '../types'

interface PartnerSelectionModalProps {
  open: boolean
  onConfirm: (mode: 'csv' | 'reference', partner: Partner) => void
  onCancel: () => void
}

export function PartnerSelectionModal({ open, onConfirm, onCancel }: PartnerSelectionModalProps) {
  const { t } = useTranslation()
  const [mode, setMode] = useState<'csv' | 'reference'>('csv')
  const [partnerCode, setPartnerCode] = useState('')
  const [partner, setPartner] = useState<Partner | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (open) {
      setMode('csv')
      setPartnerCode('')
      setPartner(null)
      setError(null)
    }
  }, [open])

  // Real-time or debounced lookup
  useEffect(() => {
    if (!partnerCode.trim()) {
      setPartner(null)
      setError(null)
      return
    }

    const delayDebounceFn = setTimeout(async () => {
      setLoading(true)
      setError(null)
      try {
        const result = await csvPurchaseApi.verifyPartner(partnerCode)
        setPartner(result)
      } catch (e: unknown) {
        setPartner(null)
        if (e instanceof Error) {
          if (e.message.includes('無効です')) {
            setError(t('page.warehouse.csvPurchase.partnerSelection.invalidPartner'))
          } else {
            setError(e.message)
          }
        } else {
          setError(t('page.warehouse.csvPurchase.partnerSelection.invalidPartner'))
        }
      } finally {
        setLoading(false)
      }
    }, 400)

    return () => clearTimeout(delayDebounceFn)
  }, [partnerCode, t])

  const handleExecute = () => {
    if (partner) {
      onConfirm(mode, partner)
    }
  }

  const rowSx = {
    display: 'flex',
    alignItems: 'center',
    px: 3,
    py: 2.2,
    borderBottom: '1px solid',
    borderColor: 'divider',
  }
  const labelSx = { minWidth: 140, fontSize: '0.875rem', fontWeight: 600, color: 'text.primary', flexShrink: 0 }

  return (
    <Dialog open={open} maxWidth="sm" fullWidth slotProps={{ paper: { sx: { borderRadius: 3 } } }}>
      <DialogTitle sx={{ fontSize: '0.975rem', fontWeight: 700, py: 2, borderBottom: '1px solid', borderColor: 'divider' }}>
        {t('page.warehouse.csvPurchase.partnerSelection.title')}
      </DialogTitle>

      <DialogContent sx={{ p: 0 }}>
        {/* Mode switch */}
        <Box sx={rowSx}>
          <FormLabel sx={labelSx}>{t('page.warehouse.csvPurchase.partnerSelection.functionType')}</FormLabel>
          <RadioGroup row value={mode} onChange={(e) => setMode(e.target.value as 'csv' | 'reference')}>
            <FormControlLabel
              value="csv"
              control={<Radio size="small" />}
              label={<Typography sx={{ fontSize: '0.875rem' }}>{t('page.warehouse.csvPurchase.partnerSelection.csvPurchase')}</Typography>}
            />
            <FormControlLabel
              value="reference"
              control={<Radio size="small" />}
              label={<Typography sx={{ fontSize: '0.875rem', ml: 1 }}>{t('page.warehouse.csvPurchase.partnerSelection.slipReference')}</Typography>}
              sx={{ ml: 4 }}
            />
          </RadioGroup>
        </Box>

        {/* Partner code input */}
        <Box sx={{ ...rowSx, borderBottom: 'none', pb: 3 }}>
          <FormLabel sx={labelSx}>{t('page.warehouse.csvPurchase.partnerSelection.partnerCode')}</FormLabel>
          <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 1.5 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <TextField
                size="small"
                placeholder={t('page.warehouse.csvPurchase.partnerSelection.partnerCodePlaceholder')}
                value={partnerCode}
                onChange={(e) => setPartnerCode(e.target.value)}
                slotProps={{
                  input: {
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon fontSize="small" />
                      </InputAdornment>
                    ),
                  },
                }}
                sx={{ width: 160 }}
              />
              {loading && <Typography variant="caption" color="text.secondary">{t('page.warehouse.csvPurchase.partnerSelection.loading')}</Typography>}
              {partner && (
                <Typography variant="body2" sx={{ fontWeight: 600, color: 'success.main' }}>
                  {partner.name}
                </Typography>
              )}
            </Box>

            {error && (
              <Alert severity="warning" variant="outlined" sx={{ py: 0, px: 1, mt: 0.5, '& .MuiAlert-message': { fontSize: '0.78rem', py: 0.5 } }}>
                {error}
              </Alert>
            )}
            
            <Typography variant="caption" color="text.secondary">
              {t('page.warehouse.csvPurchase.partnerSelection.demo')}
            </Typography>
          </Box>
        </Box>
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2, gap: 1.5, borderTop: '1px solid', borderColor: 'divider', bgcolor: 'grey.50' }}>
        <Button variant="outlined" color="inherit" onClick={onCancel} sx={{ textTransform: 'none', minWidth: 100, fontWeight: 600 }}>
          {t('action.cancel')}
        </Button>
        <Button
          variant="contained"
          onClick={handleExecute}
          disabled={!partner}
          sx={{ textTransform: 'none', minWidth: 100, fontWeight: 700 }}
        >
          {t('action.run')}
        </Button>
      </DialogActions>
    </Dialog>
  )
}
