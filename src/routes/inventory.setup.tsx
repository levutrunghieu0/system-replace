import { createFileRoute } from '@tanstack/react-router'
import { useState, useEffect, useMemo, useCallback } from 'react'
import type { ColumnDef } from '@tanstack/react-table'
import Alert from '@mui/material/Alert'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Checkbox from '@mui/material/Checkbox'
import Chip from '@mui/material/Chip'
import Divider from '@mui/material/Divider'
import IconButton from '@mui/material/IconButton'
import InputAdornment from '@mui/material/InputAdornment'
import MenuItem from '@mui/material/MenuItem'
import Paper from '@mui/material/Paper'
import Select from '@mui/material/Select'
import Snackbar from '@mui/material/Snackbar'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import QrCodeScannerIcon from '@mui/icons-material/QrCodeScanner'
import FullscreenIcon from '@mui/icons-material/Fullscreen'
import FullscreenExitIcon from '@mui/icons-material/FullscreenExit'
import BadgeIcon from '@mui/icons-material/Badge'
import TableRowsIcon from '@mui/icons-material/TableRows'
import CategoryIcon from '@mui/icons-material/Category'
import PhonelinkSetupIcon from '@mui/icons-material/PhonelinkSetup'
import DeleteOutlinedIcon from '@mui/icons-material/DeleteOutlined'
import LockIcon from '@mui/icons-material/Lock'
import PlayArrowIcon from '@mui/icons-material/PlayArrow'
import { useTranslation } from 'react-i18next'
import { AppTable } from '../components/table'
import { AppModal } from '../components/common/AppModal'
import { useLayoutConfig } from '../hooks/useLayoutConfig'

export const Route = createFileRoute('/inventory/setup')({
  component: TanazaoroshiSetupPage,
})

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────
type SetupTab = 'shelf' | 'classification' | 'handy'
type ActionMode = 'none' | 'excludeRegister' | 'excludeRelease'
interface ExcludedShelf { id: number; number: string }
interface SubCategory { id: string; name: string; month: string; status: 'done' | 'notDone' | 'none' }

// ─────────────────────────────────────────────
// Mock data
// ─────────────────────────────────────────────
const MOCK_CATEGORIES: SubCategory[] = [
  { id: '01', name: '衣料（婦人）', month: '2026-05', status: 'notDone' },
  { id: '02', name: '衣料（紳士）', month: '2026-05', status: 'notDone' },
  { id: '03', name: '服飾雑貨',   month: '2026-05', status: 'done'    },
  { id: '04', name: 'バッグ・財布', month: '2026-05', status: 'done'  },
  { id: '05', name: 'シューズ',    month: '2026-05', status: 'notDone' },
  { id: '06', name: 'アクセサリー', month: '2026-05', status: 'notDone' },
  { id: '07', name: 'キッズ',      month: '2026-04', status: 'none'   },
  { id: '08', name: 'スポーツ',    month: '2026-04', status: 'none'   },
]
const MOCK_HANDIES = ['未選択/手入力', 'KEYENCE (BT-500)', 'KEYENCE (BT-600)', 'KEYENCE (BT-2035)', 'CASIO (BT-7001D)', 'CASIO (DT-970)']

