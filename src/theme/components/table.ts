import type { Components, Theme } from '@mui/material/styles'

export const MuiTable: Components<Theme>['MuiTable'] = {
  styleOverrides: {
    root: {
      tableLayout: 'auto',
    },
  },
}

export const MuiTableCell: Components<Theme>['MuiTableCell'] = {
  styleOverrides: {
    root: {
      borderBottomColor: 'var(--mui-palette-divider)',
    },
    head: {
      fontWeight: 600,
      fontSize: '0.75rem',
      textTransform: 'uppercase',
      letterSpacing: '0.06em',
      color: 'var(--mui-palette-text-secondary)',
      backgroundColor: 'var(--mui-palette-action-hover)',
      whiteSpace: 'nowrap',
    },
  },
}

export const MuiTableRow: Components<Theme>['MuiTableRow'] = {
  styleOverrides: {
    root: {
      '&.MuiTableRow-hover:hover': {
        backgroundColor: 'var(--mui-palette-action-hover)',
      },
      '&.Mui-selected': {
        backgroundColor: 'rgba(var(--mui-palette-primary-mainChannel) / 0.12)',
        '&:hover': {
          backgroundColor: 'rgba(var(--mui-palette-primary-mainChannel) / 0.20)',
        },
      },
    },
  },
}

export const MuiTablePagination: Components<Theme>['MuiTablePagination'] = {
  styleOverrides: {
    root: {
      color: 'var(--mui-palette-text-secondary)',
    },
    selectLabel: {
      fontSize: '0.8125rem',
    },
    displayedRows: {
      fontSize: '0.8125rem',
    },
  },
}
