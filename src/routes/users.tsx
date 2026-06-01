import { createFileRoute, Outlet, useRouterState } from '@tanstack/react-router'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import { Link } from '@tanstack/react-router'
import PageHeader from '../components/common/PageHeader'
import UserList from '../features/users/components/UserList'

export const Route = createFileRoute('/users')({
  component: UsersPage,
})

function UsersPage() {
  const { location } = useRouterState()
  const hasUserSelected = location.pathname !== '/users'

  if (hasUserSelected) {
    return (
      <Box>
        <Box sx={{ mb: 2 }}>
          <Link to="/users" style={{ textDecoration: 'none' }}>
            <Button variant="text" startIcon={<ArrowBackIcon />} size="small">
              Back to Users
            </Button>
          </Link>
        </Box>
        <Outlet />
      </Box>
    )
  }

  return (
    <Box>
      <PageHeader
        title="Users"
        subtitle="Browse and manage users. Click any row to view details."
      />
      <UserList />
    </Box>
  )
}
