import type { Components, Theme } from '@mui/material/styles'

export const MuiTextField: Components<Theme>['MuiTextField'] = {
  defaultProps: {
    size: 'small',
    variant: 'outlined',
  },
  styleOverrides: {
    root: {
      '& .MuiOutlinedInput-root': {
        borderRadius: 8,
        '&:hover .MuiOutlinedInput-notchedOutline': {
          borderColor: 'var(--mui-palette-primary-main)',
        },
      },
    },
  },
}
