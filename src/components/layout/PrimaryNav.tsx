import Box from '@mui/material/Box'
import Tooltip from '@mui/material/Tooltip'
import Typography from '@mui/material/Typography'
import IconButton from '@mui/material/IconButton'
import Badge from '@mui/material/Badge'
import Divider from '@mui/material/Divider'
import NotificationsIcon from '@mui/icons-material/Notifications'
import LanguageIcon from '@mui/icons-material/Language'
import SettingsIcon from '@mui/icons-material/Settings'
import { useTranslation } from 'react-i18next'
import { primaryMenuItems, type PrimaryMenuItem } from '../../config/navigation'

const PRIMARY_NAV_WIDTH = 72

interface PrimaryNavProps {
  activeKey: string | null
  onSelect: (key: string) => void
}

interface NavItemProps {
  item: PrimaryMenuItem
  isActive: boolean
  onClick: () => void
}

import { Link } from '@tanstack/react-router'
function NavItem({ item, isActive, onClick }: NavItemProps) {
  const { t } = useTranslation()

  // Nếu là menu đầu tiên (front) hoặc không có submenu và có path, click vào sẽ truy cập thẳng route và gọi onClick
  if ((item.key === 'front' || (Array.isArray(item.subItems) && item.subItems.length === 0)) && (item as PrimaryMenuItem).path) {
    return (
      <Tooltip title={t(item.labelKey as Parameters<typeof t>[0])} placement="right" arrow>
        <Link
          to={(item as PrimaryMenuItem).path}
          style={{ textDecoration: 'none', color: 'inherit', width: '100%' }}
          onClick={() => onClick()}
        >
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              width: '100%',
              py: 1.25,
              px: 0.5,
              cursor: 'pointer',
              gap: 0.4,
              borderLeft: '3px solid transparent',
              transition: 'background-color 0.15s, border-color 0.15s',
              backgroundColor: isActive ? 'action.selected' : 'transparent',
              borderLeftColor: isActive ? 'primary.main' : 'transparent',
              color: isActive ? 'text.primary' : 'text.secondary',
              '&:hover': {
                backgroundColor: 'action.hover',
                color: 'text.primary',
              },
            }}
          >
            <Box sx={{ fontSize: 22, lineHeight: 1, display: 'flex' }}>{item.icon}</Box>
            <Typography
              variant="caption"
              sx={{
                fontWeight: isActive ? 700 : 400,
                lineHeight: 1.2,
                textAlign: 'center',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                maxWidth: '100%',
              }}
            >
              {t(item.labelKey as Parameters<typeof t>[0])}
            </Typography>
          </Box>
        </Link>
      </Tooltip>
    )
  }
  // Mặc định như cũ
  return (
    <Tooltip title={t(item.labelKey as Parameters<typeof t>[0])} placement="right" arrow>
      <Box
        onClick={onClick}
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          width: '100%',
          py: 1.25,
          px: 0.5,
          cursor: 'pointer',
          gap: 0.4,
          borderLeft: '3px solid transparent',
          transition: 'background-color 0.15s, border-color 0.15s',
          backgroundColor: isActive ? 'action.selected' : 'transparent',
          borderLeftColor: isActive ? 'primary.main' : 'transparent',
          color: isActive ? 'text.primary' : 'text.secondary',
          '&:hover': {
            backgroundColor: 'action.hover',
            color: 'text.primary',
          },
        }}
      >
        <Box sx={{ fontSize: 22, lineHeight: 1, display: 'flex' }}>{item.icon}</Box>
        <Typography
          variant="caption"
          sx={{
            fontWeight: isActive ? 700 : 400,
            lineHeight: 1.2,
            textAlign: 'center',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            maxWidth: '100%',
          }}
        >
          {t(item.labelKey as Parameters<typeof t>[0])}
        </Typography>
      </Box>
    </Tooltip>
  )
}

export default function PrimaryNav({ activeKey, onSelect }: PrimaryNavProps) {
  const { t, i18n } = useTranslation()

  const toggleLanguage = () => {
    const languages = ['ja', 'en', 'vi']
    const currentIndex = languages.findIndex((language) => i18n.language.startsWith(language))
    i18n.changeLanguage(languages[(currentIndex + 1) % languages.length])
  }

  const currentLanguageLabel = i18n.language.startsWith('vi') ? 'VI' : i18n.language.startsWith('en') ? 'EN' : 'JA'

  return (
    <Box
      sx={{
        width: PRIMARY_NAV_WIDTH,
        flexShrink: 0,
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        bgcolor: 'background.default',
        borderRight: '1px solid',
        borderColor: 'divider',
        overflowY: 'auto',
        overflowX: 'hidden',
        '&::-webkit-scrollbar': { width: 4 },
        '&::-webkit-scrollbar-thumb': { bgcolor: 'divider', borderRadius: 2 },
      }}
    >
      {/* Logo area */}
      {/* <Box
        sx={{
          height: 56,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
          borderBottom: '1px solid',
          borderColor: 'divider',
        }}
      >
        <Box
          sx={{
            width: 36,
            height: 36,
            borderRadius: '50%',
            bgcolor: 'primary.main',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Typography variant="caption" sx={{ color: 'primary.contrastText', fontWeight: 700, fontSize: '0.7rem' }}>
            APP
          </Typography>
        </Box>
      </Box> */}

      {/* Primary menu items */}
      <Box sx={{ flex: 1, py: 0.5 }}>
        {primaryMenuItems.map((item) => (
          <NavItem
            key={item.key}
            item={item}
            isActive={activeKey === item.key}
            onClick={() => onSelect(item.key)}
          />
        ))}
      </Box>

      {/* Bottom utility buttons */}
      <Divider />
      <Box sx={{ py: 0.5 }}>
        <Tooltip title={t('notification.title')} placement="right" arrow>
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 0.75 }}>
            <IconButton size="small" color="default">
              <Badge badgeContent={3} color="error">
                <NotificationsIcon fontSize="small" />
              </Badge>
            </IconButton>
          </Box>
        </Tooltip>

        <Tooltip title={t('language.toggle')} placement="right" arrow>
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 0.75 }}>
            <IconButton size="small" color="default" onClick={toggleLanguage}>
              <Box sx={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <LanguageIcon fontSize="small" />
                <Typography component="span" sx={{ position: 'absolute', top: 14, fontSize: 8, fontWeight: 800, lineHeight: 1 }}>
                  {currentLanguageLabel}
                </Typography>
              </Box>
            </IconButton>
          </Box>
        </Tooltip>

        <Tooltip title={t('settings.title')} placement="right" arrow>
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 0.75 }}>
            <IconButton size="small" color="default">
              <SettingsIcon fontSize="small" />
            </IconButton>
          </Box>
        </Tooltip>
      </Box>
    </Box>
  )
}

export { PRIMARY_NAV_WIDTH }