// ─────────────────────────────────────────────
// Main Page
// ─────────────────────────────────────────────
function TanazaoroshiSetupPage() {
  const { t } = useTranslation()
  const [activeTab,  setActiveTab]  = useState<SetupTab>('shelf')
  const [empCode,    setEmpCode]    = useState('')
  const [empConfirmed, setEmpConfirmed] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [toast, setToast] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' | 'info' })

  useLayoutConfig({ title: t('page.tanazaoroshi.setup.title') })

  // Track fullscreen change
  useEffect(() => {
    const handler = () => setIsFullscreen(!!document.fullscreenElement)
    document.addEventListener('fullscreenchange', handler)
    return () => document.removeEventListener('fullscreenchange', handler)
  }, [])

  const handleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {})
    } else {
      document.exitFullscreen().catch(() => {})
    }
  }

  const handleEmpScan = () => {
    if (!empCode.trim()) return
    setEmpConfirmed(true)
    showToast(`担当者 ${empCode} を確認しました`, 'success')
  }

  const showToast = (message: string, severity: 'success' | 'error' | 'info' = 'success') =>
    setToast({ open: true, message, severity })

  const TAB_CONFIG: { key: SetupTab; icon: React.ReactNode; label: string }[] = [
    { key: 'shelf',          icon: <TableRowsIcon     fontSize="small" />, label: t('page.tanazaoroshi.shelfRegistration.title') },
    { key: 'classification', icon: <CategoryIcon      fontSize="small" />, label: t('page.tanazaoroshi.classification.title')    },
    { key: 'handy',          icon: <PhonelinkSetupIcon fontSize="small" />, label: t('page.tanazaoroshi.handy.title')            },
  ]

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>

      {/* ── Top bar: employee scan + fullscreen ── */}
      <Paper variant="outlined" sx={{ borderRadius: 0, borderLeft: 0, borderRight: 0, borderTop: 0 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, px: 2, py: 1 }}>
          <BadgeIcon sx={{ color: 'text.secondary', fontSize: '1.2rem' }} />
          <TextField
            size="small"
            value={empCode}
            onChange={(e) => setEmpCode(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleEmpScan()}
            placeholder="担当者コードをスキャン"
            slotProps={{ input: { startAdornment: (
                <InputAdornment position="start">
                  <QrCodeScannerIcon fontSize="small" sx={{ color: 'text.secondary' }} />
                </InputAdornment>
              ) } }}
            sx={{ width: 240 }}
          />
          {empConfirmed && (
            <Chip
              label={`担当者：${empCode}`}
              size="small"
              color="success"
              variant="outlined"
              onDelete={() => { setEmpCode(''); setEmpConfirmed(false) }}
            />
          )}
          <Box sx={{ ml: 'auto' }}>
            <IconButton size="small" onClick={handleFullscreen} title={isFullscreen ? '全画面解除' : '全画面表示'}>
              {isFullscreen ? <FullscreenExitIcon /> : <FullscreenIcon />}
            </IconButton>
          </Box>
        </Box>
      </Paper>

      {/* ── Tab content ── */}
      <Box sx={{ flex: 1, overflow: 'auto', p: 2 }}>
        {!empConfirmed ? (
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: 2 }}>
            <LockIcon sx={{ fontSize: 56, color: 'text.disabled', opacity: 0.5 }} />
            <Typography sx={{ fontSize: '0.9rem', color: 'text.secondary' }}>
              作業を開始するには担当者認証を行ってください
            </Typography>
          </Box>
        ) : (
          <>
            {activeTab === 'shelf'          && <ShelfPanel          showToast={showToast} />}
            {activeTab === 'classification' && <ClassificationPanel showToast={showToast} />}
            {activeTab === 'handy'          && <HandyPanel          showToast={showToast} />}
          </>
        )}
      </Box>

      {/* ── Bottom tab bar ── */}
      <Paper elevation={4} sx={{ position: 'sticky', bottom: 0, borderTop: '1px solid', borderColor: 'divider' }}>
        <Box sx={{ display: 'flex' }}>
          {TAB_CONFIG.map((tab, i) => (
            <Button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              startIcon={tab.icon}
              sx={{
                flex: 1,
                py: 1.5,
                borderRadius: 0,
                borderRight: i < TAB_CONFIG.length - 1 ? '1px solid' : 'none',
                borderColor: 'divider',
                fontSize: '0.82rem',
                fontWeight: activeTab === tab.key ? 700 : 400,
                color: activeTab === tab.key ? 'primary.main' : 'text.secondary',
                bgcolor: activeTab === tab.key ? 'primary.50' : 'transparent',
                borderBottom: activeTab === tab.key ? '3px solid' : '3px solid transparent',
                borderBottomColor: activeTab === tab.key ? 'primary.main' : 'transparent',
                '&:hover': { bgcolor: 'action.hover' },
              }}
            >
              {tab.label}
            </Button>
          ))}
        </Box>
      </Paper>

      {/* ── Global toast ── */}
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
  )
}

