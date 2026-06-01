import Box from '@mui/material/Box'
import List from '@mui/material/List'
import ListItemButton from '@mui/material/ListItemButton'
import ListItemIcon from '@mui/material/ListItemIcon'
import ListItemText from '@mui/material/ListItemText'
import Typography from '@mui/material/Typography'
import { useTranslation } from 'react-i18next'
import { Link, useRouterState } from '@tanstack/react-router'
import { primaryMenuItems } from '../../config/navigation'

const SECONDARY_NAV_WIDTH = 200

interface SecondaryNavProps {
  activePrimaryKey: string | null
  onNavigate?: (path: string) => void
}

export default function SecondaryNav({ activePrimaryKey, onNavigate }: SecondaryNavProps) {
  const { t } = useTranslation()
  const routerState = useRouterState()
  const currentPath = routerState.location.pathname

  const activeMenu = primaryMenuItems.find((m) => m.key === activePrimaryKey)

  if (!activeMenu) return null

  return (
    <Box
      sx={{
        width: SECONDARY_NAV_WIDTH,
        flexShrink: 0,
        borderRight: '1px solid',
        borderColor: 'divider',
        bgcolor: 'background.paper',
        display: 'flex',
        flexDirection: 'column',
        overflowY: 'auto',
        '&::-webkit-scrollbar': { width: 4 },
        '&::-webkit-scrollbar-thumb': { bgcolor: 'divider', borderRadius: 2 },
      }}
    >
      {/* Section label */}
      <Box
        sx={{
          px: 2,
          py: 1.25,
          borderBottom: '1px solid',
          borderColor: 'divider',
          bgcolor: 'action.hover',
        }}
      >
        <Typography
          variant="caption"
          sx={{
            fontWeight: 700,
            color: 'text.secondary',
            fontSize: '0.7rem',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
          }}
        >
          {t(activeMenu.labelKey as Parameters<typeof t>[0])}
        </Typography>
      </Box>

      {/* Sub-menu items */}
      <List disablePadding sx={{ flex: 1, py: 0.5 }}>
        {activeMenu.subItems.map((item) => {
          const isActive = currentPath === item.path

          return (
            <Link
              key={item.key}
              to={item.path}
              style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}
              onClick={() => onNavigate?.(item.path)}
            >
              <ListItemButton
                selected={isActive}
                sx={{
                  py: 0.75,
                  px: 1.25,
                  mx: 0.5,
                  my: 0.25,
                  borderRadius: 1.5,
                  minHeight: 40,
                  '&.Mui-selected': {
                    bgcolor: 'primary.main',
                    color: 'primary.contrastText',
                    '&:hover': { bgcolor: 'primary.dark' },
                    '& .MuiListItemIcon-root': { color: 'primary.contrastText' },
                    '& .MuiListItemText-primary': { fontWeight: 700 },
                  },
                  '&:hover:not(.Mui-selected)': { bgcolor: 'action.hover' },
                }}
              >
                <ListItemIcon
                  sx={{
                    minWidth: 30,
                    color: isActive ? 'primary.contrastText' : 'text.secondary',
                    '& svg': { fontSize: '1.1rem' },
                  }}
                >
                  {item.icon}
                </ListItemIcon>
                <ListItemText
                  primary={t(item.labelKey as Parameters<typeof t>[0])}
                  slotProps={{ primary: { style: { fontSize: '0.8rem', lineHeight: 1.3 } } }}
                />
              </ListItemButton>
            </Link>
          )
        })}
      </List>
    </Box>
  )
}

export { SECONDARY_NAV_WIDTH }
