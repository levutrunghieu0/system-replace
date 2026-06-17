import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import Alert from '@mui/material/Alert'
import Box from '@mui/material/Box'
import MenuItem from '@mui/material/MenuItem'
import Paper from '@mui/material/Paper'
import Select from '@mui/material/Select'
import Snackbar from '@mui/material/Snackbar'
import Typography from '@mui/material/Typography'
import PlayArrowIcon from '@mui/icons-material/PlayArrow'
import { useTranslation } from 'react-i18next'
import { AppModal } from '../components/common/AppModal'
import { InventorySetupTabBar } from '../components/common/InventorySetupTabBar'
import { useLayoutConfig } from '../hooks/useLayoutConfig'

export const Route = createFileRoute('/inventory/handy')({
  component: HandySettingsPage,
})

const MOCK_HANDIES = ['未選択/手入力', 'KEYENCE (BT-500)', 'KEYENCE (BT-600)', 'KEYENCE (BT-2035)', 'CASIO (BT-7001D)', 'CASIO (DT-970)']

function HandySettingsPage() {
  const { t } = useTranslation()
  const [handyDevice, setHandyDevice] = useState('')
  const [appSend, setAppSend] = useState('')
  const [confirmDialog, setConfirmDialog] = useState(false)
  const [toast, setToast] = useState({ open: false, message: '' })

  useLayoutConfig({
    title: t('page.tanazaoroshi.handy.title'),
    actions: [
      {
        key: 'run',
        labelKey: 'page.tanazaoroshi.handy.action.run',
        position: 'right',
        variant: 'contained',
        color: 'success',
        startIcon: <PlayArrowIcon fontSize="small" />,
        disabled: !handyDevice,
        onClick: () => setConfirmDialog(true),
      },
    ],
  })

  const handleConfirm = () => {
    setConfirmDialog(false)
    setToast({ open: true, message: 'アプリ送受信が完了しました。' })
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <InventorySetupTabBar activeTab="handy" />

      <Box sx={{ flex: 1, overflow: 'auto', display: 'flex', flexDirection: 'column', gap: 2, maxWidth: 480 }}>
      <Paper variant="outlined" sx={{ p: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
        {/* Handy device select */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
          <Typography sx={{ fontSize: '0.82rem', fontWeight: 600 }}>
            {t('page.tanazaoroshi.handy.handyChange')}
          </Typography>
          <Select
            size="small"
            value={handyDevice}
            onChange={(e) => setHandyDevice(e.target.value)}
            displayEmpty
            sx={{ fontSize: '0.85rem' }}
          >
            <MenuItem value="" disabled>
              <Typography sx={{ fontSize: '0.85rem', color: 'text.secondary' }}>選択してください</Typography>
            </MenuItem>
            {MOCK_HANDIES.map((h) => (
              <MenuItem key={h} value={h} sx={{ fontSize: '0.85rem' }}>
                {h}
              </MenuItem>
            ))}
          </Select>
        </Box>

        {/* App send select */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
          <Typography sx={{ fontSize: '0.82rem', fontWeight: 600 }}>
            {t('page.tanazaoroshi.handy.appSend')}
          </Typography>
          <Select
            size="small"
            value={appSend}
            onChange={(e) => setAppSend(e.target.value)}
            displayEmpty
            sx={{ fontSize: '0.85rem' }}
          >
            <MenuItem value="" disabled>
              <Typography sx={{ fontSize: '0.85rem', color: 'text.secondary' }}>選択してください</Typography>
            </MenuItem>
            {['棚卸アプリv2.1', '棚卸アプリv2.0', '棚卸アプリv1.9'].map((a) => (
              <MenuItem key={a} value={a} sx={{ fontSize: '0.85rem' }}>
                {a}
              </MenuItem>
            ))}
          </Select>
        </Box>
      </Paper>

      {handyDevice && appSend && (
        <Alert severity="info" sx={{ fontSize: '0.82rem' }}>
          選択：{handyDevice}　→　{appSend}
        </Alert>
      )}

      <AppModal
        open={confirmDialog}
        onClose={() => setConfirmDialog(false)}
        title={t('page.tanazaoroshi.handy.title')}
        actions={[
          { label: t('page.tanazaoroshi.handy.dialog.cancel'), onClick: () => setConfirmDialog(false), color: 'inherit' },
          { label: t('page.tanazaoroshi.handy.dialog.ok'), onClick: handleConfirm, variant: 'contained' },
        ]}
      >
        <Typography sx={{ fontSize: '0.9rem' }}>
          {t('page.tanazaoroshi.handy.dialog.confirm')}
        </Typography>
      </AppModal>

      <Snackbar
        open={toast.open}
        autoHideDuration={3000}
        onClose={() => setToast((p) => ({ ...p, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
      >
        <Alert severity="success" variant="filled" sx={{ fontSize: '0.85rem' }}>
          {toast.message}
        </Alert>
      </Snackbar>
      </Box>
    </Box>
  )
}
