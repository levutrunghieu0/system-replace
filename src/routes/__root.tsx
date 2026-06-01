import { createRootRoute, Outlet } from '@tanstack/react-router'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import AppLayout from '../components/layout/AppLayout'

export const Route = createRootRoute({
  component: RootLayout,
  notFoundComponent: NotFoundPage,
})

function RootLayout() {
  return (
    <AppLayout>
      <Outlet />
    </AppLayout>
  )
}

function NotFoundPage() {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', flexDirection: 'column', gap: 1 }}>
      <Typography variant="h5" color="text.secondary">404</Typography>
      <Typography color="text.secondary">Page not found</Typography>
    </Box>
  )
}
