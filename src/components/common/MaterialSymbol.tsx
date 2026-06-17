import Box from '@mui/material/Box'
import type { SxProps, Theme } from '@mui/material/styles'

interface MaterialSymbolProps {
  name: string
  size?: number
  sx?: SxProps<Theme>
}

export function MaterialSymbol({ name, size = 24, sx }: MaterialSymbolProps) {
  return (
    <Box
      component="span"
      className="material-symbols-outlined"
      sx={{ fontSize: size, lineHeight: 1, userSelect: 'none', ...sx }}
    >
      {name}
    </Box>
  )
}