// ═══════════════════════════════════════════════════════════════
// A. Shelf Registration Panel (棚番登録)
// ═══════════════════════════════════════════════════════════════
function ShelfPanel({ showToast }: { showToast: (msg: string, sev?: 'success' | 'error' | 'info') => void }) {
  const { t } = useTranslation()
  const [shelfFrom,       setShelfFrom]       = useState('')
  const [shelfTo,         setShelfTo]         = useState('')
  const [levelFrom,       setLevelFrom]       = useState('')
  const [levelTo,         setLevelTo]         = useState('')
  const [registeredStart, setRegisteredStart] = useState<string | null>(null)
  const [registeredEnd,   setRegisteredEnd]   = useState<string | null>(null)
  const [actionMode,      setActionMode]      = useState<ActionMode>('none')
  const [excluded,        setExcluded]        = useState<ExcludedShelf[]>([
    { id: 1, number: '005-01' },
    { id: 2, number: '100-05' },
  ])
  const [scanInput,  setScanInput]  = useState('')
  const [initDialog, setInitDialog] = useState(false)

  const sectionTitleSx = { fontWeight: 700, fontSize: '0.85rem', mb: 1 }
  const labelSx = { fontSize: '0.8rem', color: 'text.secondary', width: 64, flexShrink: 0 }

  const handleRegister = () => {
    if (!shelfFrom || !shelfTo) return
    setRegisteredStart(shelfFrom)
    setRegisteredEnd(shelfTo)
    showToast(t('page.tanazaoroshi.shelfRegistration.toast.registered'))
    setActionMode('none')
  }

  const handleExcludeToggle = (mode: 'excludeRegister' | 'excludeRelease') =>
    setActionMode((prev) => (prev === mode ? 'none' : mode))

  const handleShelfScan = () => {
    const num = scanInput.trim()
    if (!num) return
    if (actionMode === 'excludeRegister') {
      setExcluded((prev) => [...prev, { id: Date.now(), number: num }])
      showToast(t('page.tanazaoroshi.shelfRegistration.toast.excluded'))
    } else if (actionMode === 'excludeRelease') {
      setExcluded((prev) => prev.filter((e) => e.number !== num))
      showToast(t('page.tanazaoroshi.shelfRegistration.toast.released'), 'info')
    }
    setScanInput('')
    setActionMode('none')
  }

  const handleInitialize = () => {
    setShelfFrom(''); setShelfTo(''); setLevelFrom(''); setLevelTo('')
    setRegisteredStart(null); setRegisteredEnd(null); setExcluded([])
    setInitDialog(false)
    showToast('初期化しました。', 'info')
  }

  const excludedColumns = useMemo<ColumnDef<ExcludedShelf>[]>(() => [
    {
      accessorKey: 'number',
      header: t('page.tanazaoroshi.shelfRegistration.excludedList'),
      meta: { headerSx: { fontSize: '0.75rem', fontWeight: 600, color: 'text.secondary', py: 0.5, px: 1.5 }, cellSx: { fontSize: '0.82rem', py: 0.5, px: 1.5 } },
    },
    {
      id: 'delete',
      header: '',
      size: 40,
      cell: ({ row }) => (
        <IconButton size="small" onClick={() => setExcluded((prev) => prev.filter((x) => x.id !== row.original.id))}>
          <DeleteOutlinedIcon fontSize="small" sx={{ color: 'text.disabled' }} />
        </IconButton>
      ),
      meta: { cellSx: { py: 0.5, px: 0.5, textAlign: 'center' } },
    },
  ], [t])

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      {actionMode !== 'none' && (
        <Alert severity="info" sx={{ fontSize: '0.82rem' }}>
          {actionMode === 'excludeRegister'
            ? '除外登録モード：棚番をスキャンして除外番号として登録します'
            : '除外解除モード：解除したい棚番をスキャンしてください'}
        </Alert>
      )}

      <Paper variant="outlined" sx={{ p: 2 }}>
        {/* Shelf range settings */}
        <Typography sx={sectionTitleSx}>{t('page.tanazaoroshi.shelfRegistration.rangeSection')}</Typography>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
          <Typography sx={labelSx}>{t('page.tanazaoroshi.shelfRegistration.shelfNo')}</Typography>
          <TextField size="small" placeholder={t('page.tanazaoroshi.shelfRegistration.from')}
            value={shelfFrom} onChange={(e) => setShelfFrom(e.target.value)} sx={{ width: 100 }} />
          <Typography sx={{ fontSize: '0.8rem', color: 'text.secondary' }}>〜</Typography>
          <TextField size="small" placeholder={t('page.tanazaoroshi.shelfRegistration.to')}
            value={shelfTo} onChange={(e) => setShelfTo(e.target.value)} sx={{ width: 100 }} />
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
          <Typography sx={labelSx}>{t('page.tanazaoroshi.shelfRegistration.shelfLevel')}</Typography>
          <TextField size="small" placeholder={t('page.tanazaoroshi.shelfRegistration.from')}
            value={levelFrom} onChange={(e) => setLevelFrom(e.target.value)} sx={{ width: 100 }} />
          <Typography sx={{ fontSize: '0.8rem', color: 'text.secondary' }}>〜</Typography>
          <TextField size="small" placeholder={t('page.tanazaoroshi.shelfRegistration.to')}
            value={levelTo} onChange={(e) => setLevelTo(e.target.value)} sx={{ width: 100 }} />
        </Box>

        {/* Registered range display */}
        {registeredStart && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
            <Typography sx={{ fontSize: '0.8rem', color: 'text.secondary' }}>
              {t('page.tanazaoroshi.shelfRegistration.registered')}：
            </Typography>
            <Chip label={`${registeredStart} 〜 ${registeredEnd}`} size="small" color="primary" variant="outlined" />
          </Box>
        )}

        <Divider sx={{ my: 1.5 }} />

        {/* Excluded shelves */}
        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
            <Box sx={{ flex: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                <Typography sx={{ ...sectionTitleSx, mb: 0 }}>
                  {t('page.tanazaoroshi.shelfRegistration.excluded')}
                </Typography>
                <Typography sx={{ fontSize: '0.78rem', color: 'text.secondary' }}>
                  {t('page.tanazaoroshi.shelfRegistration.excludedCount')}：{excluded.length}　
                  {t('page.tanazaoroshi.shelfRegistration.excludedTarget')}：
                  {registeredStart ? `${registeredStart}〜${registeredEnd}` : 'ー'}
                </Typography>
              </Box>
              <AppTable<ExcludedShelf>
                data={excluded}
                columns={excludedColumns}
                getRowId={(row) => String(row.id)}
                stickyHeader
                containerMaxHeight={160}
                dense
                emptyMessage="除外棚番なし"
              />
            </Box>
        </Box>
      </Paper>

      {/* Scan input in action mode */}
      {actionMode !== 'none' && (
        <Box sx={{ display: 'flex', gap: 1 }}>
          <TextField
            size="small"
            autoFocus
            value={scanInput}
            onChange={(e) => setScanInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleShelfScan()}
            placeholder="棚番をスキャンまたは入力"
            slotProps={{ input: { startAdornment: <InputAdornment position="start"><QrCodeScannerIcon fontSize="small" sx={{ color: 'text.secondary' }} /></InputAdornment> } }}
            sx={{ width: 260 }}
          />
          <Button variant="contained" size="small" onClick={handleShelfScan} disabled={!scanInput.trim()}>
            確定
          </Button>
        </Box>
      )}

      {/* Action buttons */}
      <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
        <Button variant="contained" size="small" onClick={handleRegister} disabled={!shelfFrom || !shelfTo}>
          {t('page.tanazaoroshi.shelfRegistration.action.register')}
        </Button>
        <Button
          variant={actionMode === 'excludeRegister' ? 'contained' : 'outlined'}
          color={actionMode === 'excludeRegister' ? 'warning' : 'inherit'}
          size="small"
          onClick={() => handleExcludeToggle('excludeRegister')}
        >
          {t('page.tanazaoroshi.shelfRegistration.action.excludeRegister')}
        </Button>
        <Button
          variant={actionMode === 'excludeRelease' ? 'contained' : 'outlined'}
          color={actionMode === 'excludeRelease' ? 'info' : 'inherit'}
          size="small"
          onClick={() => handleExcludeToggle('excludeRelease')}
        >
          {t('page.tanazaoroshi.shelfRegistration.action.excludeRelease')}
        </Button>
        <Button variant="outlined" color="error" size="small" onClick={() => setInitDialog(true)}>
          {t('page.tanazaoroshi.shelfRegistration.action.initialize')}
        </Button>
      </Box>

      {/* Initialize dialog */}
      <AppModal
        open={initDialog}
        onClose={() => setInitDialog(false)}
        title={t('page.tanazaoroshi.shelfRegistration.action.initialize')}
        actions={[
          { label: t('page.tanazaoroshi.shelfRegistration.dialog.no'), onClick: () => setInitDialog(false), color: 'inherit' },
          { label: t('page.tanazaoroshi.shelfRegistration.dialog.yes'), onClick: handleInitialize, variant: 'contained', color: 'error' },
        ]}
      >
        <Typography sx={{ fontSize: '0.9rem' }}>
          {t('page.tanazaoroshi.shelfRegistration.dialog.initConfirm')}
        </Typography>
      </AppModal>
    </Box>
  )
}

