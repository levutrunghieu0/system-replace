import { useState, useEffect } from 'react'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import Button from '@mui/material/Button'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import RadioGroup from '@mui/material/RadioGroup'
import FormControlLabel from '@mui/material/FormControlLabel'
import Radio from '@mui/material/Radio'
import FormLabel from '@mui/material/FormLabel'
import PrintIcon from '@mui/icons-material/Print'
import CircularProgress from '@mui/material/CircularProgress'
import { useTranslation } from 'react-i18next'

interface LabelPrintingDialogProps {
  open: boolean
  onClose: (printed: boolean, config?: string) => void
  skipPrompt?: boolean
}

export function LabelPrintingDialog({ open, onClose, skipPrompt = false }: LabelPrintingDialogProps) {
  const { t } = useTranslation()
  const [step, setStep] = useState<'prompt' | 'config' | 'printing'>('prompt')
  const [labelType, setLabelType] = useState('')

  useEffect(() => {
    if (open) {
      setStep(skipPrompt ? 'config' : 'prompt')
      setLabelType(t('page.warehouse.csvPurchase.labelPrinting.config.auto'))
    }
  }, [open, skipPrompt, t])

  const handlePromptYes = () => {
    setStep('config')
  }

  const handlePromptNo = () => {
    onClose(false)
  }

  const handlePrintExecute = () => {
    setStep('printing')
    setTimeout(() => {
      onClose(true, labelType)
    }, 2000) // 2 seconds simulation
  }

  const labelOptions = Object.entries(t('page.warehouse.csvPurchase.labelPrinting.config.options', { returnObjects: true })).map(([key, value]) => ({ key, value }))


  if (step === 'prompt') {
    return (
      <Dialog open={open} maxWidth="xs" fullWidth slotProps={{ paper: { sx: { borderRadius: 3 } } }}>
        <DialogContent sx={{ p: 4, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, textAlign: 'center' }}>
          <PrintIcon sx={{ fontSize: 48, color: 'primary.main' }} />
          <Typography sx={{ fontSize: '1rem', fontWeight: 700, mt: 1 }}>
            {t('page.warehouse.csvPurchase.labelPrinting.prompt.title')}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {t('page.warehouse.csvPurchase.labelPrinting.prompt.subtitle')}
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2.5, gap: 1.5, borderTop: '1px solid', borderColor: 'divider', bgcolor: 'grey.50' }}>
          <Button variant="outlined" color="inherit" onClick={handlePromptNo} sx={{ textTransform: 'none', minWidth: 100, fontWeight: 600 }}>
            {t('page.warehouse.csvPurchase.labelPrinting.prompt.no')}
          </Button>
          <Button variant="contained" onClick={handlePromptYes} sx={{ textTransform: 'none', minWidth: 100, fontWeight: 700 }}>
            {t('page.warehouse.csvPurchase.labelPrinting.prompt.yes')}
          </Button>
        </DialogActions>
      </Dialog>
    )
  }

  if (step === 'printing') {
    return (
      <Dialog open={open} slotProps={{ paper: { sx: { borderRadius: 3, width: '100%', maxWidth: 300 } } }}>
        <DialogContent sx={{ p: 5, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3, textAlign: 'center' }}>
          <CircularProgress size={50} thickness={4} />
          <Box>
            <Typography sx={{ fontWeight: 700, mb: 0.5 }}>{t('page.warehouse.csvPurchase.labelPrinting.printing')}</Typography>
            <Typography variant="caption" color="text.secondary">{t('page.warehouse.csvPurchase.labelPrinting.printingNetwork')}</Typography>
          </Box>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Dialog open={open} maxWidth="sm" fullWidth slotProps={{ paper: { sx: { borderRadius: 3 } } }}>
      <DialogTitle sx={{ fontSize: '0.975rem', fontWeight: 700, py: 2, borderBottom: '1px solid', borderColor: 'divider' }}>
        {t('page.warehouse.csvPurchase.labelPrinting.title')}
      </DialogTitle>

      <DialogContent sx={{ p: 3, display: 'flex', flexDirection: 'column', gap: 3 }}>
        <Box>
          <Typography variant="subtitle2" sx={{ fontWeight: 700, borderBottom: '2px solid', borderColor: 'primary.main', pb: 0.5, display: 'inline-block', mb: 1.5 }}>
            {t('page.warehouse.csvPurchase.labelPrinting.config.header')}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {t('page.warehouse.csvPurchase.labelPrinting.config.subtitle')}
          </Typography>
        </Box>

        <Box>
          <FormLabel sx={{ fontSize: '0.85rem', fontWeight: 700, color: 'text.primary', mb: 1, display: 'block' }}>
            {t('page.warehouse.csvPurchase.labelPrinting.config.labelType')}
          </FormLabel>
          <RadioGroup value={labelType} onChange={(e) => setLabelType(e.target.value)}>
            <FormControlLabel
              value={t('page.warehouse.csvPurchase.labelPrinting.config.auto')}
              control={<Radio size="small" />}
              label={<Typography sx={{ fontSize: '0.875rem', fontWeight: 600 }}>{t('page.warehouse.csvPurchase.labelPrinting.config.auto')}</Typography>}
              sx={{ mb: 1 }}
            />
            
            <FormLabel sx={{ fontSize: '0.8rem', color: 'text.secondary', display: 'block', mt: 1, mb: 1 }}>
              {t('page.warehouse.csvPurchase.labelPrinting.config.batch')}
            </FormLabel>

            <Box sx={{ display: 'flex', flexWrap: 'wrap' }}>
              {labelOptions.map((opt) => (
                <Box key={opt.key} sx={{ width: '50%'}}>
                  <FormControlLabel
                    value={opt.value as string}
                    control={<Radio size="small" />}
                    label={<Typography sx={{ fontSize: '0.825rem' }}>{opt.value as string}</Typography>}
                  />
                </Box>
              ))}
            </Box>

            <FormControlLabel
              value={t('page.warehouse.csvPurchase.labelPrinting.config.perItem')}
              control={<Radio size="small" />}
              label={<Typography sx={{ fontSize: '0.875rem', fontWeight: 600 }}>{t('page.warehouse.csvPurchase.labelPrinting.config.perItem')}</Typography>}
              sx={{ mt: 2 }}
            />
          </RadioGroup>
        </Box>
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2, gap: 1.5, borderTop: '1px solid', borderColor: 'divider', bgcolor: 'grey.50' }}>
        <Button variant="outlined" color="inherit" onClick={() => setStep('prompt')} sx={{ textTransform: 'none', minWidth: 100, fontWeight: 600 }}>
          {t('action.cancel')}
        </Button>
        <Button variant="contained" onClick={handlePrintExecute} sx={{ textTransform: 'none', minWidth: 100, fontWeight: 700 }}>
          {t('page.warehouse.csvPurchase.labelPrinting.execute')}
        </Button>
      </DialogActions>
    </Dialog>
  )
}
