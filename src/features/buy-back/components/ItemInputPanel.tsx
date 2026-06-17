import { useState, useMemo } from 'react'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import TextField from '@mui/material/TextField'
import InputAdornment from '@mui/material/InputAdornment'
import Select from '@mui/material/Select'
import MenuItem from '@mui/material/MenuItem'
import FormControl from '@mui/material/FormControl'
import InputLabel from '@mui/material/InputLabel'
import Button from '@mui/material/Button'
import Chip from '@mui/material/Chip'
import AddIcon from '@mui/icons-material/Add'
import { useTranslation } from 'react-i18next'
import type { PurchaseLineItem, ItemCondition } from '../types'

const CONDITION_KEYS: { value: ItemCondition; tKey: string }[] = [
  { value: '新品',  tKey: 'page.purchase.detail.itemInput.conditions.new' },
  { value: '未使用', tKey: 'page.purchase.detail.itemInput.conditions.unused' },
  { value: '中古A', tKey: 'page.purchase.detail.itemInput.conditions.usedA' },
  { value: '中古B', tKey: 'page.purchase.detail.itemInput.conditions.usedB' },
  { value: '中古C', tKey: 'page.purchase.detail.itemInput.conditions.usedC' },
]
const SIZE_KEYS = ['xs','s','m','l','xl','xxl','free'] as const
type SizeKey = typeof SIZE_KEYS[number]

interface Props {
  category: string
  onAdd: (item: PurchaseLineItem) => void
}

function computeAppraisal(brand: string, condition: ItemCondition, size: string): number {
  if (!brand || !condition || !size) return 0
  return Math.max(
    0,
    brand.length * 1000 + condition.indexOf(condition) * -500 + 12000,
  );
}

export function ItemInputPanel({ category, onAdd }: Props) {
  const { t } = useTranslation()
  const [brand, setBrand] = useState('')
  const [model, setModel] = useState('')
  const [size, setSize] = useState('')
  const [condition, setCondition] = useState<ItemCondition | ''>('')
  const [purchasePriceInput, setPurchasePriceInput] = useState('')

  const appraisalValue = useMemo(
    () => computeAppraisal(brand, condition as ItemCondition, size),
    [brand, condition, size],
  )

  const isManualOverride = purchasePriceInput !== '' && Number(purchasePriceInput) !== appraisalValue
  const canAdd = brand.trim() !== '' && model.trim() !== '' && size !== '' && condition !== '' && purchasePriceInput !== ''

  const handleAdd = () => {
    if (!canAdd) return
    onAdd({
      id: crypto.randomUUID(),
      brand,
      model,
      size,
      condition: condition as ItemCondition,
      appraisalValue,
      purchasePrice: Number(purchasePriceInput),
      manualOverride: isManualOverride,
    })
    setBrand(''); setModel(''); setSize(''); setCondition(''); setPurchasePriceInput('')
  }

  return (
    <Box sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2, overflow: 'hidden' }}>
      <Box sx={{ bgcolor: 'grey.50', borderBottom: '1px solid', borderColor: 'divider', px: 2, py: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
        <Typography variant="body2" sx={{ fontWeight: 700 }}>{t('page.purchase.detail.itemInput.title')}</Typography>
        <Chip label={category} size="small" sx={{ bgcolor: 'primary.light', color: 'primary.main', fontWeight: 600, fontSize: '0.7rem', height: 20 }} />
      </Box>
      <Box sx={{ p: 2, display: 'flex', flexDirection: 'column', gap: 1.5 }}>
        <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1.5 }}>
          <TextField label={t('page.purchase.detail.itemInput.brand')} size="small" value={brand} onChange={(e) => setBrand(e.target.value)} required />
          <FormControl size="small" required>
            <InputLabel sx={{ fontSize: '0.85rem' }}>{t('page.purchase.detail.itemInput.size')}</InputLabel>
            <Select label={t('page.purchase.detail.itemInput.size')} value={size} onChange={(e) => setSize(e.target.value)}>
              {SIZE_KEYS.map((k: SizeKey) => (
                <MenuItem key={k} value={k} sx={{ fontSize: '0.85rem' }}>
                  {t(`page.purchase.detail.itemInput.sizes.${k}` as Parameters<typeof t>[0])}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>
        <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1.5 }}>
          <TextField label={t('page.purchase.detail.itemInput.model')} size="small" value={model} onChange={(e) => setModel(e.target.value)} required />
          <FormControl size="small" required>
            <InputLabel sx={{ fontSize: '0.85rem' }}>{t('page.purchase.detail.itemInput.condition')}</InputLabel>
            <Select label={t('page.purchase.detail.itemInput.condition')} value={condition} onChange={(e) => setCondition(e.target.value as ItemCondition)}>
              {CONDITION_KEYS.map(({ value, tKey }) => (
                <MenuItem key={value} value={value} sx={{ fontSize: '0.85rem' }}>
                  {t(tKey as Parameters<typeof t>[0])}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>
        <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1.5, bgcolor: appraisalValue > 0 ? 'grey.50' : 'transparent', borderRadius: 1, p: appraisalValue > 0 ? 1.5 : 0, border: appraisalValue > 0 ? '1px solid' : 'none', borderColor: 'divider' }}>
          <Box>
            <Typography variant="caption" color="text.secondary" sx={{ mb: 0.5, display: 'block' }}>
              {t('page.purchase.detail.itemInput.appraisalValue')}
            </Typography>
            <Typography variant="body1" sx={{ fontWeight: 700, color: appraisalValue > 0 ? 'text.primary' : 'text.disabled' }}>
              {appraisalValue > 0 ? `¥${appraisalValue.toLocaleString()}` : '¥ —'}
            </Typography>
          </Box>
          <Box>
            <Typography variant="caption" color="text.secondary" sx={{ mb: 0.5, display: 'block' }}>
              {t('page.purchase.detail.itemInput.purchasePrice')}
            </Typography>
            <TextField
              size="small" value={purchasePriceInput}
              onChange={(e) => setPurchasePriceInput(e.target.value.replace(/[^0-9]/g, ''))}
              slotProps={{ input: { startAdornment: <InputAdornment position="start">¥</InputAdornment> }, htmlInput: { style: { textAlign: 'right', fontWeight: 700 } } }}
              sx={{ '& .MuiOutlinedInput-root': isManualOverride ? { '& fieldset': { borderColor: 'warning.main', borderWidth: 2 }, '&:hover fieldset': { borderColor: 'warning.dark' }, bgcolor: '#fffde7' } : {} }}
              fullWidth required
            />
            {isManualOverride && (
              <Typography variant="caption" color="warning.main" sx={{ mt: 0.25, display: 'block' }}>
                {t('page.purchase.detail.itemInput.manualOverride')}
              </Typography>
            )}
          </Box>
        </Box>
        <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
          <Button variant="contained" color="primary" size="small" startIcon={<AddIcon />} disabled={!canAdd} onClick={handleAdd} sx={{ textTransform: 'none', fontWeight: 700 }}>
            {t('page.purchase.detail.itemInput.addButton')}
          </Button>
        </Box>
      </Box>
    </Box>
  )
}
