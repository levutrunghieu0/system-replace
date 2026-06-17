import { useState } from 'react'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import Button from '@mui/material/Button'
import FormLabel from '@mui/material/FormLabel'
import Select from '@mui/material/Select'
import MenuItem from '@mui/material/MenuItem'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import FilePresentIcon from '@mui/icons-material/FilePresent'
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown'
import { useTranslation } from 'react-i18next'
import type { CsvPurchaseItem } from '../types'

interface CsvFileSelectorProps {
  open: boolean
  onConfirm: (fileName: string, parsedItems: CsvPurchaseItem[], isCorrupted: boolean, badFileName?: string) => void
  onCancel: () => void
}

interface MockFileOption {
  name: string
  isCorrupted: boolean
  badFileName?: string
  items: CsvPurchaseItem[]
}

const MOCK_FILES: MockFileOption[] = [
  {
    name: 'TH_111111111111_2026.csv',
    isCorrupted: false,
    items: [
      { productCode: '1234567890123', productName: 'Nike Zoom Vomero 5', brand: 'ナイキ', category: 'メンズシューズ', details: 'メンズ / 25cm', type: 'リユース', status: '中古A', price: 13500, quantity: 1, registrationDate: '2026/01/23' },
      { productCode: '0987654321098', productName: 'Adidas Samba Classic', brand: 'アディダス', category: 'メンズシューズ', details: 'メンズ / 26cm', type: 'リユース', status: '中古B', price: 9800, quantity: 1, registrationDate: '2026/01/23' },
      { productCode: '4567890123456', productName: 'New Balance 990v6', brand: 'ニューバランス', category: 'メンズシューズ', details: 'メンズ / 27cm', type: 'リユース', status: '新品', price: 32000, quantity: 1, registrationDate: '2026/01/23' },
    ]
  },
  {
    name: 'Taiwan_Purchase_Data.txt',
    isCorrupted: false,
    items: [
      { productCode: '0546176', productName: '牛乳石鹸 赤箱 10個入', type: 'リユース', status: '新品', price: 1389, quantity: 3, registrationDate: '2026/05/26' },
      { productCode: '4939771', productName: '【不二貿易】 フラワーブランド 吊下げ式 WH▲', type: 'リユース', status: '新品', price: 1259, quantity: 3, registrationDate: '2026/05/26' },
    ]
  },
  {
    name: 'Corrupted_Item_Data.csv',
    isCorrupted: true,
    badFileName: '20241007100059_Corrupted_Item_Data.bad',
    items: []
  }
]

export function CsvFileSelector({ open, onConfirm, onCancel }: CsvFileSelectorProps) {
  const { t } = useTranslation()
  const [selectedFileIndex, setSelectedFileIndex] = useState<number | ''>('')

  const handleExecute = () => {
    if (selectedFileIndex !== '') {
      const selected = MOCK_FILES[selectedFileIndex]
      onConfirm(selected.name, selected.items, selected.isCorrupted, selected.badFileName)
    }
  }

  const rowSx = {
    display: 'flex',
    alignItems: 'center',
    px: 3,
    py: 3,
  }
  const labelSx = { minWidth: 100, fontSize: '0.875rem', fontWeight: 600, color: 'text.primary', flexShrink: 0 }

  return (
    <Dialog open={open} maxWidth="xs" fullWidth slotProps={{ paper: { sx: { borderRadius: 3 } } }}>
      <DialogTitle sx={{ fontSize: '0.975rem', fontWeight: 700, py: 2, borderBottom: '1px solid', borderColor: 'divider' }}>
        {t('page.warehouse.csvPurchase.fileSelector.title')}
      </DialogTitle>

      <DialogContent sx={{ p: 0 }}>
        <Box sx={rowSx}>
          <FormLabel sx={labelSx}>{t('page.warehouse.csvPurchase.fileSelector.label')}</FormLabel>
          <Select
            value={selectedFileIndex}
            onChange={(e) => setSelectedFileIndex(e.target.value as number | '')}
            displayEmpty
            IconComponent={KeyboardArrowDownIcon}
            size="small"
            renderValue={(selected) => {
              if (selected as any === '') {
                return <Typography sx={{ fontSize: '0.875rem', color: 'text.secondary' }}>{t('page.warehouse.csvPurchase.fileSelector.placeholder')}</Typography>
              }
              const selectedFile = MOCK_FILES[selected as number];
              return (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <FilePresentIcon fontSize="small" color="primary" />
                  <Typography sx={{ fontSize: '0.875rem', fontWeight: 500 }}>
                    {selectedFile.name}
                  </Typography>
                </Box>
              )
            }}
            sx={{ flex: 1, fontSize: '0.875rem' }}
          >
            {MOCK_FILES.map((file, index) => (
              <MenuItem key={file.name} value={index} sx={{ fontSize: '0.875rem' }}>
                <Box sx={{ display: 'flex', flexDirection: 'column', py: 0.25 }}>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>{file.name}</Typography>
                  <Typography variant="caption" color="text.secondary">
                    {file.isCorrupted
                      ? t('page.warehouse.csvPurchase.fileSelector.corruptedFile')
                      : t('page.warehouse.csvPurchase.fileSelector.normalFile', { count: file.items.length })}
                  </Typography>
                </Box>
              </MenuItem>
            ))}
          </Select>
        </Box>
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2, gap: 1.5, borderTop: '1px solid', borderColor: 'divider', bgcolor: 'grey.50' }}>
        <Button variant="outlined" color="inherit" onClick={onCancel} sx={{ textTransform: 'none', minWidth: 100, fontWeight: 600 }}>
          {t('action.cancel')}
        </Button>
        <Button
          variant="contained"
          onClick={handleExecute}
          disabled={selectedFileIndex === ''}
          sx={{ textTransform: 'none', minWidth: 100, fontWeight: 700 }}
        >
          {t('action.run')}
        </Button>
      </DialogActions>
    </Dialog>
  )
}
