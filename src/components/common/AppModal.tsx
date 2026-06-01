import type { ReactNode } from 'react'
import Button from '@mui/material/Button'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogTitle from '@mui/material/DialogTitle'

export interface AppModalAction {
  label: string
  onClick: () => void
  variant?: 'text' | 'outlined' | 'contained'
  color?: 'inherit' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning'
  disabled?: boolean
}

export interface AppModalProps {
  open: boolean
  onClose: () => void
  title: ReactNode
  maxWidth?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  fullWidth?: boolean
  /** Freeform content area */
  children?: ReactNode
  /** Pass Button configs for simple cancel/confirm patterns */
  actions?: AppModalAction[]
  /** Or pass custom ReactNode for full control over the actions area */
  actionsNode?: ReactNode
}

export function AppModal({
  open,
  onClose,
  title,
  maxWidth = 'xs',
  fullWidth = true,
  children,
  actions,
  actionsNode,
}: AppModalProps) {
  const hasActions = actionsNode != null || (actions && actions.length > 0)

  return (
    <Dialog open={open} onClose={onClose} maxWidth={maxWidth} fullWidth={fullWidth}>
      <DialogTitle sx={{ fontWeight: 700, fontSize: '1rem' }}>{title}</DialogTitle>

      {children != null && (
        <DialogContent sx={{ pt: '12px !important' }}>{children}</DialogContent>
      )}

      {hasActions && (
        <DialogActions sx={{ px: 3, pb: 2, gap: 1 }}>
          {actionsNode ??
            actions!.map((a) => (
              <Button
                key={a.label}
                variant={a.variant ?? 'text'}
                color={a.color ?? 'primary'}
                disabled={a.disabled}
                onClick={a.onClick}
              >
                {a.label}
              </Button>
            ))}
        </DialogActions>
      )}
    </Dialog>
  )
}
