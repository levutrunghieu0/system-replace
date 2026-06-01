import type { ReactNode } from 'react'
import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import Avatar from '@mui/material/Avatar'
import Chip from '@mui/material/Chip'
import Divider from '@mui/material/Divider'
import Grid from '@mui/material/Grid'
import EmailIcon from '@mui/icons-material/Email'
import PhoneIcon from '@mui/icons-material/Phone'
import LanguageIcon from '@mui/icons-material/Language'
import BusinessIcon from '@mui/icons-material/Business'
import LocationOnIcon from '@mui/icons-material/LocationOn'
import PersonIcon from '@mui/icons-material/Person'
import { useUserQuery } from '../api/useUserQuery'
import LoadingState from '../../../components/common/LoadingState'
import ErrorState from '../../../components/common/ErrorState'

interface InfoRowProps {
  icon: ReactNode
  label: string
  value: string
}

function InfoRow({ icon, label, value }: InfoRowProps) {
  return (
    <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5, py: 0.75 }}>
      <Box sx={{ color: 'text.secondary', mt: 0.25, flexShrink: 0 }}>{icon}</Box>
      <Box>
        <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
          {label}
        </Typography>
        <Typography variant="body2" sx={{ fontWeight: 500 }}>
          {value}
        </Typography>
      </Box>
    </Box>
  )
}

interface UserDetailProps {
  userId: number
}

export default function UserDetail({ userId }: UserDetailProps) {
  const { data: user, isLoading, isError, error, refetch } = useUserQuery(userId)

  if (isLoading) return <LoadingState message="Loading user details..." />

  if (isError) {
    return (
      <ErrorState
        message={error.message}
        onRetry={() => void refetch()}
      />
    )
  }

  if (!user) return null

  return (
    <Card>
      <CardContent sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
          <Avatar
            sx={{
              width: 64,
              height: 64,
              bgcolor: 'primary.main',
              fontSize: '1.5rem',
              fontWeight: 700,
            }}
          >
            {user.name.charAt(0)}
          </Avatar>
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 700 }}>
              {user.name}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
              <PersonIcon fontSize="small" sx={{ color: 'text.secondary' }} />
              <Typography variant="body2" color="text.secondary">
                @{user.username}
              </Typography>
              <Chip label={`ID: ${user.id}`} size="small" color="primary" />
            </Box>
          </Box>
        </Box>

        <Divider sx={{ mb: 2 }} />

        <Grid container spacing={0}>
          <Grid size={{ xs: 12, sm: 6 }}>
            <InfoRow icon={<EmailIcon fontSize="small" />} label="Email" value={user.email} />
            <InfoRow icon={<PhoneIcon fontSize="small" />} label="Phone" value={user.phone} />
            <InfoRow icon={<LanguageIcon fontSize="small" />} label="Website" value={user.website} />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <InfoRow
              icon={<BusinessIcon fontSize="small" />}
              label="Company"
              value={user.company.name}
            />
            <InfoRow
              icon={<LocationOnIcon fontSize="small" />}
              label="City"
              value={user.address.city}
            />
            <InfoRow
              icon={<LocationOnIcon fontSize="small" />}
              label="Address"
              value={`${user.address.street}, ${user.address.suite}`}
            />
          </Grid>
        </Grid>

        <Divider sx={{ my: 2 }} />

        <Box
          sx={{
            p: 2,
            borderRadius: 2,
            backgroundColor: 'action.hover',
            border: '1px solid var(--mui-palette-divider)',
          }}
        >
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }} gutterBottom>
            Company Tagline
          </Typography>
          <Typography variant="body2" sx={{ fontStyle: 'italic' }}>
            &ldquo;{user.company.catchPhrase}&rdquo;
          </Typography>
        </Box>
      </CardContent>
    </Card>
  )
}
