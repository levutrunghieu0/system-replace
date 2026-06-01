import type { Components, Theme } from '@mui/material/styles'

export const MuiButton: Components<Theme>['MuiButton'] = {
  defaultProps: {
    disableElevation: true,
  },
  styleOverrides: {
    root: {
      borderRadius: 8,
      fontWeight: 600,
      textTransform: 'none',
      padding: '8px 20px',
    },
    sizeSmall: {
      padding: '4px 12px',
      fontSize: '0.8125rem',
    },
    sizeLarge: {
      padding: '12px 28px',
      fontSize: '1rem',
    },
  },
}
