import { useState, useEffect } from 'react'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import CircularProgress from '@mui/material/CircularProgress'
import Checkbox from '@mui/material/Checkbox'
import Divider from '@mui/material/Divider'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser'
import AssignmentIndIcon from '@mui/icons-material/AssignmentInd'
import { useTranslation } from 'react-i18next'
import type { ConsentFlowStep, ConsentVerification } from '../types'
import { buyBackApi } from '../api/buyBackApi'

interface Props {
  open: boolean
  entryId: number
  receiptNumber: string
  onComplete: () => void
  onCancel: () => void
}

const INITIAL_VERIFY: ConsentVerification = {
  systemProfile: false,
  systemBarcode: false,
  physicalId: false,
  physicalAge: false,
}

export function ConsentFormFlow({ open, entryId, receiptNumber, onComplete, onCancel }: Props) {
  const { t } = useTranslation()
  const [step, setStep] = useState<ConsentFlowStep>('confirm')
  const [verify, setVerify] = useState<ConsentVerification>(INITIAL_VERIFY)

  useEffect(() => {
    if (open) { setStep('confirm'); setVerify(INITIAL_VERIFY) }
  }, [open])

  const handleRecreate = async () => {
    setStep('processing')
    await buyBackApi.voidAndRecreateConsent(entryId)
    setVerify({ systemProfile: true, systemBarcode: true, physicalId: false, physicalAge: false })
    setStep('verify')
  }

  const physicalAllChecked = verify.physicalId && verify.physicalAge

  if (!open) return null

  // ── Step 2: Confirm ─────────────────────────────────────────────────────────
  if (step === 'confirm') {
    return (
      <Dialog open maxWidth="xs" fullWidth slotProps={{ paper: { sx: { borderRadius: 3, p: 0.5 } } }}>
        <DialogTitle sx={{ fontWeight: 700, fontSize: '1rem' }}>
          {t('page.purchase.consentFlow.confirm.title')}
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary">
            {t('page.purchase.consentFlow.confirm.message', { receiptNumber })}
          </Typography>
          <Typography variant="caption" color="warning.main" sx={{ display: 'block', mt: 1 }}>
            {t('page.purchase.consentFlow.confirm.note')}
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2, gap: 1 }}>
          <Button variant="outlined" color="inherit" onClick={onCancel} sx={{ textTransform: 'none' }}>
            {t('page.purchase.consentFlow.confirm.cancel')}
          </Button>
          <Button variant="contained" color="primary" onClick={handleRecreate} sx={{ textTransform: 'none', fontWeight: 700 }}>
            {t('page.purchase.consentFlow.confirm.confirm')}
          </Button>
        </DialogActions>
      </Dialog>
    )
  }

  // ── Step 3: Processing ───────────────────────────────────────────────────────
  if (step === 'processing') {
    return (
      <Dialog open maxWidth="xs" fullWidth slotProps={{ paper: { sx: { borderRadius: 3 } } }}>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2.5, py: 4 }}>
            <CircularProgress size={52} thickness={4} />
            <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
              {t('page.purchase.consentFlow.processing.message')}
            </Typography>
          </Box>
        </DialogContent>
      </Dialog>
    )
  }

  // ── Step 4: Verification ─────────────────────────────────────────────────────
  if (step === 'verify') {
    return (
      <Dialog open maxWidth="sm" fullWidth slotProps={{ paper: { sx: { borderRadius: 3 } } }}>
        <DialogTitle sx={{ fontWeight: 700, fontSize: '1rem', pb: 1 }}>
          {t('page.purchase.consentFlow.verify.title')}
        </DialogTitle>
        <DialogContent sx={{ pt: '8px !important' }}>
          {/* Blue: System validation */}
          <Box sx={{ border: '1px solid', borderColor: 'primary.light', borderRadius: 2, overflow: 'hidden', mb: 2 }}>
            <Box sx={{ bgcolor: 'primary.light', px: 2, py: 0.75, display: 'flex', alignItems: 'center', gap: 1 }}>
              <VerifiedUserIcon sx={{ fontSize: '1rem', color: 'primary.main' }} />
              <Typography variant="caption" sx={{ fontWeight: 700, color: 'primary.main' }}>
                {t('page.purchase.consentFlow.verify.systemSection')}
              </Typography>
            </Box>
            <Box sx={{ px: 2, py: 1, display: 'flex', flexDirection: 'column', gap: 0.5 }}>
              {[
                t('page.purchase.consentFlow.verify.systemProfile'),
                t('page.purchase.consentFlow.verify.systemBarcode'),
              ].map((label) => (
                <Box key={label} sx={{ display: 'flex', alignItems: 'center', gap: 1, py: 0.5 }}>
                  <CheckCircleIcon sx={{ fontSize: '1.1rem', color: 'primary.main' }} />
                  <Typography variant="body2">{label}</Typography>
                </Box>
              ))}
            </Box>
          </Box>

          {/* Orange: Physical verification */}
          <Box sx={{ border: '1px solid', borderColor: '#FF9500', borderRadius: 2, overflow: 'hidden' }}>
            <Box sx={{ bgcolor: '#FFF3E0', px: 2, py: 0.75, display: 'flex', alignItems: 'center', gap: 1 }}>
              <AssignmentIndIcon sx={{ fontSize: '1rem', color: '#E65100' }} />
              <Typography variant="caption" sx={{ fontWeight: 700, color: '#E65100' }}>
                {t('page.purchase.consentFlow.verify.physicalSection')}
              </Typography>
            </Box>
            <Box sx={{ px: 1, py: 0.5 }}>
              {([
                { key: 'physicalId' as const, label: t('page.purchase.consentFlow.verify.physicalId') },
                { key: 'physicalAge' as const, label: t('page.purchase.consentFlow.verify.physicalAge') },
              ]).map(({ key, label }) => (
                <Box
                  key={key}
                  sx={{ display: 'flex', alignItems: 'center', gap: 0.5, px: 1, py: 0.5, borderRadius: 1, cursor: 'pointer', '&:hover': { bgcolor: 'action.hover' } }}
                  onClick={() => setVerify((v) => ({ ...v, [key]: !v[key] }))}
                >
                  <Checkbox
                    checked={verify[key]}
                    onChange={(e) => setVerify((v) => ({ ...v, [key]: e.target.checked }))}
                    onClick={(e) => e.stopPropagation()}
                    sx={{ color: '#FF9500', '&.Mui-checked': { color: '#FF9500' }, p: 0.5 }}
                    size="small"
                  />
                  <Typography variant="body2">{label}</Typography>
                </Box>
              ))}
            </Box>
          </Box>

          <Divider sx={{ my: 2 }} />
          <Typography variant="caption" color="text.secondary">
            {t('page.purchase.consentFlow.verify.hint')}
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2, gap: 1 }}>
          <Button
            variant="contained"
            color="primary"
            disabled={!physicalAllChecked}
            onClick={onComplete}
            sx={{ textTransform: 'none', fontWeight: 700, minWidth: 100 }}
          >
            {t('page.purchase.consentFlow.verify.submit')}
          </Button>
        </DialogActions>
      </Dialog>
    )
  }

  return null
}
