import type { Components, Theme } from '@mui/material/styles'
import { MuiButton } from './components/button'
import { MuiTextField } from './components/textField'
import { MuiCard } from './components/card'
import { MuiAppBar } from './components/appBar'
import { MuiTable, MuiTableCell, MuiTableRow, MuiTablePagination } from './components/table'

export const components: Components<Theme> = {
  MuiButton,
  MuiTextField,
  MuiCard,
  MuiAppBar,
  MuiTable,
  MuiTableCell,
  MuiTableRow,
  MuiTablePagination,
  MuiTypography: {
    defaultProps: {
      variantMapping: {
        bodyLarge: 'p',
      },
    },
  },
  MuiCssBaseline: {
    styleOverrides: {
      html: {
        colorScheme: 'light dark',
      },
      body: {
        scrollbarWidth: 'thin',
        transition: 'background-color 0.25s ease, color 0.25s ease',
      },
    },
  },
}
