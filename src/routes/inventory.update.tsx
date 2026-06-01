import { createFileRoute } from '@tanstack/react-router'
import { useState, useMemo } from 'react'
import type { ColumnDef } from '@tanstack/react-table'
import Alert from '@mui/material/Alert'
import Box from '@mui/material/Box'
import Chip from '@mui/material/Chip'
import Snackbar from '@mui/material/Snackbar'
import Typography from '@mui/material/Typography'
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutlined'
import { useTranslation } from 'react-i18next'
import { AppTable } from '../components/table'
import { AppModal } from '../components/common/AppModal'
import { useLayoutConfig } from '../hooks/useLayoutConfig'

export const Route = createFileRoute('/inventory/update')({
  component: InventoryUpdatePage,
})

interface UpdateTarget {
  id: string
  name: string
  count: number
  status: 'ready' | 'done'
}

const MOCK_TARGETS: UpdateTarget[] = [
  { id: '01', name: '衣料（婦人）', count: 142, status: 'ready' },
  { id: '02', name: '衣料（紳士）', count: 98, status: 'ready' },
  { id: '05', name: 'シューズ', count: 57, status: 'ready' },
  { id: '06', name: 'アクセサリー', count: 33, status: 'ready' },
]

function InventoryUpdatePage() {
  const { t } = useTranslation()
  const [confirmDialog, setConfirmDialog] = useState(false)
  const [completed, setCompleted] = useState(false)
  const [toast, setToast] = useState({ open: false, message: '' })

  useLayoutConfig({
    title: t('page.tanazaoroshi.update.title'),
    actions: [
      {
        key: 'confirm',
        labelKey: 'page.tanazaoroshi.update.action.confirm',
        position: 'right',
        variant: 'contained',
        color: 'success',
        startIcon: <CheckCircleOutlineIcon fontSize="small" />,
        disabled: completed,
        sx: { minWidth: 'unset' },
        onClick: () => setConfirmDialog(true),
      },
    ],
  })

  const columns = useMemo<ColumnDef<UpdateTarget>[]>(() => [
    {
      accessorKey: 'id',
      header: '小分類コード',
      meta: { headerSx: { fontSize: '0.75rem', fontWeight: 600, color: 'text.secondary' }, cellSx: { fontSize: '0.82rem' } },
    },
    {
      accessorKey: 'name',
      header: '小分類名',
      meta: { headerSx: { fontSize: '0.75rem', fontWeight: 600, color: 'text.secondary' }, cellSx: { fontSize: '0.82rem' } },
    },
    {
      accessorKey: 'count',
      header: 'スキャン数',
      cell: ({ getValue }) => (
        <Typography sx={{ fontSize: '0.82rem', fontWeight: 700, textAlign: 'right' }}>
          {(getValue<number>()).toLocaleString()}
        </Typography>
      ),
      meta: { headerSx: { fontSize: '0.75rem', fontWeight: 600, color: 'text.secondary', textAlign: 'right' }, cellSx: { textAlign: 'right' } },
    },
    {
      id: 'status',
      header: '状況',
      cell: () => completed ? (
        <Chip label="更新済" size="small" color="success" variant="outlined" sx={{ fontSize: '0.72rem', height: 20 }} />
      ) : (
        <Chip label="更新待ち" size="small" color="warning" variant="outlined" sx={{ fontSize: '0.72rem', height: 20 }} />
      ),
      meta: { headerSx: { fontSize: '0.75rem', fontWeight: 600, color: 'text.secondary' }, cellSx: { fontSize: '0.82rem' } },
    },
  ], [completed])

  const handleConfirm = () => {
    setConfirmDialog(false)
    setCompleted(true)
    setToast({ open: true, message: t('page.tanazaoroshi.update.toast.completed') })
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
      {completed && (
        <Alert severity="success" sx={{ fontSize: '0.82rem' }}>
          棚卸更新が完了しました。
        </Alert>
      )}

      <Typography sx={{ fontSize: '0.85rem', fontWeight: 600 }}>
        {t('page.tanazaoroshi.update.subCategoryList')}
      </Typography>

      <AppTable<UpdateTarget>
        data={MOCK_TARGETS}
        columns={columns}
        getRowId={(row) => row.id}
        stickyHeader
        containerMaxHeight={320}
        dense
      />

      <Typography sx={{ fontSize: '0.78rem', color: 'text.secondary' }}>
        合計：{MOCK_TARGETS.reduce((s, t) => s + t.count, 0).toLocaleString()} 件
      </Typography>

      {/* Confirm dialog */}
      <AppModal
        open={confirmDialog}
        onClose={() => setConfirmDialog(false)}
        title={t('page.tanazaoroshi.update.action.confirm')}
        actions={[
          { label: t('page.tanazaoroshi.update.dialog.no'), onClick: () => setConfirmDialog(false), color: 'inherit' },
          { label: t('page.tanazaoroshi.update.dialog.yes'), onClick: handleConfirm, variant: 'contained', color: 'success' },
        ]}
      >
        <Typography sx={{ fontSize: '0.9rem' }}>
          {t('page.tanazaoroshi.update.dialog.confirm')}
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
