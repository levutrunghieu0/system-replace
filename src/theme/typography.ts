import type { ThemeOptions } from '@mui/material/styles'

// PDF spec — フォント: Noto Sans (全言語対応), スケール (px / weight):
//   ヘッダー用 Bold : 22 bold
//   本文用 Regular  : 20, 16, 14, 12  regular
//   本文用 Bold     : 16, 14          bold
//   その他          : 10              regular

export const typography: ThemeOptions['typography'] = {
  fontFamily: '"Noto Sans JP", "Noto Sans", "Helvetica", "Arial", sans-serif',

  // ヘッダー用 Bold — 22px
  h1: { fontSize: '1.375rem', fontWeight: 700, lineHeight: 1.3 }, // 22px
  h2: { fontSize: '1.375rem', fontWeight: 700, lineHeight: 1.3 }, // 22px
  h3: { fontSize: '1.25rem', fontWeight: 700, lineHeight: 1.35 }, // 20px
  h4: { fontSize: '1rem', fontWeight: 700, lineHeight: 1.4 },     // 16px
  h5: { fontSize: '0.875rem', fontWeight: 700, lineHeight: 1.4 }, // 14px
  h6: { fontSize: '0.75rem', fontWeight: 700, lineHeight: 1.5 },  // 12px

  // 本文用 Bold
  subtitle1: { fontSize: '1rem', fontWeight: 700, lineHeight: 1.5 },      // 16px bold
  subtitle2: { fontSize: '0.875rem', fontWeight: 700, lineHeight: 1.57 }, // 14px bold

  // 本文用 Regular
  body1: { fontSize: '1rem', fontWeight: 400, lineHeight: 1.5 },       // 16px regular
  body2: { fontSize: '0.875rem', fontWeight: 400, lineHeight: 1.57 },  // 14px regular

  // 本文用 Regular — 12px (最小推奨サイズ)
  caption: { fontSize: '0.75rem', fontWeight: 400, lineHeight: 1.66 },

  // その他 — 10px (注釈・補足のみ許容)
  overline: { fontSize: '0.625rem', fontWeight: 400, lineHeight: 1.6, textTransform: 'none', letterSpacing: 0 },

  button: { fontSize: '0.875rem', fontWeight: 700, textTransform: 'none' }, // 14px bold

  // 本文用 Regular — 20px (大きい本文、ヘッダー直下など)
  bodyLarge: { fontSize: '1.25rem', fontWeight: 400, lineHeight: 1.4 },
}
