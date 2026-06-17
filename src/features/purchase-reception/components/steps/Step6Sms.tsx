import Box from '@mui/material/Box'
import FormControlLabel from '@mui/material/FormControlLabel'
import Radio from '@mui/material/Radio'
import RadioGroup from '@mui/material/RadioGroup'
import Typography from '@mui/material/Typography'
import { useTranslation } from 'react-i18next'
import { WizardFooter } from '../WizardFooter'
import { useReception } from '../../context/ReceptionContext'
import type { SmsCapable } from '../../types'

const SMS_OPTION_VALUES: SmsCapable[] = ['yes', 'no', 'unknown']

export function Step6Sms() {
  const { t } = useTranslation()
  const { form, updateForm, goTo } = useReception()
  const { smsCapable } = form
  const smsNotes = t('purchaseReceptionWizard.step6.notes', { returnObjects: true }) as string[]

  return (
    <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
      <Box sx={{ flex: 1, overflowY: 'auto', px: 6, py: 4 }}>
        <Typography variant="body1" sx={{ mb: 0.5 }}>
          {t('purchaseReceptionWizard.step6.description')}
        </Typography>
        <Typography variant="h4" sx={{ mb: 4 }}>
          {t('purchaseReceptionWizard.step6.title')}
        </Typography>

        <Box sx={{ maxWidth: 400, mx: 'auto' }}>
          <RadioGroup
            value={smsCapable ?? ''}
            onChange={(e) => updateForm({ smsCapable: e.target.value as SmsCapable })}
          >
            {SMS_OPTION_VALUES.map((value) => (
              <FormControlLabel
                key={value}
                value={value}
                control={<Radio />}
                label={<Typography variant="body1">{t(`purchaseReceptionWizard.step6.option.${value}`)}</Typography>}
                sx={{ mb: 0.5 }}
              />
            ))}
          </RadioGroup>

          <Box sx={{ mt: 3 }}>
            {smsNotes.map((note) => (
              <Typography key={note} variant="body2" color="text.secondary" sx={{ mb: 0.75 }}>
                {t('purchaseReceptionWizard.common.dotBullet')}{note}
              </Typography>
            ))}
          </Box>
        </Box>
      </Box>

      <WizardFooter
        onCancel={() => goTo('cancel-confirm')}
        onNext={() => goTo('handoff-to-staff')}
        nextDisabled={!smsCapable}
      />
    </Box>
  )
}