// ═══════════════════════════════════════════════════════════════
// B. Classification Settings Panel (棚卸分類設定)
// ═══════════════════════════════════════════════════════════════
function ClassificationPanel({ showToast }: { showToast: (msg: string, sev?: 'success' | 'error' | 'info') => void }) {
  const { t } = useTranslation()
  const [selected,    setSelected]    = useState<Set<string>>(new Set(['01', '02', '05', '06']))
  const [initDialog,  setInitDialog]  = useState(false)
  const [initialized, setInitialized] = useState(false)

  const total     = MOCK_CATEGORIES.length
  const doneCount    = MOCK_CATEGORIES.filter((c) => c.status === 'done').length
  const notDoneCount = MOCK_CATEGORIES.filter((c) => c.status === 'notDone').length

  const toggle = useCallback((id: string) =>
    setSelected((prev) => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n }), [])

  const handleInitialize = () => {
    setSelected(new Set()); setInitialized(true); setInitDialog(false)
    showToast(t('page.tanazaoroshi.classification.toast.initialized'), 'info')
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
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
      <Paper variant="outlined" sx={{ p: 1.5, bgcolor: 'warning.50', borderColor: 'warning.200' }}>
        <Typography sx={{ fontSize: '0.80rem', color: 'text.secondary' }}>
          ※ 新規に棚卸業務を開始するときは、必ず【初期化】キーを押して下さい。
        </Typography>
        <Typography sx={{ fontSize: '0.80rem', color: 'text.secondary', mt: 0.25 }}>
          ※ 実施月で絞込と、棚卸実施基準で指定されている小分類だけが表示されます。
        </Typography>
      </Paper>
      <Alert severity={initialized ? 'info' : 'warning'} sx={{ fontSize: '0.82rem' }}>
        {t('page.tanazaoroshi.classification.statusToast')}
      </Alert>

      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
        <Chip label={t('page.tanazaoroshi.classification.filterChip')} size="small" variant="outlined" color="primary" />
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
        <Button size="small" variant="outlined"
          onClick={() => setSelected(new Set(MOCK_CATEGORIES.map((c) => c.id)))}>
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
          onClick={() => showToast(t('page.tanazaoroshi.classification.toast.saved'))}
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
    </Box>
  )
}

