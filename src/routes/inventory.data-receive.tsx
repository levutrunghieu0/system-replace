import { createFileRoute } from '@tanstack/react-router'
import { useState, useMemo } from 'react'
import type { ColumnDef } from '@tanstack/react-table'
import Alert from '@mui/material/Alert'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Paper from '@mui/material/Paper'
import Snackbar from '@mui/material/Snackbar'
import Typography from '@mui/material/Typography'
import DownloadingIcon from '@mui/icons-material/Downloading'
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutlined'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import CancelIcon from '@mui/icons-material/Cancel'
import WarningAmberIcon from '@mui/icons-material/WarningAmber'
import { useTranslation } from 'react-i18next'
import { AppTable } from '../components/table'
import { AppModal } from '../components/common/AppModal'
import { useLayoutConfig } from '../hooks/useLayoutConfig'

export const Route = createFileRoute('/inventory/data-receive')({
  component: DataReceivePage,
})

interface ReceivedItem {
  no: number
  shelfNo: string
  code: string
  name: string
  status: string
  quantity: number
  subCategory: string
}

const MOCK_RECEIVED: ReceivedItem[] = [
  { no: 1,  shelfNo: '3001-01', code: '5040109', name: 'アイシールド２１ マックス デビル A',      status: '1', quantity: 1,  subCategory: 'リサイクルコスト-05' },
  { no: 2,  shelfNo: '3001-02', code: '4912345', name: 'ワンピース コミック 101巻',               status: '1', quantity: 3,  subCategory: 'コミック-01' },
  { no: 3,  shelfNo: '3001-03', code: '4823001', name: 'ドラゴンボール超 15巻',                  status: '1', quantity: 2,  subCategory: 'コミック-01' },
  { no: 4,  shelfNo: '3001-04', code: '4730055', name: 'ナルト 特別版',                          status: '※', quantity: 1,  subCategory: 'コミック-01' },
  { no: 5,  shelfNo: '3001-05', code: '5120088', name: 'HUNTER×HUNTER 37巻',                   status: '1', quantity: 5,  subCategory: 'コミック-01' },
  { no: 6,  shelfNo: '3002-01', code: '6034521', name: 'ニンテンドースイッチ 本体',                status: '1', quantity: 2,  subCategory: 'ゲーム機器-08' },
  { no: 7,  shelfNo: '3002-02', code: '6034522', name: 'ゼルダの伝説 ティアーズオブザキングダム', status: '1', quantity: 4,  subCategory: 'ゲームソフト-08' },
  { no: 8,  shelfNo: '3002-03', code: '6034523', name: 'マリオカート8 デラックス',               status: '1', quantity: 3,  subCategory: 'ゲームソフト-08' },
  { no: 9,  shelfNo: '3002-04', code: '6034524', name: 'スプラトゥーン3',                        status: '×', quantity: 1,  subCategory: 'ゲームソフト-08' },
  { no: 10, shelfNo: '3002-05', code: '6034525', name: 'ポケットモンスター スカーレット',          status: '1', quantity: 6,  subCategory: 'ゲームソフト-08' },
  { no: 11, shelfNo: '3003-01', code: '7010011', name: 'アディダス スニーカー 26cm',             status: '1', quantity: 1,  subCategory: 'シューズ-05' },
  { no: 12, shelfNo: '3003-02', code: '7010012', name: 'ナイキ エアマックス 27cm',               status: '1', quantity: 2,  subCategory: 'シューズ-05' },
  { no: 13, shelfNo: '3003-03', code: '7010013', name: 'コンバース オールスター 25cm',           status: '1', quantity: 4,  subCategory: 'シューズ-05' },
  { no: 14, shelfNo: '3003-04', code: '7010014', name: 'ニューバランス 574 26.5cm',              status: '※', quantity: 2,  subCategory: 'シューズ-05' },
  { no: 15, shelfNo: '3003-05', code: '7010015', name: 'バンズ オールドスクール 26cm',           status: '1', quantity: 3,  subCategory: 'シューズ-05' },
  { no: 16, shelfNo: '3004-01', code: '8021001', name: 'ユニクロ ヒートテック Mサイズ',          status: '1', quantity: 10, subCategory: '衣料（婦人）-01' },
  { no: 17, shelfNo: '3004-02', code: '8021002', name: 'ユニクロ フリース パーカー Lサイズ',     status: '1', quantity: 5,  subCategory: '衣料（紳士）-02' },
  { no: 18, shelfNo: '3004-03', code: '8021003', name: 'GU デニムパンツ スリム 32インチ',        status: '1', quantity: 3,  subCategory: '衣料（紳士）-02' },
  { no: 19, shelfNo: '3004-04', code: '8021004', name: 'ZARAワンピース フローラル M',            status: '×', quantity: 1,  subCategory: '衣料（婦人）-01' },
  { no: 20, shelfNo: '3004-05', code: '8021005', name: 'H&Mトレンチコート Sサイズ',             status: '1', quantity: 2,  subCategory: '衣料（婦人）-01' },
]

