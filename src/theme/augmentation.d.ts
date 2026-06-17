import type { PaletteColorOptions, PaletteColor } from '@mui/material/styles'

declare module '@mui/material/styles' {
  interface Palette {
    logoColor: PaletteColor
  }
  interface PaletteOptions {
    logoColor?: PaletteColorOptions
  }

  // 拡張性カラー & モーダルオーバーレイ用の型拡張
  interface TypeText {
    disabled: string
  }
}

// Typography に 20px Regular バリアントを追加 (大きめの本文用)
declare module '@mui/material/styles' {
  interface TypographyVariants {
    bodyLarge: React.CSSProperties
  }
  interface TypographyVariantsOptions {
    bodyLarge?: React.CSSProperties
  }
}

declare module '@mui/material/Typography' {
  interface TypographyPropsVariantOverrides {
    bodyLarge: true
  }
}
