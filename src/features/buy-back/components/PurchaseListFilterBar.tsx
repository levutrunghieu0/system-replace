import { useState } from 'react'
import { useTranslation } from 'react-i18next'

import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Chip from '@mui/material/Chip'
import IconButton from '@mui/material/IconButton'
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown'
import CalendarTodayIcon from '@mui/icons-material/CalendarToday'
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft'
import SwapVertIcon from '@mui/icons-material/SwapVert'
import TuneIcon from '@mui/icons-material/Tune'
import VisibilityIcon from '@mui/icons-material/Visibility'

export function PurchaseListFilterBar() {
  const { t } = useTranslation()
  const [filtersCollapsed, setFiltersCollapsed] = useState(false)

  const dropdownChips = [
    { key: 'status', label: t('page.purchase.list.filter.status') },
    { key: 'staff', label: t('page.purchase.list.filter.staff') },
    { key: 'date', label: t('page.purchase.list.filter.date'), isDate: true },
    { key: 's1', label: t('page.purchase.list.filter.sample') },
    { key: 's2', label: t('page.purchase.list.filter.sample') },
    { key: 's3', label: t('page.purchase.list.filter.sample') },
  ]

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, flexWrap: 'nowrap', minHeight: 36 }}>
      <Button
        variant="contained"
        size="small"
        startIcon={<TuneIcon sx={{ fontSize: '0.9rem !important' }} />}
        sx={{
          textTransform: 'none',
          fontWeight: 600,
          fontSize: '0.8rem',
          height: 32,
          whiteSpace: 'nowrap',
          flexShrink: 0,
        }}
      >
        {t('page.purchase.list.filter.condition')}
      </Button>

      {!filtersCollapsed &&
        dropdownChips.map((chip) => (
          <Chip
            key={chip.key}
            size="small"
            label={chip.label}
            variant="outlined"
            deleteIcon={
              chip.isDate ? (
                <CalendarTodayIcon sx={{ fontSize: '0.78rem !important' }} />
              ) : (
                <ArrowDropDownIcon sx={{ fontSize: '1rem !important' }} />
              )
            }
            onDelete={() => {}}
            sx={{
              fontSize: '0.78rem',
              height: 28,
              bgcolor: 'background.paper',
              flexShrink: 0,
              '& .MuiChip-deleteIcon': { color: 'text.secondary' },
            }}
          />
        ))}

      {!filtersCollapsed && (
        <Chip
          key="s4"
          size="small"
          label={t('page.purchase.list.filter.sample')}
          variant="outlined"
          sx={{ fontSize: '0.78rem', height: 28, bgcolor: 'background.paper', flexShrink: 0 }}
        />
      )}

      <IconButton
        size="small"
        aria-label={t('page.purchase.list.filter.toggle')}
        onClick={() => setFiltersCollapsed((value) => !value)}
        sx={{
          width: 28,
          height: 28,
          border: '1px solid',
          borderColor: 'divider',
          borderRadius: 1,
          flexShrink: 0,
          color: 'text.secondary',
        }}
      >
        <ChevronLeftIcon
          sx={{
            fontSize: '1rem',
            transform: filtersCollapsed ? 'rotate(180deg)' : 'none',
            transition: 'transform 0.15s',
          }}
        />
      </IconButton>

      <Box sx={{ flex: 1 }} />

      <Button
        size="small"
        startIcon={<VisibilityIcon sx={{ fontSize: '0.9rem !important' }} />}
        sx={{ textTransform: 'none', color: 'text.secondary', fontSize: '0.78rem', flexShrink: 0 }}
      >
        {t('page.purchase.list.filter.display')}
      </Button>

      <Button
        size="small"
        startIcon={<SwapVertIcon sx={{ fontSize: '0.9rem !important' }} />}
        endIcon={<ArrowDropDownIcon sx={{ fontSize: '1rem !important' }} />}
        sx={{ textTransform: 'none', color: 'text.secondary', fontSize: '0.78rem', flexShrink: 0 }}
      >
        {t('page.purchase.list.filter.sortOrder')}
      </Button>
    </Box>
  )
}