// ═══════════════════════════════════════════════════════════════
// C. Handy Settings Panel (ハンディ設定)
// ═══════════════════════════════════════════════════════════════
function HandyPanel({ showToast }: { showToast: (msg: string, sev?: 'success' | 'error' | 'info') => void }) {
  const { t } = useTranslation()
  const [handyDevice, setHandyDevice] = useState('CASIO (DT-970)')
  const [dialogType,  setDialogType]  = useState<'none' | 'change' | 'appSend'>('none')

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, maxWidth: 520 }}>
      <Paper variant="outlined" sx={{ p: 2, display: 'flex', flexDirection: 'column', gap: 1.5 }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
          <Typography sx={{ fontSize: '0.82rem', color: 'text.secondary' }}>
            現在設定されているハンディ
          </Typography>
          <Select size="small" value={handyDevice} onChange={(e) => setHandyDevice(e.target.value)} sx={{ fontSize: '0.85rem' }}>
            {MOCK_HANDIES.map((h) => (
              <MenuItem key={h} value={h} sx={{ fontSize: '0.85rem' }}>{h}</MenuItem>
            ))}
          </Select>
        </Box>
        <Typography sx={{ fontSize: '0.82rem', color: 'text.secondary' }}>
          現在設定されている通信速度：<strong>9600 bps</strong>
        </Typography>
      </Paper>

      {/* Action buttons */}
      <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
        <Button variant="outlined" size="small" onClick={() => setDialogType('change')}>
          {t('page.tanazaoroshi.handy.handyChange')}
        </Button>
        <Button variant="outlined" size="small" onClick={() => setDialogType('appSend')}>
          {t('page.tanazaoroshi.handy.appSend')}
        </Button>
        <Button
          variant="contained" size="small" color="success"
          startIcon={<PlayArrowIcon fontSize="small" />}
          onClick={() => showToast('設定を保存しました。')}
        >
          {t('page.tanazaoroshi.handy.action.run')}
        </Button>
      </Box>

      {/* ハンディ変更 confirm dialog */}
      <AppModal
        open={dialogType === 'change'}
        onClose={() => setDialogType('none')}
        title="ハンディ変更"
        actions={[
          { label: 'キャンセル', onClick: () => setDialogType('none'), color: 'inherit' },
          { label: 'OK', onClick: () => { setDialogType('none'); showToast('ハンディを変更しました。') }, variant: 'contained' },
        ]}
      >
        <Typography sx={{ fontSize: '0.9rem' }}>ハンディ設定を変更しますか？</Typography>
      </AppModal>

      {/* アプリ送信 confirm dialog */}
      <AppModal
        open={dialogType === 'appSend'}
        onClose={() => setDialogType('none')}
        title="アプリ送信"
        actions={[
          { label: 'キャンセル', onClick: () => setDialogType('none'), color: 'inherit' },
          { label: 'OK', onClick: () => { setDialogType('none'); showToast('アプリ送受信が完了しました。') }, variant: 'contained' },
        ]}
      >
        <Typography sx={{ fontSize: '0.9rem' }}>アプリの送受信を行いますか？</Typography>
      </AppModal>
    </Box>
  )
}
