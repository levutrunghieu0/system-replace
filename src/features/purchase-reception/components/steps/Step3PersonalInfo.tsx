import Box from '@mui/material/Box'
import Checkbox from '@mui/material/Checkbox'
import FormControlLabel from '@mui/material/FormControlLabel'
import TextField from '@mui/material/TextField'
import ToggleButton from '@mui/material/ToggleButton'
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup'
import Typography from '@mui/material/Typography'
import SmsIcon from '@mui/icons-material/Sms'
import { useTranslation } from 'react-i18next'
import { WizardFooter } from '../WizardFooter'
import { useReception } from '../../context/ReceptionContext'
import type { DateEra } from '../../types'

export function Step3PersonalInfo() {
  const { t } = useTranslation()
  const { form, updateForm, goTo } = useReception()
  const { birthDate, phone, noPhone } = form

  const canProceed = birthDate.year.length >= 4 && birthDate.month && birthDate.day

  const handleEraChange = (_: React.MouseEvent, value: DateEra | null) => {
    if (value) updateForm({ birthDate: { ...birthDate, era: value } })
  }

  return (
    <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
      <Box sx={{ flex: 1, overflowY: 'auto', px: 6, py: 4 }}>
        <Typography variant="h4" sx={{ mb: 5 }}>
          {t('purchaseReceptionWizard.step3.title')}
        </Typography>

        <Box sx={{ maxWidth: 480, mx: 'auto', display: 'flex', flexDirection: 'column', gap: 4 }}>
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
              <Typography variant="subtitle1">{t('purchaseReceptionWizard.step3.birthDate')}</Typography>
              <Typography variant="caption" color="error.main" sx={{ fontWeight: 700 }}>
                {t('purchaseReceptionWizard.common.required')}
              </Typography>
              <ToggleButtonGroup
                value={birthDate.era}
                exclusive
                onChange={handleEraChange}
                size="small"
                sx={{
                  ml: 'auto',
                  '& .MuiToggleButton-root': {
                    px: 2,
                    py: 0.5,
                    fontSize: '0.8125rem',
                    border: '1px solid',
                    borderColor: 'divider',
                    '&.Mui-selected': {
                      bgcolor: 'primary.main',
                      color: 'white',
                      '&:hover': { bgcolor: 'primary.dark' },
                    },
                  },
                }}
              >
                <ToggleButton value="western">{t('purchaseReceptionWizard.step3.westernEra')}</ToggleButton>
                <ToggleButton value="japanese">{t('purchaseReceptionWizard.step3.japaneseEra')}</ToggleButton>
              </ToggleButtonGroup>
            </Box>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField
                value={birthDate.year}
                onChange={(e) => updateForm({ birthDate: { ...birthDate, year: e.target.value.replace(/\D/g, '') } })}
                placeholder={birthDate.era === 'western' ? t('purchaseReceptionWizard.step3.yearWesternPlaceholder') : t('purchaseReceptionWizard.step3.yearJapanesePlaceholder')}
                slotProps={{ htmlInput: { maxLength: 4 } }}
                sx={{ width: 120 }}
              />
              <TextField
                value={birthDate.month}
                onChange={(e) => updateForm({ birthDate: { ...birthDate, month: e.target.value.replace(/\D/g, '') } })}
                placeholder={t('purchaseReceptionWizard.step3.monthPlaceholder')}
                slotProps={{ htmlInput: { maxLength: 2 } }}
                sx={{ width: 90 }}
              />
              <TextField
                value={birthDate.day}
                onChange={(e) => updateForm({ birthDate: { ...birthDate, day: e.target.value.replace(/\D/g, '') } })}
                placeholder={t('purchaseReceptionWizard.step3.dayPlaceholder')}
                slotProps={{ htmlInput: { maxLength: 2 } }}
                sx={{ width: 90 }}
              />
            </Box>
          </Box>

          <Box>
            <Typography variant="subtitle1" sx={{ mb: 1.5 }}>
              {t('purchaseReceptionWizard.step3.phone')}
            </Typography>
            <TextField
              value={phone}
              onChange={(e) => updateForm({ phone: e.target.value })}
              placeholder={t('purchaseReceptionWizard.step3.phonePlaceholder')}
              disabled={noPhone}
              fullWidth
              sx={{ maxWidth: 320 }}
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={noPhone}
                  onChange={(e) => updateForm({ noPhone: e.target.checked, phone: '' })}
                />
              }
              label={t('purchaseReceptionWizard.step3.noPhone')}
              sx={{ mt: 1, display: 'block' }}
            />
            <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1, mt: 1.5, color: 'text.secondary' }}>
              <SmsIcon sx={{ fontSize: 18, mt: 0.2 }} />
              <Typography variant="body2" sx={{ whiteSpace: 'pre-line' }}>
                {t('purchaseReceptionWizard.step3.smsGuide')}
              </Typography>
            </Box>
          </Box>
        </Box>
      </Box>

      <WizardFooter
        onCancel={() => goTo('cancel-confirm')}
        onNext={() => goTo('step4')}
        nextDisabled={!canProceed}
      />
    </Box>
  )
}
