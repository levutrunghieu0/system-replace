import List from '@mui/material/List'
import ListItem from '@mui/material/ListItem'
import ListItemButton from '@mui/material/ListItemButton'
import ListItemIcon from '@mui/material/ListItemIcon'
import ListItemText from '@mui/material/ListItemText'
import HomeIcon from '@mui/icons-material/Home'
import InfoIcon from '@mui/icons-material/Info'
import PeopleIcon from '@mui/icons-material/People'
import { Link, useRouterState } from '@tanstack/react-router'

const navItems = [
  { label: 'Home', path: '/', icon: <HomeIcon /> },
  { label: 'About', path: '/about', icon: <InfoIcon /> },
  { label: 'Users', path: '/users', icon: <PeopleIcon /> },
] as const

export default function AppNavigation() {
  const routerState = useRouterState()
  const currentPath = routerState.location.pathname

  return (
    <List sx={{ pt: 1 }}>
      {navItems.map((item) => {
        const isActive =
          item.path === '/'
            ? currentPath === '/'
            : currentPath.startsWith(item.path)

        return (
          <ListItem key={item.path} disablePadding>
            <Link
              to={item.path}
              style={{ textDecoration: 'none', color: 'inherit', width: '100%' }}
            >
              <ListItemButton
                selected={isActive}
                sx={{
                  mx: 1,
                  borderRadius: 2,
                  '&.Mui-selected': {
                    backgroundColor: 'var(--mui-palette-primary-main)',
                    color: 'var(--mui-palette-primary-contrastText)',
                    '&:hover': {
                      backgroundColor: 'var(--mui-palette-primary-dark)',
                    },
                    '& .MuiListItemIcon-root': {
                      color: 'var(--mui-palette-primary-contrastText)',
                    },
                  },
                }}
              >
                <ListItemIcon sx={{ minWidth: 40 }}>{item.icon}</ListItemIcon>
                <ListItemText primary={item.label} />
              </ListItemButton>
            </Link>
          </ListItem>
        )
      })}
    </List>
  )
}
