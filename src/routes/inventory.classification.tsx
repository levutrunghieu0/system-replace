import { createFileRoute } from '@tanstack/react-router'
import { useState, useMemo, useCallback } from 'react'
import type { ColumnDef } from '@tanstack/react-table'
import Alert from '@mui/material/Alert'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Checkbox from '@mui/material/Checkbox'
import Chip from '@mui/material/Chip'
import Paper from '@mui/material/Paper'
import Snackbar from '@mui/material/Snackbar'
import Typography from '@mui/material/Typography'
import PlayArrowIcon from '@mui/icons-material/PlayArrow'
import { useTranslation } from 'react-i18next'
import { AppTable } from '../components/table'
import { AppModal } from '../components/common/AppModal'
import { InventorySetupTabBar } from '../components/common/InventorySetupTabBar'
import { useLayoutConfig } from '../hooks/useLayoutConfig'

export const Route = createFileRoute('/inventory/classification')({
  component: ClassificationSettingsPage,
})

interface SubCategory {
  id: string
  name: string
  month: string
  status: 'done' | 'notDone' | 'none'
}

const MOCK_CATEGORIES: SubCategory[] = [
  { id: '01', name: '衣料（婦人）', month: '2026-05', status: 'notDone' },
  { id: '02', name: '衣料（紳士）', month: '2026-05', status: 'notDone' },
  { id: '03', name: '服飾雑貨', month: '2026-05', status: 'done' },
  { id: '04', name: 'バッグ・財布', month: '2026-05', status: 'done' },
  { id: '05', name: 'シューズ', month: '2026-05', status: 'notDone' },
  { id: '06', name: 'アクセサリー', month: '2026-05', status: 'notDone' },
  { id: '07', name: 'キッズ', month: '2026-04', status: 'none' },
  { id: '08', name: 'スポーツ', month: '2026-04', status: 'none' },
]

