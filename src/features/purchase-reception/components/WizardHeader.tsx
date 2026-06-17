import Box from '@mui/material/Box'
import IconButton from '@mui/material/IconButton'
import Typography from '@mui/material/Typography'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import ArrowForwardIcon from '@mui/icons-material/ArrowForward'
import CloseIcon from '@mui/icons-material/Close'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import { useTranslation } from 'react-i18next'
import { STEP_COUNT } from '../types'

interface WizardHeaderProps {
  title: string
  currentStep: number | null
  onBack?: () => void
  onForward?: () => void
  onClose?: () => void
  showNavArrows?: boolean
  stepCount?: number
  iconLabel?: string
}

function StepDot({ stepIndex, currentStep }: { stepIndex: number; currentStep: number | null }) {
  const isCompleted = currentStep !== null && stepIndex < currentStep
  const isActive = currentStep === stepIndex

  return (
    <Box
      sx={{
        width: 24,
        height: 24,
        borderRadius: '50%',
        border: '2px solid',
        borderColor: isCompleted || isActive ? 'white' : 'rgba(255,255,255,0.5)',
        bgcolor: isCompleted || isActive ? 'white' : 'transparent',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
      }}
    >
      {isCompleted && <CheckCircleIcon sx={{ fontSize: 20, color: 'primary.main' }} />}
      {isActive && <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: 'primary.main' }} />}
    </Box>
  )
}

export function WizardHeader({
  title,
  currentStep,
  onBack,
  onForward,
  onClose,
  showNavArrows = true,
  stepCount = STEP_COUNT,
  iconLabel,
}: WizardHeaderProps) {
  const { t } = useTranslation()
  const resolvedIconLabel = iconLabel ?? t('purchaseReceptionWizard.header.iconLabel')

  return (
    <Box
      sx={{
        bgcolor: 'primary.main',
        color: 'white',
        px: 2,
        height: 56,
        display: 'flex',
        alignItems: 'center',
        gap: 1,
        flexShrink: 0,
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, minWidth: 120 }}>
        <Box
          sx={{
            width: 32,
            height: 32,
            bgcolor: 'rgba(255,255,255,0.2)',
            borderRadius: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Typography sx={{ fontSize: 11, fontWeight: 700, lineHeight: 1, textAlign: 'center' }}>
            {resolvedIconLabel}
          </Typography>
        </Box>
        <Typography variant="h5" sx={{ color: 'white', fontWeight: 700, fontSize: '1rem' }}>
          {title}
        </Typography>
      </Box>

      {currentStep !== null && (
        <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0 }}>
          {Array.from({ length: stepCount }, (_, i) => (
            <Box key={i} sx={{ display: 'flex', alignItems: 'center' }}>
              <StepDot stepIndex={i + 1} currentStep={currentStep} />
              {i < stepCount - 1 && <Box sx={{ width: 48, height: 2, bgcolor: 'rgba(255,255,255,0.4)' }} />}
            </Box>
          ))}
        </Box>
      )}

      {showNavArrows && (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <IconButton
            onClick={onBack}
            disabled={!onBack}
            aria-label={t('purchaseReceptionWizard.header.back')}
            sx={{ color: 'white', '&.Mui-disabled': { color: 'rgba(255,255,255,0.3)' } }}
          >
            <ArrowBackIcon />
          </IconButton>
          <IconButton
            onClick={onForward}
            disabled={!onForward}
            aria-label={t('purchaseReceptionWizard.header.forward')}
            sx={{ color: 'white', '&.Mui-disabled': { color: 'rgba(255,255,255,0.3)' } }}
          >
            <ArrowForwardIcon />
          </IconButton>
          {onClose && (
            <IconButton onClick={onClose} aria-label={t('purchaseReceptionWizard.header.close')} sx={{ color: 'white' }}>
              <CloseIcon />
            </IconButton>
          )}
        </Box>
      )}
    </Box>
  )
}
