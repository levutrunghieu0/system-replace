import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import Button from '@mui/material/Button'
import type { ReactNode } from 'react'
import type { ButtonProps } from '@mui/material/Button'
import type { SxProps, Theme } from '@mui/material/styles'

interface AppModalProps {
  open: boolean
  title: string
  /** @default 'xs' */
  maxWidth?: 'xs' | 'sm' | 'md'
  children: ReactNode
  /** キャンセルボタンのラベル @default 'キャンセル' */
  cancelLabel?: string
  /** 確認ボタンのラベル @default '実行' */
  confirmLabel?: string
  /** キャンセルボタン押下 / ダイアログ外クリック時のコールバック */
  onCancel?: () => void
  /** 確認ボタン押下時のコールバック */
  onConfirm?: () => void
  /** 確認ボタンのカラー @default 'primary' */
  confirmColor?: ButtonProps['color']
  /** 確認ボタンの disabled 状態 @default false */
  confirmDisabled?: boolean
  /** 確認ボタンに autoFocus をつける @default false */
  confirmAutoFocus?: boolean
  /**
   * true: タイトル・アクションエリアに divider を表示し、コンテンツは p:0 (フォームやリスト用)
   * false: シンプルなスタイル (確認ダイアログ用)
   * @default false
   */
  dividers?: boolean
  /**
   * true: ダイアログ外をクリックしても閉じない
   * @default false
   */
  disableBackdropClose?: boolean
  /** DialogContent の sx を追加で渡したい場合 */
  contentSx?: SxProps<Theme>
}

/**
 * アプリ共通モーダルコンポーネント。
 * - ボタンサイズを ActionBar と統一 (size="small")
 * - borderRadius / フォントサイズ等を一元管理
 */
export default function AppModal({
  open,
  title,
  maxWidth = 'xs',
  children,
  cancelLabel = 'キャンセル',
  confirmLabel = '実行',
  onCancel,
  onConfirm,
  confirmColor = 'primary',
  confirmDisabled = false,
  confirmAutoFocus = false,
  dividers = false,
  disableBackdropClose = false,
  contentSx,
}: AppModalProps) {
  return (
    <Dialog
      open={open}
      onClose={disableBackdropClose ? undefined : onCancel}
      maxWidth={maxWidth}
      fullWidth
      slotProps={{ paper: { sx: { borderRadius: 2 } } }}
    >
      <DialogTitle
        sx={{
          fontSize: '0.95rem',
          fontWeight: 700,
          ...(dividers
            ? { py: 1.5, borderBottom: '1px solid', borderColor: 'divider' }
            : { pt: 2.5, pb: 1 }),
        }}
      >
        {title}
      </DialogTitle>

      <DialogContent
        sx={{
          ...(dividers ? { p: 0 } : { pb: 1 }),
          ...contentSx,
        }}
      >
        {children}
      </DialogContent>

      <DialogActions
        sx={{
          px: 3,
          gap: 1,
          ...(dividers
            ? { py: 1.5, borderTop: '1px solid', borderColor: 'divider' }
            : { py: 2 }),
        }}
      >
        {onCancel && (
          <Button
            variant="outlined"
            color="inherit"
            size="small"
            onClick={onCancel}
            sx={{ textTransform: 'none', minWidth: 100 }}
          >
            {cancelLabel}
          </Button>
        )}
        {onConfirm && (
          <Button
            variant="contained"
            color={confirmColor}
            size="small"
            disabled={confirmDisabled}
            autoFocus={confirmAutoFocus}
            onClick={onConfirm}
            sx={{ textTransform: 'none', minWidth: 100 }}
          >
            {confirmLabel}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  )
}
