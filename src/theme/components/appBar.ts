import type { Components, Theme } from '@mui/material/styles'

export const MuiAppBar: Components<Theme>['MuiAppBar'] = {
  defaultProps: {
    elevation: 0,
    color: 'inherit',
  },
  styleOverrides: {
    root: {
      borderBottom: '1px solid var(--mui-palette-divider)',
      backgroundColor: 'var(--mui-palette-background-paper)',
      backgroundImage: 'none',
    },
  },
}
