import IconButton from '@mui/material/IconButton'
import InputAdornment from '@mui/material/InputAdornment'
import OutlinedInput from '@mui/material/OutlinedInput'
import Tooltip from '@mui/material/Tooltip'
import AddIcon from '@mui/icons-material/Add'
import RemoveIcon from '@mui/icons-material/Remove'

interface QuantityStepperProps {
  value: number
  onChange: (v: number) => void
  compact?: boolean
  /** Minimum allowed value (default 0). The "−" button is disabled when value ≤ min. */
  min?: number
  /**
   * When provided and `value === 0`, the "−" button switches to delete mode:
   * enabled, red-styled, and clicking it calls this callback instead of decrementing.
   */
  onDeleteRequest?: () => void
  /** Tooltip text shown on the "−" button when in delete mode (value=0 + onDeleteRequest). */
  deleteTooltip?: string
}

export function QuantityStepper({
  value,
  onChange,
  compact = false,
  min = 0,
  onDeleteRequest,
  deleteTooltip,
}: QuantityStepperProps) {
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value
    if (raw === '') { onChange(min); return }
    const num = parseInt(raw, 10)
    if (!isNaN(num) && num >= min) onChange(num)
  }

  const btnSize = compact ? 16 : 20
  const iconFontSize = compact ? '0.6rem' : '0.7rem'
  const inputWidth = compact ? 24 : 32

  // Delete mode: value is at minimum (0) and a delete handler is registered
  const isDeleteMode = value === 0 && min === 0 && !!onDeleteRequest
  const atMin = value <= min

  const minusBtn = (
    <IconButton
      size="small"
      disabled={atMin && !isDeleteMode}
      onClick={isDeleteMode ? onDeleteRequest : () => onChange(Math.max(min, value - 1))}
      sx={{
        width: btnSize,
        height: btnSize,
        flexShrink: 0,
        bgcolor: isDeleteMode ? 'error.main' : atMin ? 'grey.200' : 'grey.400',
        color: isDeleteMode ? 'white' : atMin ? 'grey.400' : 'white',
        '&:hover:not(:disabled)': {
          bgcolor: isDeleteMode ? 'error.dark' : 'grey.500',
        },
        '&.Mui-disabled': { bgcolor: 'grey.200', color: 'grey.400' },
      }}
    >
      <RemoveIcon sx={{ fontSize: iconFontSize }} />
    </IconButton>
  )

  return (
    <OutlinedInput
      size="small"
      value={value}
      onChange={handleInputChange}
      startAdornment={
        <InputAdornment position="start" sx={{ mr: 0.5 }}>
          {isDeleteMode && deleteTooltip ? (
            <Tooltip title={deleteTooltip} placement="top" arrow>
              {minusBtn}
            </Tooltip>
          ) : minusBtn}
        </InputAdornment>
      }
      endAdornment={
        <InputAdornment position="end" sx={{ ml: 0.5 }}>
          <IconButton
            size="small"
            onClick={() => onChange(value + 1)}
            sx={{
              width: btnSize,
              height: btnSize,
              bgcolor: 'primary.main',
              color: 'white',
              flexShrink: 0,
              '&:hover': { bgcolor: 'primary.dark' },
            }}
          >
            <AddIcon sx={{ fontSize: iconFontSize }} />
          </IconButton>
        </InputAdornment>
      }
      sx={{
        mt: compact ? 0 : 0.5,
        borderRadius: '999px',
        px: 0.5,
        '& input': {
          textAlign: 'center',
          padding: compact ? '2px 0' : '3px 0',
          width: inputWidth,
          fontWeight: !atMin ? 700 : 400,
          color: isDeleteMode
            ? 'var(--mui-palette-error-main)'
            : !atMin
              ? 'var(--mui-palette-primary-main)'
              : 'inherit',
          fontSize: compact ? '0.75rem' : '0.85rem',
          fontFamily: 'monospace',
        },
        '& .MuiOutlinedInput-notchedOutline': {
          borderRadius: '999px',
          borderColor: isDeleteMode ? 'error.main' : !atMin ? 'primary.main' : 'divider',
          transition: 'border-color 0.15s',
        },
        '&:hover .MuiOutlinedInput-notchedOutline': {
          borderColor: isDeleteMode ? 'error.main' : 'primary.main',
        },
      }}
    />
  )
}
