import { createFileRoute } from '@tanstack/react-router'
import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import Divider from '@mui/material/Divider'
import Grid from '@mui/material/Grid'
import Chip from '@mui/material/Chip'
import Button from '@mui/material/Button'
import Stack from '@mui/material/Stack'
import PaletteIcon from '@mui/icons-material/Palette'
import PageHeader from '../components/common/PageHeader'

export const Route = createFileRoute('/about')({
  component: AboutPage,
})

function AboutPage() {
  return (
    <Box>
      <PageHeader title="About" subtitle="Typography, theme tokens, and MUI v9 color scheme showcase." />

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 8 }}>
          <Card sx={{ mb: 3 }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="overline" color="primary">
                Typography Scale
              </Typography>
              <Divider sx={{ my: 1.5 }} />
              {(['h1', 'h2', 'h3', 'h4', 'h5', 'h6'] as const).map((variant) => (
                <Typography key={variant} variant={variant} sx={{ display: 'block' }} gutterBottom>
                  {variant.toUpperCase()} — The quick brown fox
                </Typography>
              ))}
              <Divider sx={{ my: 2 }} />
              <Typography variant="subtitle1" gutterBottom>
                Subtitle 1 — Used for secondary headings
              </Typography>
              <Typography variant="subtitle2" gutterBottom>
                Subtitle 2 — Compact secondary heading
              </Typography>
              <Typography variant="body1" sx={{ mb: 2 }}>
                Body 1 — The standard body text. Lorem ipsum dolor sit amet, consectetur
                adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Body 2 (secondary) — Smaller body text used for supporting information and
                descriptions. Typically rendered with reduced opacity.
              </Typography>
              <Typography variant="caption" sx={{ display: 'block' }} gutterBottom>
                Caption — Smallest text, used for labels and metadata
              </Typography>
              <Typography variant="overline" sx={{ display: 'block' }}>
                Overline — Section label with letter spacing
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 4 }}>
          <Card sx={{ mb: 3 }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="overline" color="primary">
                Color Palette
              </Typography>
              <Divider sx={{ my: 1.5 }} />
              {(
                [
                  { label: 'Primary', bg: 'primary.main', color: 'primary.contrastText' },
                  { label: 'Secondary', bg: 'secondary.main', color: 'secondary.contrastText' },
                  { label: 'Error', bg: 'error.main', color: 'error.contrastText' },
                  { label: 'Warning', bg: 'warning.main', color: 'warning.contrastText' },
                  { label: 'Info', bg: 'info.main', color: 'info.contrastText' },
                  { label: 'Success', bg: 'success.main', color: 'success.contrastText' },
                ] as const
              ).map(({ label, bg, color }) => (
                <Box
                  key={label}
                  sx={{ p: 1.5, mb: 1, borderRadius: 2, backgroundColor: bg, color }}
                >
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    {label}
                  </Typography>
                </Box>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="overline" color="primary">
                <PaletteIcon sx={{ fontSize: 14, mr: 0.5, verticalAlign: 'middle' }} />
                Button Variants
              </Typography>
              <Divider sx={{ my: 1.5 }} />
              <Stack spacing={1.5}>
                <Button variant="contained" fullWidth>Contained</Button>
                <Button variant="outlined" fullWidth>Outlined</Button>
                <Button variant="text" fullWidth>Text</Button>
                <Stack direction="row" spacing={1}>
                  <Chip label="Primary" color="primary" size="small" />
                  <Chip label="Success" color="success" size="small" />
                  <Chip label="Error" color="error" size="small" />
                </Stack>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  )
}
