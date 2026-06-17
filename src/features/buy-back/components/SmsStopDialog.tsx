import Typography from '@mui/material/Typography'
import { useTranslation } from 'react-i18next'
import { AppModal } from '../../../components/common/AppModal'

interface Props {
  open: boolean
  receiptNumber: string
  onConfirm: () => void
  onClose: () => void
}

export function SmsStopDialog({ open, receiptNumber, onConfirm, onClose }: Props) {
  const { t } = useTranslation()
  return (
    <AppModal
      open={open}
      onClose={onClose}
      title={t('page.purchase.smsStop.title')}
      actions={[
        { label: t('page.purchase.smsStop.cancel'), onClick: onClose, variant: 'outlined', color: 'inherit' },
        { label: t('page.purchase.smsStop.confirm'), onClick: onConfirm, variant: 'contained', color: 'error' },
      ]}
    >
      <Typography variant="body2" color="text.secondary">
        {t('page.purchase.smsStop.message', { receiptNumber })}
      </Typography>
    </AppModal>
  )
}
