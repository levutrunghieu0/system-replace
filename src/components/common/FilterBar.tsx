import { useRef, useState } from 'react'
import type { ReactNode } from 'react'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import IconButton from '@mui/material/IconButton'
import Typography from '@mui/material/Typography'
import TuneIcon from '@mui/icons-material/Tune'
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown'
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight'

export interface FilterChipDef {
  key: string
  label: string
  /** Active filter value shown inside the chip (e.g. "2026年1月") */
  value?: string
  /** Whether the chip is in an active/selected state */
  active?: boolean
  /** Popover/menu content rendered below the chip when open */
  popoverContent?: (close: () => void) => ReactNode
  onClick?: () => void
}

interface FilterBarProps {
  filters: FilterChipDef[]
  /** Called when the 条件検索 label pill is clicked */
  onSearchClick?: () => void
}

function FilterChip({ def }: { def: FilterChipDef }) {
  const [open, setOpen] = useState(false)
  const anchorRef = useRef<HTMLButtonElement>(null)

  const handleClick = () => {
    if (def.popoverContent) {
      setOpen((p) => !p)
    } else {
      def.onClick?.()
    }
  }

  const close = () => setOpen(false)

  return (
    <Box sx={{ position: 'relative', flexShrink: 0 }}>
      <Button
        ref={anchorRef}
        size="small"
        variant={def.active ? 'contained' : 'outlined'}
        endIcon={def.popoverContent ? <KeyboardArrowDownIcon sx={{ fontSize: '0.8rem !important', transition: 'transform 0.15s', transform: open ? 'rotate(180deg)' : 'none' }} /> : undefined}
        onClick={handleClick}
        sx={{
          fontSize: '0.72rem',
          height: 26,
          borderRadius: '999px',
          px: 1.25,
          py: 0,
          minWidth: 0,
          whiteSpace: 'nowrap',
          textTransform: 'none',
          fontWeight: def.active ? 600 : 400,
          borderColor: def.active ? 'primary.main' : 'divider',
          color: def.active ? 'white' : 'text.secondary',
          bgcolor: def.active ? 'primary.main' : 'transparent',
          '& .MuiButton-endIcon': { ml: 0.25 },
          '&:hover': {
            borderColor: 'primary.main',
            color: def.active ? 'white' : 'primary.main',
            bgcolor: def.active ? 'primary.dark' : 'primary.50',
          },
        }}
      >
        {def.value ? `${def.label}：${def.value}` : def.label}
      </Button>

      {/* Inline popover panel */}
      {open && def.popoverContent && (
        <>
          {/* Click-away backdrop */}
          <Box
            onClick={close}
            sx={{ position: 'fixed', inset: 0, zIndex: 1200 }}
          />
          <Box
            sx={{
              position: 'absolute',
              top: '100%',
              left: 0,
              mt: 0.5,
              zIndex: 1201,
              bgcolor: 'background.paper',
              border: '1px solid',
              borderColor: 'divider',
              borderRadius: 1,
              boxShadow: 3,
              minWidth: 160,
            }}
          >
            {def.popoverContent(close)}
          </Box>
        </>
      )}
    </Box>
  )
}

export function FilterBar({ filters, onSearchClick }: FilterBarProps) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const [canScrollRight, setCanScrollRight] = useState(true)

  const handleScroll = () => {
    const el = scrollRef.current
    if (!el) return
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 4)
  }

  const scrollRight = () => {
    scrollRef.current?.scrollBy({ left: 160, behavior: 'smooth' })
  }

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', bgcolor: 'background.paper' }}>
      {/* 条件検索 pill */}
      <Box
        onClick={onSearchClick}
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 0.5,
          flexShrink: 0,
          cursor: onSearchClick ? 'pointer' : 'default',
          color: 'primary.main',
          bgcolor: 'primary.50',
          border: '1px solid',
          borderColor: 'primary.200',
          borderRadius: '999px',
          px: 1.25,
          py: 0.25,
          mx: 1,
          my: 0.75,
          '&:hover': onSearchClick ? { bgcolor: 'primary.100' } : {},
        }}
      >
        <TuneIcon sx={{ fontSize: '0.8rem' }} />
        <Typography sx={{ fontSize: '0.73rem', fontWeight: 700, whiteSpace: 'nowrap', lineHeight: 1.5 }}>
          条件検索
        </Typography>
      </Box>

      {/* Scrollable chip row */}
      <Box
        ref={scrollRef}
        onScroll={handleScroll}
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 0.75,
          flex: 1,
          overflowX: 'auto',
          py: 0.75,
          pr: 0.5,
          '&::-webkit-scrollbar': { height: 0 },
        }}
      >
        {filters.map((f) => (
          <FilterChip key={f.key} def={f} />
        ))}
      </Box>

      {/* Scroll-right affordance */}
      {canScrollRight && filters.length > 4 && (
        <IconButton
          size="small"
          onClick={scrollRight}
          sx={{ flexShrink: 0, mx: 0.5, color: 'text.secondary', '&:hover': { color: 'primary.main' } }}
        >
          <KeyboardArrowRightIcon fontSize="small" />
        </IconButton>
      )}
    </Box>
  )
}
