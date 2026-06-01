import type { Components, Theme } from '@mui/material/styles'

export const MuiCard: Components<Theme>['MuiCard'] = {
  defaultProps: {
    elevation: 0,
  },
  styleOverrides: {
    root: {
      border: '1px solid var(--mui-palette-divider)',
      borderRadius: 12,
      backgroundImage: 'none',
    },
  },
}
