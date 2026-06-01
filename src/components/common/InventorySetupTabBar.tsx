import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Paper from '@mui/material/Paper'
import TableRowsIcon from '@mui/icons-material/TableRows'
import CategoryIcon from '@mui/icons-material/Category'
import PhonelinkSetupIcon from '@mui/icons-material/PhonelinkSetup'
import { useNavigate } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'

export type SetupTab = 'shelf' | 'classification' | 'handy'

const TABS = [
  { key: 'shelf'          as SetupTab, path: '/inventory/shelf-registration', Icon: TableRowsIcon,      labelKey: 'page.tanazaoroshi.shelfRegistration.title' },
  { key: 'classification' as SetupTab, path: '/inventory/classification',      Icon: CategoryIcon,       labelKey: 'page.tanazaoroshi.classification.title'    },
  { key: 'handy'          as SetupTab, path: '/inventory/handy',               Icon: PhonelinkSetupIcon, labelKey: 'page.tanazaoroshi.handy.title'             },
]

export function InventorySetupTabBar({ activeTab }: { activeTab: SetupTab }) {
  const navigate = useNavigate()
  const { t } = useTranslation()

  return (
    <Paper elevation={0} sx={{ borderBottom: '1px solid', borderColor: 'divider' }}>
      <Box sx={{ display: 'flex' }}>
        {TABS.map((tab, i) => {
          const isActive = tab.key === activeTab
          return (
            <Button
              key={tab.key}
              onClick={() => navigate({ to: tab.path })}
              startIcon={<tab.Icon fontSize="small" />}
              sx={{
                flex: 1,
                py: 1.5,
                borderRadius: 0,
                borderRight: i < TABS.length - 1 ? '1px solid' : 'none',
                borderColor: 'divider',
                fontSize: '0.82rem',
                fontWeight: isActive ? 700 : 400,
                color: isActive ? 'primary.main' : 'text.secondary',
                bgcolor: isActive ? 'primary.50' : 'transparent',
                borderBottom: isActive ? '3px solid' : '3px solid transparent',
                borderBottomColor: isActive ? 'primary.main' : 'transparent',
                '&:hover': { bgcolor: 'action.hover' },
              }}
            >
              {t(tab.labelKey)}
            </Button>
          )
        })}
      </Box>
    </Paper>
  )
}
