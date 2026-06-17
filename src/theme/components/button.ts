import type { Components, Theme } from '@mui/material/styles'

// PDF spec: ボタン高さ 36px / タップ許容範囲 48px 以上
export const MuiButton: Components<Theme>['MuiButton'] = {
  defaultProps: {
    disableElevation: true,
  },
  styleOverrides: {
    root: {
      borderRadius: 8,
      fontWeight: 700,
      fontSize: '0.875rem',
      textTransform: 'none',
      height: 36,
      minHeight: 36,
      padding: '0 20px',
      // タップ許容範囲 48px: タッチデバイスで hit area を拡大
      '@media (pointer: coarse)': {
        minHeight: 48,
      },
    },
    sizeSmall: {
      height: 32,
      padding: '0 12px',
      fontSize: '0.8125rem',
    },
    sizeLarge: {
      height: 48,
      padding: '0 28px',
      fontSize: '1rem',
    },
  },
}
