import { useState, useEffect } from 'react'
import type { ReactNode } from 'react'
import Box from '@mui/material/Box'
import { useRouterState, useRouter } from '@tanstack/react-router'
import { LayoutProvider, useLayoutContext } from '../../contexts/LayoutContext'
import { useAppSettings } from '../../contexts/AppSettingsContext'
import { primaryMenuItems } from '../../config/navigation'
import PrimaryNav from './PrimaryNav'
import SecondaryNav from './SecondaryNav'
import AppHeader from './AppHeader'
import ActionBar from './ActionBar'
import { EmployeeGate } from '../../features/csv-purchase/components/EmployeeGate'

interface AppLayoutProps {
  children: ReactNode
}

/** Find which primary menu key owns the given pathname, based on sub-item paths. */
function findPrimaryKeyByPath(pathname: string): string | null {
  for (const item of primaryMenuItems) {

    // kiểm tra path của menu chính
    if ('path' in item && item.path === pathname) {
      return item.key
    }

    // kiểm tra submenu
    for (const sub of item.subItems) {
      if (
        sub.path === pathname ||
        (sub.path !== '/' && pathname.startsWith(sub.path + '/'))
      ) {
        return item.key
      }
    }
  }

  return null
}

function AppShell({ children }: AppLayoutProps) {
  const [activePrimaryKey, setActivePrimaryKey] = useState<string | null>(null)
  const [navOverride, setNavOverride] = useState(false)
  const [pendingNavPath, setPendingNavPath] = useState<string | null>(null)
  const { forceHideSecondaryNav } = useLayoutContext()
  const { employeeAuthEnabled } = useAppSettings()

  const router = useRouter()

  const pathname = useRouterState({ select: (s) => s.location.pathname })

  // Route-derived key: which primary section the current URL belongs to
  const routeActiveKey = findPrimaryKeyByPath(pathname)

  // Reset override whenever forceHideSecondaryNav changes
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setNavOverride(false)
  }, [forceHideSecondaryNav])

  const handleSecondaryNavigate = (path: string) => {
    if (employeeAuthEnabled) {
      // Clear any previous session so auth is always required
      sessionStorage.removeItem('tantousha')
      setPendingNavPath(path)
    } else {
      router.navigate({ to: path as string })
      if ((router.routesById as unknown as Record<string, unknown>)[path] !== undefined) {
        setActivePrimaryKey(null)
      }
    }
  }

  const handleAuthSuccess = () => {
    if (!pendingNavPath) return
    // Don't persist session — require auth on every secondary nav click
    sessionStorage.removeItem('tantousha')
    router.navigate({ to: pendingNavPath as string })
    setActivePrimaryKey(null)
    setPendingNavPath(null)
  }

  const handlePrimarySelect = (key: string) => {
    const selectedPrimary = primaryMenuItems.find((item) => item.key === key)
    const hasSecondaryMenu = Boolean(selectedPrimary?.subItems.length)

    if (!hasSecondaryMenu) {
      setActivePrimaryKey(null)
      setNavOverride(false)
      return
    }

    if (activePrimaryKey === key) {
      setActivePrimaryKey(null)
      setNavOverride(false)
    } else {
      setActivePrimaryKey(key)
      if (forceHideSecondaryNav) setNavOverride(true)
    }
  }

  // Secondary nav chỉ hiện nếu menu có submenu
  const selectedMenu = primaryMenuItems.find((item) => item.key === (activePrimaryKey ?? routeActiveKey))
  const showSecondaryNav =
    selectedMenu && selectedMenu.subItems && selectedMenu.subItems.length > 0 &&
    activePrimaryKey !== null && (!forceHideSecondaryNav || navOverride)

  // PrimaryNav highlight: prefer actively-clicked key, fall back to URL-derived key
  const displayActiveKey = activePrimaryKey ?? routeActiveKey

  return (
  <Box
    sx={{
      display: 'flex',
      height: '100vh',
      overflow: 'hidden',
      bgcolor: '#e3f1f5',
      position: 'relative',
    }}
  >
    {/* Sidebar trái */}
    <PrimaryNav
      activeKey={displayActiveKey}
      onSelect={handlePrimarySelect}
    />

    {/* Khung chính */}
    <Box
      sx={{
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    minWidth: 0,
    overflow: 'hidden',
    bgcolor: 'background.paper',
    boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
    border: '1px solid',
    borderColor: 'divider',

    m: 0,
    borderRadius: 0,
  }}
    >
      {/* Header */}
      <AppHeader showSecondaryNav={showSecondaryNav} />

      {/* Content */}
      <Box sx={{ flex: 1, display: 'flex', minHeight: 0 }}>
        {showSecondaryNav && (
          <SecondaryNav
            activePrimaryKey={activePrimaryKey}
            onNavigate={handleSecondaryNavigate}
          />
        )}

        <Box
          component="main"
          sx={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            minWidth: 0,
            overflow: 'hidden',
            bgcolor: 'background.paper',
          }}
        >
          <Box
            sx={{
              flex: 1,
              overflowY: 'auto',
              p: 2,
              '&::-webkit-scrollbar': {
                width: 6,
              },
              '&::-webkit-scrollbar-thumb': {
                bgcolor: 'divider',
                borderRadius: 3,
              },
            }}
          >
            {children}
          </Box>

          <ActionBar />
        </Box>
      </Box>
    </Box>

    {/* Employee auth overlay — shown when any secondary nav item is clicked with auth enabled */}
    {pendingNavPath && (
      <Box
        sx={{
          position: 'fixed',
          inset: 0,
          zIndex: 1300,
          bgcolor: 'background.default',
        }}
      >
        <EmployeeGate onAuthenticated={handleAuthSuccess} />
      </Box>
    )}
  </Box>
)
}

export default function AppLayout({ children }: AppLayoutProps) {
  return (
    <LayoutProvider>
      <AppShell>{children}</AppShell>
    </LayoutProvider>
  )
}
