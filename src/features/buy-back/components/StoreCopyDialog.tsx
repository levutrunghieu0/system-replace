import { useState } from 'react'
import Alert from '@mui/material/Alert'
import Box from '@mui/material/Box'
import Chip from '@mui/material/Chip'
import FormControlLabel from '@mui/material/FormControlLabel'
import Radio from '@mui/material/Radio'
import RadioGroup from '@mui/material/RadioGroup'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import { useTranslation } from 'react-i18next'
import { AppModal } from '../../../components/common/AppModal'
import { QuantityStepper } from '../../../components/QuantityStepper'
import type { StoreCopyReissuePayload, StoreCopyReissueReason } from '../types'

const REISSUE_REASONS: StoreCopyReissueReason[] = [
  'damaged',
  'lost',
  'printerError',
  'other',
]

interface Props {
  open: boolean
  receiptNumber: string
  /** Number of times the store copy has already been reissued. */
  reissueCount: number
  onConfirm: (payload: StoreCopyReissuePayload) => void
  onClose: () => void
}

export function StoreCopyDialog({
  open,
  receiptNumber,
  reissueCount,
  onConfirm,
  onClose,
}: Props) {
  const { t } = useTranslation()
  const [quantity, setQuantity] = useState(1)
  const [reason, setReason] = useState<StoreCopyReissueReason | ''>('')
  const [note, setNote] = useState('')
  const [errors, setErrors] = useState<{ reason?: string; note?: string }>({})

  const nextReissueNumber = reissueCount + 1

  const resetState = () => {
    setQuantity(1)
    setReason('')
    setNote('')
    setErrors({})
  }

  const handleClose = () => {
    resetState()
    onClose()
  }

  const handleConfirm = () => {
    // E-41: the reissue reason is mandatory; "other" additionally requires a note.
    const nextErrors: { reason?: string; note?: string } = {}
    if (!reason) {
      nextErrors.reason = t('page.purchase.storeCopy.validation.reasonRequired')
    }
    if (reason === 'other' && !note.trim()) {
      nextErrors.note = t('page.purchase.storeCopy.validation.noteRequired')
    }
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length > 0 || !reason) return

    onConfirm({
      reason,
      note: note.trim() || undefined,
      quantity,
    })
    resetState()
  }

  return (
    <AppModal
      open={open}
      onClose={handleClose}
      title={t('page.purchase.storeCopy.title')}
      actions={[
        {
          label: t('page.purchase.storeCopy.cancel'),
          onClick: handleClose,
          variant: 'outlined',
          color: 'inherit',
        },
        {
          label: t('page.purchase.storeCopy.confirm'),
          onClick: handleConfirm,
          variant: 'contained',
          color: 'primary',
        },
      ]}
    >
      {/* Body text */}
      <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
        {t('page.purchase.storeCopy.body', { receiptNumber })}
      </Typography>

      {/* E-41 Rule 2: same receipt number, printed with a reissue mark */}
      <Alert
        severity="info"
        icon={false}
        sx={{ mb: 2, py: 0.5, alignItems: 'center' }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
          <Chip
            size="small"
            color="warning"
            label={t('page.purchase.storeCopy.reissueMark')}
            sx={{ fontWeight: 700 }}
          />
          <Typography variant="caption">
            {t('page.purchase.storeCopy.reissueNotice', {
              count: nextReissueNumber,
            })}
          </Typography>
        </Box>
      </Alert>

      {/* Reissue reason (mandatory) */}
      <Box sx={{ mb: 2 }}>
        <Typography variant="body2" sx={{ fontWeight: 700, mb: 0.5 }}>
          {t('page.purchase.storeCopy.reason')}
          <Typography
            component="span"
            variant="caption"
            color="error.main"
            sx={{ ml: 0.5 }}
          >
            {t('page.purchase.storeCopy.reasonRequiredMark')}
          </Typography>
        </Typography>

        <RadioGroup
          value={reason}
          onChange={(e) => {
            setReason(e.target.value as StoreCopyReissueReason)
            setErrors((prev) => ({ ...prev, reason: undefined }))
          }}
        >
          {REISSUE_REASONS.map((value) => (
            <FormControlLabel
              key={value}
              value={value}
              control={<Radio size="small" sx={{ py: 0.5 }} />}
              label={
                <Typography variant="body2">
                  {t(`page.purchase.storeCopy.reasons.${value}`)}
                </Typography>
              }
            />
          ))}
        </RadioGroup>
        {errors.reason && (
          <Typography variant="caption" color="error.main">
            {errors.reason}
          </Typography>
        )}
      </Box>

      {/* Note: required when reason is "other" */}
      <Box sx={{ mb: 2.5 }}>
        <TextField
          fullWidth
          size="small"
          multiline
          minRows={2}
          value={note}
          onChange={(e) => {
            setNote(e.target.value)
            setErrors((prev) => ({ ...prev, note: undefined }))
          }}
          label={
            reason === 'other'
              ? t('page.purchase.storeCopy.noteRequiredLabel')
              : t('page.purchase.storeCopy.noteLabel')
          }
          placeholder={t('page.purchase.storeCopy.notePlaceholder')}
          error={Boolean(errors.note)}
          helperText={errors.note}
        />
      </Box>

      {/* 枚数指定 */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <Typography variant="body2" sx={{ fontWeight: 500 }}>
          {t('page.purchase.storeCopy.quantity')}
        </Typography>
        <QuantityStepper value={quantity} min={1} onChange={setQuantity} compact />
      </Box>
    </AppModal>
  )
}
