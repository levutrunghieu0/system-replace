import type { PaletteOptions } from '@mui/material/styles'

export const lightPalette: PaletteOptions = {
  mode: 'light',

  // アクセントカラー — Blue #0A7AFF / Light Blue #F1F9FF
  primary: {
    main: '#0A7AFF',
    light: '#F1F9FF',
    dark: '#085FCC',
    contrastText: '#FFFFFF',
  },

  // 拡張性カラー — Purple #C435DD
  secondary: {
    main: '#C435DD',
    light: '#EBE2FF',
    dark: '#A02AB8',
    contrastText: '#FFFFFF',
  },

  // 機能性カラー — Warning(赤) #FF0A0A
  error: {
    main: '#FF0A0A',
    light: '#FFE5E5',
    contrastText: '#FFFFFF',
  },

  // 機能性カラー — Notification(オレンジ) #F99500
  warning: {
    main: '#F99500',
    light: '#FEF9DE',
    contrastText: '#FFFFFF',
  },

  info: {
    main: '#0A7AFF',
    light: '#F1F9FF',
    contrastText: '#FFFFFF',
  },

  // 機能性カラー — Green #0DC12E
  success: {
    main: '#0DC12E',
    light: '#AAF08D',
    contrastText: '#FFFFFF',
  },

  grey: {
    900: '#1F1F1F',   // Black
    700: '#79828D',   // Dark Grey
    500: '#9CA3AF',   // Medium Grey
    200: '#E8EAEC',   // Background Grey 1
    100: '#FAFAFA',   // Background Grey 2
  },

  background: {
    default: '#FAFAFA',  // Background Grey 2
    paper: '#FFFFFF',    // White
  },

  text: {
    primary: '#1F1F1F',   // Black
    secondary: '#79828D', // Dark Grey
    disabled: '#9CA3AF',  // Medium Grey
  },

  divider: '#E8EAEC', // Background Grey 1

  // モーダルオーバーレイ: rgba(31,31,31,0.48)
  logoColor: {
    main: '#0A7AFF',
    light: '#F1F9FF',
    dark: '#085FCC',
    contrastText: '#FFFFFF',
  },
}

export const darkPalette: PaletteOptions = {
  mode: 'dark',

  primary: {
    main: '#0A7AFF',
    light: '#3D9AFF',
    dark: '#085FCC',
    contrastText: '#FFFFFF',
  },

  secondary: {
    main: '#C435DD',
    light: '#D96AEE',
    dark: '#A02AB8',
    contrastText: '#FFFFFF',
  },

  error: {
    main: '#FF0A0A',
    light: '#FF4D4D',
    contrastText: '#FFFFFF',
  },

  warning: {
    main: '#F99500',
    light: '#FFBA40',
    contrastText: '#FFFFFF',
  },

  info: {
    main: '#3D9AFF',
    light: '#85BFFF',
    contrastText: '#FFFFFF',
  },

  success: {
    main: '#0DC12E',
    light: '#40D958',
    contrastText: '#FFFFFF',
  },

  background: {
    default: '#1F1F1F',
    paper: '#2C2C2C',
  },

  text: {
    primary: '#FFFFFF',
    secondary: '#9CA3AF',
    disabled: '#79828D',
  },

  divider: '#3A3A3A',

  logoColor: {
    main: '#0A7AFF',
    light: '#3D9AFF',
    dark: '#085FCC',
    contrastText: '#FFFFFF',
  },
}
