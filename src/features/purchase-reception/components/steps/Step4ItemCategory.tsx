import Box from '@mui/material/Box'
import Checkbox from '@mui/material/Checkbox'
import FormControlLabel from '@mui/material/FormControlLabel'
import Typography from '@mui/material/Typography'
import { useTranslation } from 'react-i18next'
import { WizardFooter } from '../WizardFooter'
import { useReception } from '../../context/ReceptionContext'
import { ITEM_CATEGORIES } from '../../types'

const ITEM_CATEGORY_LABEL_KEYS: Record<string, string> = {
  ない: 'none',
  携帯電話: 'mobilePhone',
  タブレット: 'tablet',
  Apple製品: 'appleProduct',
  スマートウォッチ: 'smartWatch',
  パソコン: 'computer',
  AirPods: 'airPods',
  自転車: 'bicycle',
}

export function Step4ItemCategory() {
  const { t } = useTranslation()
  const { form, updateForm, goTo } = useReception()
  const { itemCategories } = form

  const getCategoryLabel = (category: string) => {
    const key = ITEM_CATEGORY_LABEL_KEYS[category]
    return key ? t(`purchaseReceptionWizard.itemCategory.${key}`) : category
  }

  const handleChange = (value: string, checked: boolean) => {
    if (value === 'ない') {
      updateForm({ itemCategories: checked ? ['ない'] : [] })
      return
    }
    let next: string[]
    if (checked) {
      next = [...itemCategories.filter((c) => c !== 'ない'), value]
    } else {
      next = itemCategories.filter((c) => c !== value)
      if (next.length === 0) next = ['ない']
    }
    updateForm({ itemCategories: next })
  }

  return (
    <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
      <Box sx={{ flex: 1, overflowY: 'auto', px: 6, py: 4 }}>
        <Typography variant="h4" sx={{ mb: 1 }}>
          {t('purchaseReceptionWizard.step4.title')}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
          {t('purchaseReceptionWizard.step4.storeNote')}
        </Typography>

        <Box sx={{ maxWidth: 400, mx: 'auto', display: 'flex', flexDirection: 'column', gap: 0.5 }}>
          {ITEM_CATEGORIES.map((category) => (
            <FormControlLabel
              key={category}
              control={
                <Checkbox
                  checked={itemCategories.includes(category)}
                  onChange={(e) => handleChange(category, e.target.checked)}
                  sx={{ py: 0.75 }}
                />
              }
              label={<Typography variant="body1" sx={{ fontWeight: category === 'ない' ? 700 : 400 }}>{getCategoryLabel(category)}</Typography>}
            />
          ))}
        </Box>

        <Box sx={{ maxWidth: 400, mx: 'auto', mt: 3 }}>
          <Typography variant="body2" color="text.secondary">
            {t('purchaseReceptionWizard.step4.smoothAssessmentNote')}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {t('purchaseReceptionWizard.step4.extraCheckNote')}
          </Typography>
        </Box>
      </Box>

      <WizardFooter
        onCancel={() => goTo('cancel-confirm')}
        onNext={() => goTo('step5')}
      />
    </Box>
  )
}
