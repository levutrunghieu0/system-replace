import { useState } from 'react'
import Box from '@mui/material/Box'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import { useTranslation } from 'react-i18next'
import { AppModal } from '../../../components/common/AppModal'
import { QuantityStepper } from '../../../components/QuantityStepper'

interface Props {
  open: boolean
  receiptNumber: string
  onConfirm: (quantity: number, heading: string) => void
  onClose: () => void
}

export function BranchLabelDialog({ open, receiptNumber, onConfirm, onClose }: Props) {
  const { t } = useTranslation()
  const [quantity, setQuantity] = useState(1)
  const [heading, setHeading] = useState('')

  const handleConfirm = () => {
    onConfirm(quantity, heading)
    setQuantity(1)
    setHeading('')
  }

  return (
    <AppModal
      open={open}
      onClose={onClose}
      title={t('page.purchase.branchLabel.title')}
      actions={[
        { label: t('page.purchase.branchLabel.cancel'), onClick: onClose, variant: 'outlined', color: 'inherit' },
        { label: t('page.purchase.branchLabel.confirm'), onClick: handleConfirm, variant: 'contained', color: 'primary' },
      ]}
    >
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        {t('page.purchase.branchLabel.body', { receiptNumber })}
      </Typography>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Typography variant="body2" sx={{ minWidth: 72, color: 'text.secondary' }}>
            {t('page.purchase.branchLabel.quantity')}
          </Typography>
          <QuantityStepper value={quantity} min={1} onChange={setQuantity} compact />
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Typography variant="body2" sx={{ minWidth: 72, color: 'text.secondary' }}>
            {t('page.purchase.branchLabel.heading')}
          </Typography>
          <TextField
            size="small"
            value={heading}
            onChange={(e) => setHeading(e.target.value)}
            placeholder={t('page.purchase.branchLabel.placeholder')}
            sx={{ flex: 1 }}
          />
        </Box>
      </Box>
    </AppModal>
  )
}
