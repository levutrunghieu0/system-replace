import { useTranslation } from 'react-i18next'

import Button from '@mui/material/Button'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogContentText from '@mui/material/DialogContentText'
import DialogTitle from '@mui/material/DialogTitle'
import Typography from '@mui/material/Typography'

interface PurchaseCancelDialogProps {
  open: boolean
  receiptNumber: string
  onConfirm: () => void
  onClose: () => void
}

export function PurchaseCancelDialog({ open, receiptNumber, onConfirm, onClose }: PurchaseCancelDialogProps) {
  const { t } = useTranslation()

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth slotProps={{ paper: { sx: { borderRadius: 2 } } }}>
      <DialogTitle sx={{ fontWeight: 700 }}>{t('page.purchase.cancelReceptionDialog.title')}</DialogTitle>

      <DialogContent>
        <DialogContentText component="div">
          <Typography variant="body2" color="text.primary">
            {t('page.purchase.cancelReceptionDialog.message')}
          </Typography>
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
            {t('page.purchase.cancelReceptionDialog.receiptNumber', { receiptNumber })}
          </Typography>
        </DialogContentText>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button color="inherit" onClick={onClose}>
          {t('common.cancel')}
        </Button>
        <Button variant="contained" color="error" onClick={onConfirm}>
          {t('common.yes')}
        </Button>
      </DialogActions>
    </Dialog>
  )
}
