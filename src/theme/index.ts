import { createTheme } from '@mui/material/styles'
import { lightPalette, darkPalette } from './palette'
import { typography } from './typography'
import { shape } from './shape'
import { shadows } from './shadows'
import { components } from './components'

export const theme = createTheme({
  cssVariables: {
    // Bắt buộc để setMode() hoạt động — 'media' (default) khiến toggle vô hiệu
    colorSchemeSelector: 'data-mui-color-scheme',
  },
  defaultColorScheme: 'light',
  colorSchemes: {
    light: {
      palette: lightPalette,
    },
    dark: {
      palette: darkPalette,
    },
  },
  typography,
  shape,
  shadows,
  components,
})
