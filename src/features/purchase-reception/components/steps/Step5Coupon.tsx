import Box from '@mui/material/Box'
import Checkbox from '@mui/material/Checkbox'
import FormControlLabel from '@mui/material/FormControlLabel'
import Typography from '@mui/material/Typography'
import { useTranslation } from 'react-i18next'
import { WizardFooter } from '../WizardFooter'
import { useReception } from '../../context/ReceptionContext'
import { COUPON_OPTIONS } from '../../types'

const COUPON_LABEL_KEYS: Record<string, string> = {
  ない: 'none',
  アプリ: 'app',
  チラシ: 'flyer',
  LINE: 'line',
  その他: 'other',
}

export function Step5Coupon() {
  const { t } = useTranslation()
  const { form, updateForm, goTo } = useReception()
  const { coupons } = form

  const getCouponLabel = (coupon: string) => {
    const key = COUPON_LABEL_KEYS[coupon]
    return key ? t(`purchaseReceptionWizard.coupon.${key}`) : coupon
  }

  const handleChange = (value: string, checked: boolean) => {
    if (value === 'ない') {
      updateForm({ coupons: checked ? ['ない'] : [] })
      return
    }
    let next: string[]
    if (checked) {
      next = [...coupons.filter((c) => c !== 'ない'), value]
    } else {
      next = coupons.filter((c) => c !== value)
      if (next.length === 0) next = ['ない']
    }
    updateForm({ coupons: next })
  }

  return (
    <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
      <Box sx={{ flex: 1, overflowY: 'auto', px: 6, py: 4 }}>
        <Typography variant="h4" sx={{ mb: 4 }}>
          {t('purchaseReceptionWizard.step5.title')}
        </Typography>

        <Box sx={{ maxWidth: 360, mx: 'auto', display: 'flex', flexDirection: 'column', gap: 0.5 }}>
          {COUPON_OPTIONS.map((coupon) => (
            <FormControlLabel
              key={coupon}
              control={
                <Checkbox
                  checked={coupons.includes(coupon)}
                  onChange={(e) => handleChange(coupon, e.target.checked)}
                  sx={{ py: 0.75 }}
                />
              }
              label={<Typography variant="body1" sx={{ fontWeight: coupon === 'ない' ? 700 : 400 }}>{getCouponLabel(coupon)}</Typography>}
            />
          ))}
        </Box>
      </Box>

      <WizardFooter
        onCancel={() => goTo('cancel-confirm')}
        onNext={() => goTo('step6')}
      />
    </Box>
  )
}
