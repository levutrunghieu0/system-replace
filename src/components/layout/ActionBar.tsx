import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Divider from '@mui/material/Divider'
import { useTranslation } from 'react-i18next'
import { useLayoutContext } from '../../contexts/LayoutContext'

const ACTION_BAR_HEIGHT = 60

export default function ActionBar() {
  const { t } = useTranslation()
  const { actions } = useLayoutContext()

  if (actions.length === 0) return null

  const leftActions = actions.filter((a) => a.position === 'left')
  const rightActions = actions.filter((a) => !a.position || a.position === 'right')

  return (
    <>
      <Divider />
      <Box
        sx={{
          height: ACTION_BAR_HEIGHT,
          flexShrink: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          px: 2,
          gap: 1.5,
          bgcolor: 'background.paper',
        }}
      >
        {/* Left group */}
        <Box sx={{ display: 'flex', gap: 1 }}>
          {leftActions.map((action) => (
            <Button
              key={action.key}
              variant={action.variant ?? 'outlined'}
              color={action.color ?? 'inherit'}
              disabled={action.disabled}
              onClick={action.onClick}
              startIcon={action.startIcon}
              size="small"
              sx={{ minWidth: 100, textTransform: 'none', fontWeight: 500, ...action.sx }}
            >
              {t(action.labelKey as Parameters<typeof t>[0])}
            </Button>
          ))}
        </Box>

        {/* Right group */}
        <Box sx={{ display: 'flex', gap: 1 }}>
          {rightActions.map((action) => (
            <Button
              key={action.key}
              variant={action.variant ?? 'contained'}
              color={action.color ?? 'primary'}
              disabled={action.disabled}
              onClick={action.onClick}
              startIcon={action.startIcon}
              size="small"
              sx={{ minWidth: 100, textTransform: 'none', fontWeight: 600, ...action.sx }}
            >
              {t(action.labelKey as Parameters<typeof t>[0])}
            </Button>
          ))}
        </Box>
      </Box>
    </>
  )
}

export { ACTION_BAR_HEIGHT }
