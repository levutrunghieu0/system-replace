import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import Alert from '@mui/material/Alert'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Paper from '@mui/material/Paper'
import Snackbar from '@mui/material/Snackbar'
import Typography from '@mui/material/Typography'
import DownloadingIcon from '@mui/icons-material/Downloading'
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutlined'
import { useTranslation } from 'react-i18next'
import { AppModal } from '../components/common/AppModal'
import { useLayoutConfig } from '../hooks/useLayoutConfig'

export const Route = createFileRoute('/inventory/data-receive')({
  component: DataReceivePage,
})

function DataReceivePage() {
  const { t } = useTranslation()
  const [confirmDialog, setConfirmDialog] = useState(false)
  const [received, setReceived] = useState(false)
  const [toast, setToast] = useState({ open: false, message: '' })

  useLayoutConfig({
    title: t('page.tanazaoroshi.dataReceive.title'),
  })

  const handleReceive = () => {
    setConfirmDialog(false)
    setTimeout(() => {
      setReceived(true)
      setToast({ open: true, message: t('page.tanazaoroshi.dataReceive.toast.received') })
    }, 800)
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <Paper
        variant="outlined"
        sx={{
          p: 4,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 2,
          minHeight: 200,
          justifyContent: 'center',
        }}
      >
        {received ? (
          <>
            <CheckCircleOutlineIcon sx={{ fontSize: 56, color: 'success.main' }} />
            <Typography sx={{ fontWeight: 700, fontSize: '1rem', color: 'success.main' }}>
              データ受信完了
            </Typography>
            <Typography sx={{ fontSize: '0.85rem', color: 'text.secondary' }}>
              受信日時：{new Date().toLocaleString('ja-JP')}
            </Typography>
          </>
        ) : (
          <>
            <DownloadingIcon sx={{ fontSize: 56, color: 'text.disabled' }} />
            <Typography sx={{ fontSize: '0.85rem', color: 'text.secondary' }}>
              ハンディスキャナのデータを受信するには「受信」ボタンを押してください。
            </Typography>
          </>
        )}
      </Paper>

      <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
        <Button size="small" variant="outlined" startIcon={<DownloadingIcon fontSize="small" />}
          onClick={() => setConfirmDialog(true)}>
          {t('page.tanazaoroshi.dataReceive.action.receive')}
        </Button>
        <Button size="small" variant="contained" color="success" startIcon={<CheckCircleOutlineIcon fontSize="small" />}
          disabled={!received}
          onClick={() => setToast({ open: true, message: '棚卸データを確定しました。' })}>
          {t('page.tanazaoroshi.dataReceive.action.confirm')}
        </Button>
      </Box>

      <AppModal
        open={confirmDialog}
        onClose={() => setConfirmDialog(false)}
        title={t('page.tanazaoroshi.dataReceive.action.receive')}
        actions={[
          { label: t('page.tanazaoroshi.dataReceive.dialog.no'), onClick: () => setConfirmDialog(false), color: 'inherit' },
          { label: t('page.tanazaoroshi.dataReceive.dialog.yes'), onClick: handleReceive, variant: 'contained' },
        ]}
      >
        <Typography sx={{ fontSize: '0.9rem' }}>
          {t('page.tanazaoroshi.dataReceive.dialog.confirm')}
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
  )
}
