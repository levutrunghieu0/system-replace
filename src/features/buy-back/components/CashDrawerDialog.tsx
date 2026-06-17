import { useState } from 'react'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import CircularProgress from '@mui/material/CircularProgress'
import CurrencyYenIcon from '@mui/icons-material/CurrencyYen'
import { useTranslation } from 'react-i18next'
import { AppModal } from '../../../components/common/AppModal'

type Step = 'recreate' | 'cash_input' | 'processing'

interface Props {
  open: boolean
  receiptNumber: string
  onComplete: () => void
  onClose: () => void
}

export function CashDrawerDialog({ open, receiptNumber, onComplete, onClose }: Props) {
  const { t } = useTranslation()
  const [step, setStep] = useState<Step>('recreate')

  const handleClose = () => { setStep('recreate'); onClose() }
  const handleRecreate = () => { setStep('processing'); setTimeout(() => setStep('cash_input'), 1500) }
  const handleCashInput = () => {
    setStep('processing')
    setTimeout(() => { setStep('recreate'); onComplete() }, 1200)
  }

  if (step === 'processing') {
    return (
      <AppModal open={open} onClose={() => {}} title="">
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, py: 3 }}>
          <CircularProgress size={48} />
          <Typography variant="body2" color="text.secondary">
            {t('page.purchase.cashDrawer.processing')}
          </Typography>
        </Box>
      </AppModal>
    )
  }

  if (step === 'recreate') {
    return (
      <AppModal
        open={open}
        onClose={handleClose}
        title={t('page.purchase.cashDrawer.recreate.title')}
        actions={[
          { label: t('page.purchase.cashDrawer.recreate.cancel'), onClick: handleClose, variant: 'outlined', color: 'inherit' },
          { label: t('page.purchase.cashDrawer.recreate.confirm'), onClick: handleRecreate, variant: 'contained', color: 'primary' },
        ]}
      >
        <Typography variant="body2" color="text.secondary">
          {t('page.purchase.cashDrawer.recreate.message', { receiptNumber })}
        </Typography>
      </AppModal>
    )
  }

  return (
    <AppModal
      open={open}
      onClose={handleClose}
      title={t('page.purchase.cashDrawer.cash.title')}
      actions={[
        { label: t('page.purchase.cashDrawer.cash.cancel'), onClick: handleClose, variant: 'outlined', color: 'inherit' },
        { label: t('page.purchase.cashDrawer.cash.confirm'), onClick: handleCashInput, variant: 'contained', color: 'success' },
      ]}
    >
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, py: 1 }}>
        <CurrencyYenIcon sx={{ fontSize: 48, color: 'success.main' }} />
        <Typography variant="body1" sx={{ fontWeight: 600, textAlign: 'center' }}>
          {t('page.purchase.cashDrawer.cash.message')}
        </Typography>
      </Box>
    </AppModal>
  )
}
