import { useMemo } from 'react'
import type { ColumnDef } from '@tanstack/react-table'
import Avatar from '@mui/material/Avatar'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import { useNavigate } from '@tanstack/react-router'
import { AppTable } from '../../../components/table'
import { useUsersQuery } from '../api/useUsersQuery'
import type { User } from '../types/user'

const columns: ColumnDef<User>[] = [
  {
    accessorKey: 'id',
    header: 'ID',
    size: 64,
    cell: ({ getValue }) => (
      <Typography variant="body2" color="text.secondary">
        #{getValue<number>()}
      </Typography>
    ),
  },
  {
    accessorKey: 'name',
    header: 'Name',
    cell: ({ row }) => (
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
        <Avatar sx={{ width: 32, height: 32, fontSize: '0.85rem', fontWeight: 700, bgcolor: 'primary.main' }}>
          {row.original.name.charAt(0)}
        </Avatar>
        <Box>
          <Typography variant="body2" sx={{ fontWeight: 500 }}>
            {row.original.name}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            @{row.original.username}
          </Typography>
        </Box>
      </Box>
    ),
  },
  {
    accessorKey: 'email',
    header: 'Email',
    cell: ({ getValue }) => (
      <Typography variant="body2" color="text.secondary">
        {getValue<string>()}
      </Typography>
    ),
  },
  {
    accessorKey: 'phone',
    header: 'Phone',
    cell: ({ getValue }) => (
      <Typography variant="body2" color="text.secondary">
        {getValue<string>()}
      </Typography>
    ),
  },
  {
    id: 'company',
    header: 'Company',
    accessorFn: (row) => row.company.name,
    cell: ({ getValue }) => (
      <Typography variant="body2">{getValue<string>()}</Typography>
    ),
  },
  {
    accessorKey: 'website',
    header: 'Website',
    cell: ({ getValue }) => (
      <Typography variant="body2" color="primary.main">
        {getValue<string>()}
      </Typography>
    ),
  },
]

export default function UserList() {
  const { data, isLoading, isError } = useUsersQuery()
  const navigate = useNavigate()

  const stableColumns = useMemo(() => columns, [])

  return (
    <AppTable<User>
      data={data ?? []}
      columns={stableColumns}
      loading={isLoading}
      error={isError}
      errorMessage="Failed to load users. Please try again."
      emptyMessage="No users found."
      pagination
      sorting
      searchable
      columnVisibility
      rowSelection
      initialPageSize={10}
      pageSizeOptions={[10, 25, 50]}
      onRowClick={(user) => {
        void navigate({ to: '/users/$userId', params: { userId: String(user.id) } })
      }}
    />
  )
}
