import { useCallback, useEffect, useState } from 'react'
import InputAdornment from '@mui/material/InputAdornment'
import TextField from '@mui/material/TextField'
import SearchIcon from '@mui/icons-material/Search'
import { useDebouncedValue } from './hooks/useDebouncedValue'

interface AppTableGlobalFilterProps {
  value: string
  onChange: (value: string) => void
  debounceMs?: number
}

export function AppTableGlobalFilter({ value, onChange, debounceMs = 300 }: AppTableGlobalFilterProps) {
  const [localValue, setLocalValue] = useState(value)
  const debounced = useDebouncedValue(localValue, debounceMs)

  const stableOnChange = useCallback(onChange, [onChange])

  useEffect(() => {
    stableOnChange(debounced)
  }, [debounced, stableOnChange])

  useEffect(() => {
    setLocalValue(value)
  }, [value])

  return (
    <TextField
      size="small"
      placeholder="Search..."
      value={localValue}
      onChange={(e) => setLocalValue(e.target.value)}
      slotProps={{
        input: {
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon fontSize="small" sx={{ color: 'text.disabled' }} />
            </InputAdornment>
          ),
        },
      }}
      sx={{ minWidth: 220 }}
    />
  )
}
