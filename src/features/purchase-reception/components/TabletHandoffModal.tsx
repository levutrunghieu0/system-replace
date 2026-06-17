import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Dialog from '@mui/material/Dialog'
import DialogContent from '@mui/material/DialogContent'
import Typography from '@mui/material/Typography'
import { useTranslation } from 'react-i18next'

interface TabletHandoffModalProps {
  open: boolean
  direction: 'to-customer' | 'to-staff' | 'cancel'
  onCancel: () => void
  onConfirm: () => void
}

const HandoffIcon = () => (
  <Box
    sx={{
      width: 80,
      height: 80,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      mb: 1,
    }}
  >
    <svg width="72" height="72" viewBox="0 0 72 72" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="8" y="12" width="36" height="28" rx="3" stroke="#1F1F1F" strokeWidth="2.5" fill="none" />
      <line x1="8" y1="32" x2="44" y2="32" stroke="#1F1F1F" strokeWidth="2.5" />
      <line x1="26" y1="40" x2="26" y2="48" stroke="#1F1F1F" strokeWidth="2.5" />
      <path
        d="M18 48 Q26 44 34 48 Q42 52 50 48 L58 52 Q62 54 62 58 L62 60 Q62 62 60 62 L18 62 Q16 62 16 60 L16 50 Q16 48 18 48Z"
        stroke="#1F1F1F"
        strokeWidth="2.5"
        fill="none"
      />
      <path d="M44 30 L52 30 L52 22 M52 30 L44 22" stroke="#1F1F1F" strokeWidth="2" />
    </svg>
  </Box>
)

export function TabletHandoffModal({
  open,
  direction,
  onCancel,
  onConfirm,
}: TabletHandoffModalProps) {
  const { t } = useTranslation()
  const title = t(`purchaseReceptionWizard.handoff.${direction}.title`)
  const confirmLabel = t(`purchaseReceptionWizard.handoff.${direction}.confirm`)

  return (
    <Dialog
      open={open}
      maxWidth="xs"
      fullWidth
      slotProps={{ paper: { sx: { borderRadius: 2, textAlign: 'center' } } }}
    >
      <DialogContent sx={{ py: 4, px: 4 }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <HandoffIcon />
          <Typography
            variant="h5"
            sx={{ fontWeight: 700, mb: 3, whiteSpace: 'pre-line', lineHeight: 1.5 }}
          >
            {title}
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, width: '100%' }}>
            <Button
              variant="outlined"
              onClick={onCancel}
              sx={{ flex: 1, height: 52, fontSize: '1rem' }}
            >
              {t('purchaseReceptionWizard.common.cancel')}
            </Button>
            <Button
              variant="contained"
              onClick={onConfirm}
              sx={{ flex: 1, height: 52, fontSize: '1rem' }}
            >
              {confirmLabel}
            </Button>
          </Box>
        </Box>
      </DialogContent>
    </Dialog>
  )
}