function ClassificationSettingsPage() {
  const { t } = useTranslation()
  const [selected, setSelected] = useState<Set<string>>(new Set(['01', '02', '05', '06']))
  const [initDialog, setInitDialog] = useState(false)
  const [initialized, setInitialized] = useState(false)
  const [toast, setToast] = useState({ open: false, message: '', severity: 'success' as 'success' | 'info' })

  useLayoutConfig({ title: t('page.tanazaoroshi.classification.title') })

  const total = MOCK_CATEGORIES.length
  const doneCount = MOCK_CATEGORIES.filter((c) => c.status === 'done').length
  const notDoneCount = MOCK_CATEGORIES.filter((c) => c.status === 'notDone').length

  const toggle = useCallback((id: string) =>
    setSelected((prev) => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n }), [])

  const handleInitialize = () => {
    setSelected(new Set())
    setInitialized(true)
    setInitDialog(false)
    setToast({ open: true, message: t('page.tanazaoroshi.classification.toast.initialized'), severity: 'info' })
  }

  const classColumns = useMemo<ColumnDef<SubCategory>[]>(() => [
    {
      id: 'select',
      size: 48,
      header: '',
      cell: ({ row }) => (
        <Checkbox
          size="small"
          checked={selected.has(row.original.id)}
          onChange={() => toggle(row.original.id)}
          onClick={(e) => e.stopPropagation()}
        />
      ),
      meta: { cellSx: { padding: '0 8px' } },
    },
    {
      accessorKey: 'id',
      header: '小分類コード',
      cell: ({ getValue }) => <Typography sx={{ fontSize: '0.82rem' }}>{getValue<string>()}</Typography>,
      meta: { headerSx: { fontSize: '0.75rem', fontWeight: 600, color: 'text.secondary' }, cellSx: { py: 0.75, px: 1.5 } },
    },
    {
      accessorKey: 'name',
      header: '小分類名',
      cell: ({ getValue }) => <Typography sx={{ fontSize: '0.82rem' }}>{getValue<string>()}</Typography>,
      meta: { headerSx: { fontSize: '0.75rem', fontWeight: 600, color: 'text.secondary' }, cellSx: { py: 0.75, px: 1.5 } },
    },
    {
      accessorKey: 'month',
      header: '棚卸月',
      cell: ({ getValue }) => <Typography sx={{ fontSize: '0.82rem' }}>{getValue<string>()}</Typography>,
      meta: { headerSx: { fontSize: '0.75rem', fontWeight: 600, color: 'text.secondary' }, cellSx: { py: 0.75, px: 1.5 } },
    },
    {
      id: 'status',
      header: '棚卸状況',
      cell: ({ row }) => {
        const s = row.original.status
        if (s === 'done')    return <Chip label={t('page.tanazaoroshi.classification.stats.done')}    size="small" color="success" variant="outlined" sx={{ fontSize: '0.72rem', height: 20 }} />
        if (s === 'notDone') return <Chip label={t('page.tanazaoroshi.classification.stats.notDone')} size="small" color="warning" variant="outlined" sx={{ fontSize: '0.72rem', height: 20 }} />
        return <Typography sx={{ fontSize: '0.78rem', color: 'text.disabled' }}>ー</Typography>
      },
      meta: { headerSx: { fontSize: '0.75rem', fontWeight: 600, color: 'text.secondary' }, cellSx: { py: 0.75, px: 1.5 } },
    },
  ], [selected, toggle, t])

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <InventorySetupTabBar activeTab="classification" />

      <Box sx={{ flex: 1, overflow: 'auto', display: 'flex', flexDirection: 'column', gap: 1.5 }}>
      {/* Notes */}
      <Paper variant="outlined" sx={{ p: 1.5, bgcolor: 'warning.50', borderColor: 'warning.200' }}>
        <Typography sx={{ fontSize: '0.80rem', color: 'text.secondary' }}>
          ※ 新規に棚卸業務を開始するときは、必ず「初期化」キーを押して下さい。
        </Typography>
        <Typography sx={{ fontSize: '0.80rem', color: 'text.secondary', mt: 0.25 }}>
          ※ 実施月で絞込と、棚卸実施基準で指定されている小分類だけが表示されます。
        </Typography>
      </Paper>

      {/* Status alert */}
      <Alert severity={initialized ? 'info' : 'warning'} sx={{ fontSize: '0.82rem' }}>
        {t('page.tanazaoroshi.classification.statusToast')}
      </Alert>

      {/* Filter chip + stats */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
        <Chip
          label={t('page.tanazaoroshi.classification.filterChip')}
          size="small"
          variant="outlined"
          color="primary"
        />
        <Typography sx={{ fontSize: '0.78rem', color: 'text.secondary' }}>
          {t('page.tanazaoroshi.classification.stats.total')}：{total}　
          {t('page.tanazaoroshi.classification.stats.selected')}：{selected.size}　
          {t('page.tanazaoroshi.classification.stats.done')}：{doneCount}　
          {t('page.tanazaoroshi.classification.stats.notDone')}：{notDoneCount}
        </Typography>
      </Box>

      {/* Classification table */}
      <AppTable<SubCategory>
        data={MOCK_CATEGORIES}
        columns={classColumns}
        getRowId={(row) => row.id}
        stickyHeader
        containerMaxHeight={380}
        dense
        onRowClick={(row) => toggle(row.id)}
      />

      {/* Toolbar */}
      <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
        <Button size="small" variant="outlined" onClick={() => setSelected(new Set(MOCK_CATEGORIES.map((c) => c.id)))}>
          {t('page.tanazaoroshi.classification.action.selectAll')}
        </Button>
        <Button size="small" variant="outlined" onClick={() => setSelected(new Set())}>
          {t('page.tanazaoroshi.classification.action.clearAll')}
        </Button>
        <Button size="small" variant="outlined" color="error" onClick={() => setInitDialog(true)}>
          {t('page.tanazaoroshi.classification.action.initialize')}
        </Button>
        <Button
          size="small" variant="contained" color="success"
          startIcon={<PlayArrowIcon fontSize="small" />}
          disabled={selected.size === 0}
          onClick={() => setToast({ open: true, message: t('page.tanazaoroshi.classification.toast.saved'), severity: 'success' })}
        >
          {t('page.tanazaoroshi.classification.action.run')}
        </Button>
      </Box>

      {/* Initialize dialog */}
      <AppModal
        open={initDialog}
        onClose={() => setInitDialog(false)}
        title={t('page.tanazaoroshi.classification.action.initialize')}
        actions={[
          { label: t('page.tanazaoroshi.classification.dialog.no'), onClick: () => setInitDialog(false), color: 'inherit' },
          { label: t('page.tanazaoroshi.classification.dialog.yes'), onClick: handleInitialize, variant: 'contained', color: 'error' },
        ]}
      >
        <Typography sx={{ fontSize: '0.9rem' }}>{t('page.tanazaoroshi.classification.dialog.initConfirm')}</Typography>
      </AppModal>

      <Snackbar
        open={toast.open}
        autoHideDuration={3000}
        onClose={() => setToast((p) => ({ ...p, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
      >
        <Alert severity={toast.severity} variant="filled" sx={{ fontSize: '0.85rem' }}>
          {toast.message}
        </Alert>
      </Snackbar>
      </Box>
    </Box>
  )
}