function DataReceivePage() {
  const { t } = useTranslation()
  const [confirmDialog, setConfirmDialog] = useState(false)
  const [received, setReceived] = useState(false)
  const [receivedAt, setReceivedAt] = useState('')
  const [toast, setToast] = useState({ open: false, message: '' })

  useLayoutConfig({
    title: t('page.tanazaoroshi.dataReceive.title'),
  })

  const handleReceive = () => {
    setConfirmDialog(false)
    setTimeout(() => {
      setReceived(true)
      setReceivedAt(new Date().toLocaleString('ja-JP'))
      setToast({ open: true, message: t('page.tanazaoroshi.dataReceive.toast.received') })
    }, 800)
  }

  const columns = useMemo<ColumnDef<ReceivedItem>[]>(() => [
    {
      accessorKey: 'no',
      header: 'No.',
      size: 48,
      cell: ({ getValue }) => <Typography sx={{ fontSize: '0.78rem' }}>{getValue<number>()}</Typography>,
      meta: { headerSx: { fontSize: '0.72rem', fontWeight: 600, color: 'text.secondary', px: 1 }, cellSx: { py: 0.5, px: 1 } },
    },
    {
      accessorKey: 'shelfNo',
      header: '仕掛No.棚段',
      size: 90,
      cell: ({ getValue }) => <Typography sx={{ fontSize: '0.78rem' }}>{getValue<string>()}</Typography>,
      meta: { headerSx: { fontSize: '0.72rem', fontWeight: 600, color: 'text.secondary', px: 1 }, cellSx: { py: 0.5, px: 1 } },
    },
    {
      accessorKey: 'code',
      header: 'コード',
      size: 80,
      cell: ({ getValue }) => <Typography sx={{ fontSize: '0.78rem', fontFamily: 'monospace' }}>{getValue<string>()}</Typography>,
      meta: { headerSx: { fontSize: '0.72rem', fontWeight: 600, color: 'text.secondary', px: 1 }, cellSx: { py: 0.5, px: 1 } },
    },
    {
      accessorKey: 'name',
      header: '品名',
      cell: ({ getValue }) => <Typography sx={{ fontSize: '0.78rem' }}>{getValue<string>()}</Typography>,
      meta: { headerSx: { fontSize: '0.72rem', fontWeight: 600, color: 'text.secondary', px: 1 }, cellSx: { py: 0.5, px: 1 } },
    },
    {
      accessorKey: 'status',
      header: '状態',
      size: 52,
      enableSorting: true,
      sortingFn: (rowA, rowB) => {
        const order: Record<string, number> = { '1': 0, '※': 1, '×': 2 }
        return (order[rowA.original.status] ?? 3) - (order[rowB.original.status] ?? 3)
      },
      cell: ({ getValue }) => {
        const v = getValue<string>()
        if (v === '1') return <CheckCircleIcon sx={{ fontSize: '1rem', color: 'success.main', display: 'block' }} />
        if (v === '×') return <CancelIcon     sx={{ fontSize: '1rem', color: 'error.main',   display: 'block' }} />
        return <WarningAmberIcon sx={{ fontSize: '1rem', color: 'warning.main', display: 'block' }} />
      },
      meta: { headerSx: { fontSize: '0.72rem', fontWeight: 600, color: 'text.secondary', px: 1, textAlign: 'center' }, cellSx: { py: 0.5, px: 1, textAlign: 'center' } },
    },
    {
      accessorKey: 'quantity',
      header: '数量',
      size: 60,
      cell: ({ getValue }) => (
        <Typography sx={{ fontSize: '0.78rem', textAlign: 'right' }}>{getValue<number>()}</Typography>
      ),
      meta: { headerSx: { fontSize: '0.72rem', fontWeight: 600, color: 'text.secondary', px: 1 }, cellSx: { py: 0.5, px: 1, textAlign: 'right' } },
    },
    {
      accessorKey: 'subCategory',
      header: '小分類',
      size: 140,
      cell: ({ getValue }) => <Typography sx={{ fontSize: '0.78rem' }}>{getValue<string>()}</Typography>,
      meta: { headerSx: { fontSize: '0.72rem', fontWeight: 600, color: 'text.secondary', px: 1 }, cellSx: { py: 0.5, px: 1 } },
    },
  ], [])

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      {!received ? (
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
          <DownloadingIcon sx={{ fontSize: 56, color: 'text.disabled' }} />
          <Typography sx={{ fontSize: '0.85rem', color: 'text.secondary' }}>
            ハンディスキャナのデータを受信するには「受信」ボタンを押してください。
          </Typography>
        </Paper>
      ) : (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <CheckCircleOutlineIcon sx={{ fontSize: 20, color: 'success.main' }} />
            <Typography sx={{ fontWeight: 700, fontSize: '0.9rem', color: 'success.main' }}>
              データ受信完了
            </Typography>
            <Typography sx={{ fontSize: '0.80rem', color: 'text.secondary' }}>
              受信日時：{receivedAt}
            </Typography>
          </Box>

          <Typography sx={{ fontSize: '0.78rem', color: 'text.secondary' }}>
            ※ OK欄に「×」…スキャン時にエラー　「※」…棚卸対象外小分類商品
          </Typography>

          <AppTable<ReceivedItem>
            data={MOCK_RECEIVED}
            columns={columns}
            getRowId={(row) => String(row.no)}
            stickyHeader
            sorting
            containerMaxHeight={440}
            dense
          />
        </Box>
      )}

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
