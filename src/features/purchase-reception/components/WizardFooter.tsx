import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import { useTranslation } from 'react-i18next'

interface WizardFooterProps {
  onCancel: () => void
  onNext: () => void
  nextLabel?: string
  nextDisabled?: boolean
  cancelLabel?: string
}

export function WizardFooter({
  onCancel,
  onNext,
  nextLabel,
  nextDisabled = false,
  cancelLabel,
}: WizardFooterProps) {
  const { t } = useTranslation()
  const resolvedNextLabel = nextLabel ?? t('purchaseReceptionWizard.common.next')
  const resolvedCancelLabel = cancelLabel ?? t('purchaseReceptionWizard.common.cancel')

  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        gap: 2,
        py: 3,
        flexShrink: 0,
      }}
    >
      <Button
        variant="outlined"
        onClick={onCancel}
        sx={{ minWidth: 160, height: 52, fontSize: '1rem' }}
      >
        {resolvedCancelLabel}
      </Button>
      <Button
        variant="contained"
        onClick={onNext}
        disabled={nextDisabled}
        sx={{ minWidth: 160, height: 52, fontSize: '1rem' }}
      >
        {resolvedNextLabel}
      </Button>
    </Box>
  )
}
