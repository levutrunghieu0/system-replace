import type { PaletteColorOptions, PaletteColor } from '@mui/material/styles'

declare module '@mui/material/styles' {
  interface Palette {
    logoColor: PaletteColor
  }
  interface PaletteOptions {
    logoColor?: PaletteColorOptions
  }
}
