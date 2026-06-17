import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import { useTranslation } from 'react-i18next'
import { WizardFooter } from '../WizardFooter'
import { useReception } from '../../context/ReceptionContext'

export function Step1Terms() {
  const { t } = useTranslation()
  const { goTo } = useReception()
  const termsItems = t('purchaseReceptionWizard.step1.termsItems', { returnObjects: true }) as string[]
  const termsNotes = t('purchaseReceptionWizard.step1.termsNotes', { returnObjects: true }) as string[]
  const inspectionTerms = t('purchaseReceptionWizard.step1.inspectionTerms', { returnObjects: true }) as string[]

  return (
    <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
      <Box
        sx={{
          flex: 1,
          overflowY: 'auto',
          px: 6,
          py: 4,
        }}
      >
        <Typography variant="h4" sx={{ mb: 4 }}>
          {t('purchaseReceptionWizard.step1.title')}
        </Typography>

        <Box sx={{ maxWidth: 760, mx: 'auto' }}>
          {termsItems.map((item) => (
            <Typography key={item} sx={{ mb: 1.5, fontSize: '0.9375rem', lineHeight: 1.6 }}>
              {t('purchaseReceptionWizard.common.squareBullet')} {item}
            </Typography>
          ))}

          {termsNotes.map((note) => (
            <Typography
              key={note}
              variant="body2"
              color="text.secondary"
              sx={{ mb: 1, ml: 2, fontSize: '0.8125rem' }}
            >
              {t('purchaseReceptionWizard.common.notePrefix')}{note}
            </Typography>
          ))}

          <Typography sx={{ mt: 2, mb: 1.5, fontSize: '0.9375rem', lineHeight: 1.6 }}>
            {t('purchaseReceptionWizard.common.squareBullet')} {t('purchaseReceptionWizard.step1.inspectionConsent')}
          </Typography>
          {inspectionTerms.map((term) => (
            <Typography key={term} variant="body2" sx={{ ml: 3, mb: 0.5, fontSize: '0.875rem' }}>
              {t('purchaseReceptionWizard.common.dotBullet')}{term}
            </Typography>
          ))}
        </Box>
      </Box>

      <WizardFooter
        onCancel={() => goTo('cancel-confirm')}
        onNext={() => goTo('step2')}
      />
    </Box>
  )
}
